#include "Server.h"
#include "Utils.h"
#include <nlohmann/json.hpp>
#include <fmt/core.h>
#include <iostream>
#include <crow.h>

using json = nlohmann::json;

crow::response add_cors_headers(crow::response&& res) {
  res.add_header("Access-Control-Allow-Origin", "*");
  res.add_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.add_header("Access-Control-Allow-Headers", "Content-Type");
  return std::move(res);
}

Server::Server(Map& map) : map_(map) {
  setup_routes();
}

void Server::setup_routes() {
  // Handle CORS preflight requests
  CROW_ROUTE(app_, "/<path>")
  .methods(crow::HTTPMethod::OPTIONS)
  ([](const crow::request&, crow::response& res, std::string /*path*/) {
    res.add_header("Access-Control-Allow-Origin", "*");
    res.add_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.add_header("Access-Control-Allow-Headers", "Content-Type");
    res.end();
  });

  // 路由：获取地图数据
  CROW_ROUTE(app_, "/map")
  ([this]() -> crow::response {
    json j;
    // 添加节点
    for (const auto& [id, node] : map_.get_nodes()) {
      j["nodes"].push_back({
        {"id", id},
        {"lat", node.lat},
        {"lon", node.lon}
      });
    }

    // 添加边
    for (const auto& [from, edges] : map_.get_adj()) {
      for (const auto& edge : edges) {
        // 为避免重复边，确保from < to
        if (from < edge.to) {
          j["edges"].push_back({
            {"from", from},
            {"to", edge.to},
            {"weight", edge.weight}
          });
        }
      }
    }

    return add_cors_headers(Utils::json_to_response(j));
  });

  // 路由：计算最短路径
  CROW_ROUTE(app_, "/shortest_path")
  .methods(crow::HTTPMethod::GET)
  ([this](const crow::request& req) -> crow::response {
    auto start_param = req.url_params.get("start");
    auto end_param = req.url_params.get("end");

    if (!start_param || !end_param) {
      return crow::response(400, "Missing 'start' or 'end' parameter");
    }

    NodeId start_id, end_id;
    try {
      start_id = std::stol(start_param);
      end_id = std::stol(end_param);
    }
    catch (const std::exception& e) {
      return crow::response(400, "Invalid 'start' or 'end' parameter format");
    }

    // 检查节点是否存在
    if (map_.get_nodes().find(start_id) == map_.get_nodes().end() ||
      map_.get_nodes().find(end_id) == map_.get_nodes().end()) {
      return crow::response(400, "Invalid 'start' or 'end' node ID");
    }

    // 计算最短路径
    std::vector<NodeId> path = map_.shortest_path(start_id, end_id);
    if (path.empty()) {
      return crow::response(404, "No path found");
    }

    // 返回路径
    json j;
    for (NodeId id : path) {
      const auto& node = map_.get_nodes().at(id);
      j["path"].push_back({
        {"id", id},
        {"lat", node.lat},
        {"lon", node.lon}
      });
    }
    
    return add_cors_headers(Utils::json_to_response(j));
  });

  // 路由：计算从一个点到多个点的最短路径
  CROW_ROUTE(app_, "/shortest_paths")
  .methods(crow::HTTPMethod::GET)
  ([this](const crow::request& req) -> crow::response {
    auto start_param = req.url_params.get("start");
    auto ends_param = req.url_params.get("ends");

    if (!start_param || !ends_param) {
      return crow::response(400, "Missing 'start' or 'ends' parameter");
    }

    NodeId start_id;
    std::vector<NodeId> end_ids;
    try {
      start_id = std::stol(start_param);
      std::stringstream ss(ends_param);
      std::string item;
      while (std::getline(ss, item, ',')) {
        end_ids.push_back(std::stol(item));
      }
    }
    catch (const std::exception& e) {
      return crow::response(400, "Invalid 'start' or 'ends' parameter format");
    }

    // 检查节点是否存在
    if (map_.get_nodes().find(start_id) == map_.get_nodes().end()) {
      return crow::response(400, "Invalid 'start' node ID");
    }
    for (const auto& end_id : end_ids) {
      if (map_.get_nodes().find(end_id) == map_.get_nodes().end()) {
        return crow::response(400, "Invalid 'end' node ID: " + std::to_string(end_id));
      }
    }

    // 计算最短路径
    auto paths = map_.shortest_paths(start_id, end_ids);
    json j;
    for (const auto& [end_id, path] : paths) {
      json path_json;
      for (NodeId id : path) {
        const auto& node = map_.get_nodes().at(id);
        path_json.push_back({
          {"id", id},
          {"lat", node.lat},
          {"lon", node.lon}
        });
      }
      j["paths"][std::to_string(end_id)] = path_json;
    }

    return add_cors_headers(Utils::json_to_response(j));
  });

  // 路由：查询最近的点
  CROW_ROUTE(app_, "/nearest_point")
  .methods(crow::HTTPMethod::GET)
  ([this](const crow::request& req) -> crow::response {
    auto lat_param = req.url_params.get("lat");
    auto lon_param = req.url_params.get("lon");

    if (!lat_param || !lon_param) {
      return crow::response(400, "Missing 'lat' or 'lon' parameter");
    }

    double lat, lon;
    try {
      lat = std::stod(lat_param);
      lon = std::stod(lon_param);
    }
    catch (const std::exception& e) {
      return crow::response(400, "Invalid 'lat' or 'lon' parameter format");
    }

    NodeId nearest_id = map_.nearest_point(lat, lon);
    if (nearest_id == -1) {
      return crow::response(404, "No nearest point found");
    }

    json j;
    j["nearest_point"] = nearest_id;
    return add_cors_headers(Utils::json_to_response(j));
  });

  // 路由：搜索位置
  CROW_ROUTE(app_, "/search_location")
  .methods(crow::HTTPMethod::GET)
  ([this](const crow::request& req) -> crow::response {
    auto query_param = req.url_params.get("query");

    if (!query_param) {
      return crow::response(400, "Missing 'query' parameter");
    }

    std::string query = query_param;
    auto [lat, lon] = map_.search_location(query);

    if (lat == 0.0 && lon == 0.0) {
      return crow::response(404, "No matching location found");
    }

    nlohmann::json j;
    j["lat"] = lat;
    j["lon"] = lon;
    return add_cors_headers(Utils::json_to_response(j));
  });
}

void Server::run(int port, bool multithreaded) {
  fmt::print("Starting server on http://0.0.0.0:{}\n", port);
  app_.port(port);
  if (multithreaded) {
    app_.multithreaded();
  }
  app_.run();
}
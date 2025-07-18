#include "Map.h"
#include "Utils.h"
#include "Quadtree.h" // Add this include
#include <pugixml.hpp>
#include <iostream>
#include <queue>
#include <limits>
#include <algorithm>
#include <unordered_set>
#include <chrono>  // 添加此引用

// 世界边界
static const BoundingBox WORLD_BOUNDARY = { -90.0, -180.0, 90.0, 180.0 };

// 加载 OSM 文件
bool Map::load_osm(const std::string& filename) {
    pugi::xml_document doc;
    pugi::xml_parse_result result = doc.load_file(filename.c_str());

    if (!result) {
        std::cerr << "无法加载 " << filename << ": " << result.description() << std::endl;
        return false;
    }

    // 初始化四叉树
    quadtree_ = std::make_unique<Quadtree>(WORLD_BOUNDARY, 8); // 每个节点最多存8个点，可根据需要调整

    // 解析节点
    for (auto node : doc.select_nodes("//node")) {
        auto n = node.node();
        NodeId id = n.attribute("id").as_llong();
        double lat = n.attribute("lat").as_double();
        double lon = n.attribute("lon").as_double();

        // 默认等级
        Utils::HighwayLevel h_level = Utils::HighwayLevel::Unknown;

        std::string name;
        // 解析标签
        for (auto tag : n.select_nodes("tag")) {
            auto t = tag.node();
            std::string key = t.attribute("k").as_string();
            std::string value = t.attribute("v").as_string();

            if (key == "highway") {
                h_level = Utils::parse_highway_level(value);
            }
            if (key == "name") {
                name = value;
            }
            if (key == "tourism" && value == "hotel") {
                hotel_nodes_.push_back(id);
                hotel_names_[id] = name; // Store hotel name
            }
        }

        nodes_[id] = Node{ id, lat, lon, h_level };

        if (!name.empty()) {
            named_nodes_.emplace_back(name, nodes_[id]);
        }
    }

    // 解析道路（ways）
    for (auto way : doc.select_nodes("//way[tag[@k='highway']]")) {
        auto w = way.node();

        // 获取所有节点引用
        std::vector<NodeId> way_nodes;
        for (auto nd : w.select_nodes("nd")) {
            way_nodes.emplace_back(nd.node().attribute("ref").as_llong());
        }

        // 根据节点顺序创建边（双向）
        for (size_t i = 0; i < way_nodes.size() - 1; ++i) {
            NodeId from = way_nodes[i];
            NodeId to = way_nodes[i + 1];
            if (nodes_.find(from) == nodes_.end() || nodes_.find(to) == nodes_.end()) {
                continue; // 跳过无效节点
            }
            double distance = Utils::haversine(
                nodes_[from].lat, nodes_[from].lon,
                nodes_[to].lat, nodes_[to].lon
            );
            adj_[from].emplace_back(Edge{ to, distance });
            adj_[to].emplace_back(Edge{ from, distance });

            // 插入四叉树
            QuadNodeData data_from{ from, nodes_[from].lat, nodes_[from].lon, nodes_[from].highway_level };
            QuadNodeData data_to{ to, nodes_[to].lat, nodes_[to].lon, nodes_[to].highway_level };
            quadtree_->insert(data_from);
            quadtree_->insert(data_to);
        }
    }

    // 解析建筑（ways）
    for (auto way : doc.select_nodes("//way[tag[@k='tourism' and @v='hotel']]")) {
        auto w = way.node();
        std::string name;
        NodeId hotel_id = -1;

        // 获取所有节点引用
        for (auto nd : w.select_nodes("nd")) {
            hotel_id = nd.node().attribute("ref").as_llong();
        }

        // 获取酒店名称
        for (auto tag : w.select_nodes("tag")) {
            auto t = tag.node();
            std::string key = t.attribute("k").as_string();
            std::string value = t.attribute("v").as_string();

            if (key == "name") {
                name = value;
            }
        }

        if (hotel_id != -1 && !name.empty()) {
            hotel_nodes_.push_back(hotel_id);
            hotel_names_[hotel_id] = name;
        }
    }

    std::cout << "加载了 " << nodes_.size() << " 个节点和 " << adj_.size() << " 条边。" << std::endl;
    compute_hotel_data(); // Compute hotel data after loading OSM data
    return true;
}

void Map::compute_hotel_data() {
    for (const auto& hotel_id : hotel_nodes_) {
        const auto& hotel_node = nodes_.at(hotel_id);
        NodeId nearest_road_node_id = nearest_point(hotel_node.lat, hotel_node.lon);
        hotel_data_["hotel_nodes"].push_back({
            {"hotel_id", hotel_id},
            {"name", hotel_names_[hotel_id]},
            {"lat", hotel_node.lat},
            {"lon", hotel_node.lon},
            {"nearest_road_node_id", nearest_road_node_id}
        });
    }
}

const nlohmann::json& Map::get_hotel_data() const {
    return hotel_data_;
}

// 实现 Dijkstra 算法计算最短路径
std::vector<NodeId> Map::shortest_path(NodeId start_id, NodeId end_id) {
    auto start_time = std::chrono::high_resolution_clock::now();  // 开始计时

    std::unordered_map<NodeId, double> g_score;
    std::unordered_map<NodeId, double> f_score;
    std::unordered_map<NodeId, NodeId> previous;

    g_score.reserve(nodes_.size());
    f_score.reserve(nodes_.size());

    for (const auto& [id, node] : nodes_) {
        g_score[id] = std::numeric_limits<double>::infinity();
        f_score[id] = std::numeric_limits<double>::infinity();
    }
    g_score[start_id] = 0.0;
    f_score[start_id] = Utils::haversine(nodes_[start_id].lat, nodes_[start_id].lon, nodes_[end_id].lat, nodes_[end_id].lon);

    using PQElement = std::pair<double, NodeId>;
    std::priority_queue<PQElement, std::vector<PQElement>, std::greater<PQElement>> pq;
    pq.emplace(f_score[start_id], start_id);

    std::unordered_set<NodeId> visited;

    while (!pq.empty()) {
        auto [current_f, current] = pq.top();
        pq.pop();

        if (visited.find(current) != visited.end()) {
            continue;
        }
        visited.insert(current);

        if (current == end_id) break;

        for (const auto& edge : adj_[current]) {
            double tentative_g = g_score[current] + edge.weight;
            if (tentative_g < g_score[edge.to]) {
                previous[edge.to] = current;
                g_score[edge.to] = tentative_g;
                f_score[edge.to] = tentative_g + Utils::haversine(nodes_[edge.to].lat, nodes_[edge.to].lon, nodes_[end_id].lat, nodes_[end_id].lon);
                pq.emplace(f_score[edge.to], edge.to);
            }
        }
    }

    // 回溯路径
    std::vector<NodeId> path;
    if (g_score[end_id] == std::numeric_limits<double>::infinity()) {
        // 无路径
        return path;
    }

    for (NodeId at = end_id; at != start_id; at = previous[at]) {
        path.emplace_back(at);
    }
    path.emplace_back(start_id);
    std::reverse(path.begin(), path.end());

    // 在返回路径之前添加
    auto end_time = std::chrono::high_resolution_clock::now();  // 结束计时
    std::chrono::duration<double> elapsed = end_time - start_time;
    std::cout << "运行时间: " << elapsed.count() << " 秒" << std::endl;

    return path;
}

std::unordered_map<NodeId, std::vector<NodeId>> Map::shortest_paths(NodeId start_id, const std::vector<NodeId>& end_ids) {
  std::unordered_map<NodeId, double> dist;
  std::unordered_map<NodeId, NodeId> prev;
  std::unordered_set<NodeId> end_set(end_ids.begin(), end_ids.end());

  for (const auto& [id, node] : nodes_) {
    dist[id] = std::numeric_limits<double>::infinity();
  }
  dist[start_id] = 0.0;

  using PQElement = std::pair<double, NodeId>;
  std::priority_queue<PQElement, std::vector<PQElement>, std::greater<PQElement>> pq;
  pq.emplace(0.0, start_id);

  while (!pq.empty()) {
    auto [current_dist, current] = pq.top();
    pq.pop();

    if (end_set.find(current) != end_set.end()) {
      end_set.erase(current);
      if (end_set.empty()) break;
    }

    for (const auto& edge : adj_[current]) {
      double new_dist = current_dist + edge.weight;
      if (new_dist < dist[edge.to]) {
        dist[edge.to] = new_dist;
        prev[edge.to] = current;
        pq.emplace(new_dist, edge.to);
      }
    }
  }

  std::unordered_map<NodeId, std::vector<NodeId>> paths;
  for (const auto& end_id : end_ids) {
    std::vector<NodeId> path;
    for (NodeId at = end_id; at != start_id; at = prev[at]) {
      path.emplace_back(at);
    }
    path.emplace_back(start_id);
    std::reverse(path.begin(), path.end());
    paths[end_id] = path;
  }

  return paths;
}

// 获取所有节点
const std::unordered_map<NodeId, Node>& Map::get_nodes() const {
    return nodes_;
}

// 获取邻接表
const std::unordered_map<NodeId, std::vector<Edge>>& Map::get_adj() const {
    return adj_;
}

// 区域查询
std::vector<Node> Map::query_region(double min_lat, double min_lon, double max_lat, double max_lon, Utils::HighwayLevel min_level) {
    BoundingBox query_box{ min_lat, min_lon, max_lat, max_lon };
    std::vector<QuadNodeData> quadtree_results = quadtree_->query(query_box);

    std::vector<Node> result;
    for (const auto& qn : quadtree_results) {
        const Node& node = nodes_.at(qn.id);
        // 根据等级过滤
        if (min_level != Utils::HighwayLevel::Unknown && node.highway_level > min_level) {
            continue;
        }
        result.emplace_back(node);
    }
    return result;
}

NodeId Map::nearest_point(double lat, double lon) const {
    return quadtree_->nearest_point(lat, lon);
}

std::pair<double, double> Map::search_location(const std::string& query) const {
    size_t max_match_length = 0;
    const Node* best_match = nullptr;

    for (const auto& [name, node] : named_nodes_) {
        size_t match_length = 0;
        for (size_t i = 0; std::min(name.size(), query.size()); ++i) {
            if (name[i] == query[i]) {
                ++match_length;
            } else {
                break;
            }
        }
        if (match_length > max_match_length) {
            max_match_length = match_length;
            best_match = &node;
        }
    }

    if (best_match) {
        return {best_match->lat, best_match->lon};
    } else {
        return {0.0, 0.0}; // or some indication of no match found
    }
}

std::vector<NodeId> Map::get_hotel_nodes() const {
    return hotel_nodes_;
}
#pragma once

#include <unordered_map>
#include <vector>
#include <string>

#include "Utils.h"
#include "Quadtree.h" // Ensure this include is present

class Quadtree; // Forward declaration of Quadtree class

typedef long long NodeId;

// 定义地理坐标结构
struct Node {
  NodeId id;
  double lat;
  double lon;
  Utils::HighwayLevel highway_level;
};

// 定义道路连接关系
struct Edge {
  NodeId to;
  double weight; // 基于距离或其他权重
};

class Map {
public:
  // 加载OSM文件并解析节点和道路
  bool load_osm(const std::string& filename);

  // 计算两点之间的最短路径（Dijkstra算法）
  std::vector<NodeId> shortest_path(NodeId start_id, NodeId end_id);

  // 计算起点到多个终点的最短路径
  std::unordered_map<NodeId, std::vector<NodeId>> shortest_paths(NodeId start_id, const std::vector<NodeId>& end_ids);

  // 获取所有节点
  const std::unordered_map<NodeId, Node>& get_nodes() const;

  // 获取图的邻接表
  const std::unordered_map<NodeId, std::vector<Edge>>& get_adj() const;

  // 区域查询
  std::vector<Node> query_region(double min_lat, double min_lon, double max_lat, double max_lon, Utils::HighwayLevel min_level = Utils::HighwayLevel::Unknown);

  NodeId nearest_point(double lat, double lon) const;

  std::pair<double, double> search_location(const std::string& query) const;

private:
  std::unordered_map<NodeId, Node> nodes_;
  std::unordered_map<NodeId, std::vector<Edge>> adj_;

  std::unique_ptr<Quadtree> quadtree_;

  std::vector<std::pair<std::string, Node>> named_nodes_;
};

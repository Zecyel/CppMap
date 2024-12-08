#pragma once

#include <vector>
#include <memory>
#include <functional>
#include "Utils.h"
#include "Map.h"

typedef long long NodeId; // Add this line

// 定义地理边界
struct BoundingBox {
    double min_lat;
    double min_lon;
    double max_lat;
    double max_lon;

    // 检查点是否在边界内
    bool contains(double lat, double lon) const;

    // 检查两个边界是否相交
    bool intersects(const BoundingBox& other) const;
};

// 存储四叉树节点的数据
struct QuadNodeData {
    long id;
    double lat;
    double lon;
    Utils::HighwayLevel highway_level;
    // 可以根据需要添加其他属性，如建筑等级
};

// 四叉树节点类
class QuadtreeNode {
public:
    QuadtreeNode(const BoundingBox& boundary, int capacity = 4);

    // 插入数据
    bool insert(const QuadNodeData& data);

    // 查询指定范围内的数据
    void query(const BoundingBox& range, std::vector<QuadNodeData>& found) const;

private:
    BoundingBox boundary_;
    int capacity_;
    bool divided_;
    std::vector<QuadNodeData> points_;

    std::unique_ptr<QuadtreeNode> northeast_;
    std::unique_ptr<QuadtreeNode> northwest_;
    std::unique_ptr<QuadtreeNode> southeast_;
    std::unique_ptr<QuadtreeNode> southwest_;

    // 分割当前节点
    void subdivide();

    friend class Quadtree; // Add this line
};

// 四叉树接口类
class Quadtree {
public:
    Quadtree(const BoundingBox& boundary, int capacity = 4);

    // 插入数据
    bool insert(const QuadNodeData& data);

    // 查询指定范围内的数据
    std::vector<QuadNodeData> query(const BoundingBox& range) const;

    NodeId nearest_point(double lat, double lon) const;

private:
    std::unique_ptr<QuadtreeNode> root_;

    NodeId nearest_point(const QuadtreeNode* node, double lat, double lon, double& min_dist) const;
};

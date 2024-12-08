#include "Quadtree.h"
#include <cmath>

// 实现 BoundingBox 成员函数
bool BoundingBox::contains(double lat, double lon) const {
    return lat >= min_lat && lat <= max_lat &&
           lon >= min_lon && lon <= max_lon;
}

bool BoundingBox::intersects(const BoundingBox& other) const {
    return !(other.min_lon > max_lon ||
             other.max_lon < min_lon ||
             other.min_lat > max_lat ||
             other.max_lat < min_lat);
}

// QuadtreeNode 构造函数
QuadtreeNode::QuadtreeNode(const BoundingBox& boundary, int capacity)
    : boundary_(boundary), capacity_(capacity), divided_(false) {}

// 插入数据
bool QuadtreeNode::insert(const QuadNodeData& data) {
    if (!boundary_.contains(data.lat, data.lon)) {
        return false;
    }

    if (points_.size() < capacity_) {
        points_.emplace_back(data);
        return true;
    }

    if (!divided_) {
        subdivide();
    }

    if (northeast_->insert(data)) return true;
    if (northwest_->insert(data)) return true;
    if (southeast_->insert(data)) return true;
    if (southwest_->insert(data)) return true;

    return false;
}

// 分割节点
void QuadtreeNode::subdivide() {
    double mid_lat = (boundary_.min_lat + boundary_.max_lat) / 2.0;
    double mid_lon = (boundary_.min_lon + boundary_.max_lon) / 2.0;

    BoundingBox ne = { mid_lat, mid_lon, boundary_.max_lat, boundary_.max_lon };
    northeast_ = std::make_unique<QuadtreeNode>(ne, capacity_);

    BoundingBox nw = { mid_lat, boundary_.min_lon, boundary_.max_lat, mid_lon };
    northwest_ = std::make_unique<QuadtreeNode>(nw, capacity_);

    BoundingBox se = { boundary_.min_lat, mid_lon, mid_lat, boundary_.max_lon };
    southeast_ = std::make_unique<QuadtreeNode>(se, capacity_);

    BoundingBox sw = { boundary_.min_lat, boundary_.min_lon, mid_lat, mid_lon };
    southwest_ = std::make_unique<QuadtreeNode>(sw, capacity_);

    divided_ = true;
}

// 查询数据
void QuadtreeNode::query(const BoundingBox& range, std::vector<QuadNodeData>& found) const {
    if (!boundary_.intersects(range)) {
        return;
    }

    for (const auto& p : points_) {
        if (range.contains(p.lat, p.lon)) {
            found.emplace_back(p);
        }
    }

    if (divided_) {
        northeast_->query(range, found);
        northwest_->query(range, found);
        southeast_->query(range, found);
        southwest_->query(range, found);
    }
}

// Quadtree 构造函数
Quadtree::Quadtree(const BoundingBox& boundary, int capacity)
    : root_(std::make_unique<QuadtreeNode>(boundary, capacity)) {}

// 插入数据
bool Quadtree::insert(const QuadNodeData& data) {
    return root_->insert(data);
}

// 查询数据
std::vector<QuadNodeData> Quadtree::query(const BoundingBox& range) const {
    std::vector<QuadNodeData> found;
    root_->query(range, found);
    return found;
}

NodeId Quadtree::nearest_point(double lat, double lon) const {
    double min_dist = std::numeric_limits<double>::infinity();
    return nearest_point(root_.get(), lat, lon, min_dist);
}

NodeId Quadtree::nearest_point(const QuadtreeNode* node, double lat, double lon, double& min_dist) const {
    if (!node->boundary_.contains(lat, lon)) {
        double dx = std::max({node->boundary_.min_lon - lon, 0.0, lon - node->boundary_.max_lon});
        double dy = std::max({node->boundary_.min_lat - lat, 0.0, lat - node->boundary_.max_lat});
        double dist_to_boundary = std::hypot(dx, dy);
        if (dist_to_boundary > min_dist) {
            return -1;
        }
    }

    NodeId nearest_id = -1;
    for (const auto& point : node->points_) {
        double dist = std::hypot(point.lat - lat, point.lon - lon);
        if (dist < min_dist) {
            min_dist = dist;
            nearest_id = point.id;
        }
    }

    if (node->divided_) {
        NodeId ne_id = nearest_point(node->northeast_.get(), lat, lon, min_dist);
        NodeId nw_id = nearest_point(node->northwest_.get(), lat, lon, min_dist);
        NodeId se_id = nearest_point(node->southeast_.get(), lat, lon, min_dist);
        NodeId sw_id = nearest_point(node->southwest_.get(), lat, lon, min_dist);

        if (ne_id != -1) nearest_id = ne_id;
        if (nw_id != -1) nearest_id = nw_id;
        if (se_id != -1) nearest_id = se_id;
        if (sw_id != -1) nearest_id = sw_id;
    }

    return nearest_id;
}

#include "Utils.h"
#include <cmath> // Add this include

namespace Utils {
  double haversine(double lat1, double lon1, double lat2, double lon2) {
    const double R = 6371000; // 地球半径，米
    double dLat = deg2rad(lat2 - lat1);
    double dLon = deg2rad(lon2 - lon1);
    double a = std::sin(dLat / 2) * std::sin(dLat / 2) +
               std::cos(deg2rad(lat1)) * std::cos(deg2rad(lat2)) *
               std::sin(dLon / 2) * std::sin(dLon / 2);
    double c = 2 * std::atan2(std::sqrt(a), std::sqrt(1 - a));
    return R * c;
  }

  crow::response json_to_response(const nlohmann::json& j, int status_code) {
    crow::response res;
    res.code = status_code;
    res.set_header("Content-Type", "application/json");
    res.write(j.dump());
    return res;
  }

  // 工具函数，转换字符串到枚举
  Utils::HighwayLevel parse_highway_level(const std::string& type) {
    if (type == "primary") return Utils::HighwayLevel::Primary;
    if (type == "secondary") return Utils::HighwayLevel::Secondary;
    if (type == "tertiary") return Utils::HighwayLevel::Tertiary;
    if (type == "pedestrian") return Utils::HighwayLevel::Pedestrian;
    if (type == "service") return Utils::HighwayLevel::Service;
    if (type == "footway") return Utils::HighwayLevel::Footway;
    if (type == "residential") return Utils::HighwayLevel::Residential;
    if (type == "path") return Utils::HighwayLevel::Path;
    if (type == "motorway") return Utils::HighwayLevel::Motorway;
    if (type == "motorway_link") return Utils::HighwayLevel::MotorwayLink;

    return Utils::HighwayLevel::Unknown;
  }
}
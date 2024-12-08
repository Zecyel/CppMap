#pragma once
#include <cmath>
#include <nlohmann/json.hpp>
#include <crow.h>

namespace Utils {
  // 将角度转换为弧度
  inline double deg2rad(double deg) {
    return deg * M_PI / 180.0;
  }

  // Haversine公式计算两点间距离，返回米
  double haversine(double lat1, double lon1, double lat2, double lon2);

  // 将nlohmann::json转换为crow::response
  crow::response json_to_response(const nlohmann::json& j, int status_code = 200);


  enum class HighwayLevel {
    Primary,
    Secondary,
    Tertiary,
    Pedestrian, // Fix typo
    Service,
    Footway,
    Residential,
    Path,
    Motorway,
    MotorwayLink,
    Unknown
  };
  HighwayLevel parse_highway_level(const std::string& type);
}

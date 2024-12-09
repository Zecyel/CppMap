#include "Map.h"
#include "Server.h"
#include <iostream>

int main() {
  // 创建地图实例并加载OSM文件
  Map map;
  if (!map.load_osm("../data/guizhou.osm")) {
    std::cerr << "Failed to load OSM data." << std::endl;
    return 1;
  }

  // 创建并运行服务器
  Server server(map);
  server.run(18080, true);

  return 0;
}
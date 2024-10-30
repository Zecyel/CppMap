#include <pugixml.hpp>
#include <fmt/format.h>
#include <iostream>

int main() {
  // load from data/shanghai.osm
  pugi::xml_document doc;
  pugi::xml_parse_result result = doc.load_file("../data/shanghai.osm");

  std::cout << "Load result: " << result.description() << std::endl;
  // print the first 10 nodes

  int cnt = 0;
  for (const auto& node : doc.child("osm").children("node")) {
    std::cout << fmt::format("id: {}, lat: {}, lon: {}\n", node.attribute("id").value(), node.attribute("lat").value(), node.attribute("lon").value());
    if (++cnt >= 10) break;
  }

  return 0;
}
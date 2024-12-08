#pragma once

#include "Map.h"
#include <crow.h>

class Server {
public:
  Server(Map& map);
  void run(int port = 18080, bool multithreaded = true);

private:
  void setup_routes();

  Map& map_;
  crow::SimpleApp app_;
};

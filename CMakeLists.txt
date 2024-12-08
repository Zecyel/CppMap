cmake_minimum_required(VERSION 3.16)
project(CppMap VERSION 1.0 LANGUAGES CXX)

# 设置C++标准
set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

# 添加fmt和nlohmann_json子目录
add_subdirectory(ext/fmt)
add_subdirectory(ext/json)

# 查找Crow和pugixml
find_package(Crow REQUIRED)
find_package(pugixml REQUIRED)

# 包含头文件目录
include_directories(include)
include_directories(ext/fmt/include)
include_directories(ext/json/include)

# 收集源文件
file(GLOB_RECURSE SOURCES src/*.cpp)

# 添加可执行文件
add_executable(CppMap ${SOURCES})

# 连接必要的库
target_link_libraries(CppMap PRIVATE 
    fmt::fmt
    nlohmann_json::nlohmann_json
    Crow::Crow
    pugixml::pugixml
)
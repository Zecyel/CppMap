cmake_minimum_required(VERSION 3.16)
project(CppMap VERSION 1.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

add_subdirectory(ext/fmt)
add_subdirectory(ext/json)

find_package(Crow)
find_package(pugixml)

add_executable(CppMap src/main.cpp)

include_directories(ext/fmt/include)
include_directories(ext/json/include)

file(GLOB_RECURSE SOURCES src/*.cpp)
target_sources(CppMap PRIVATE ${SOURCES})

target_link_libraries(CppMap PRIVATE 
    fmt::fmt 
    nlohmann_json::nlohmann_json 
    Crow::Crow
    pugixml::pugixml
)

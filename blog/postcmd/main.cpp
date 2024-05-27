#include "json.hpp"
#include <iostream>
#include <filesystem>
#include <fstream>
#include <string>
#include <ctime>


int main(int argc, const char* argv[]) {
    if (argc < 4){
        std::cout << "Usage: postcmd \"author\" name \"title\" \"subtitle\"" << '\n';
        return 0;
    }

    std::fstream index;
    nlohmann::json indexjson;
    index.open("../index.json", std::ios_base::in);
    if (index.peek() != std::ifstream::traits_type::eof()){
        indexjson = nlohmann::json::parse(index);
    }

    index.clear();
    index.seekp(0, std::ios::beg);
    index.seekg(0, std::ios::beg);
    index.close();

    std::string author = argv[1];
    std::string name = argv[2];
    std::string title = argv[3];

    time_t now;
    time(&now);
    char buf[sizeof "2011-10-08T07:07:09Z"]; // ISO 8601 standard
    strftime(buf, sizeof buf, "%FT%TZ", gmtime(&now));

    nlohmann::json block = {
        {"time", buf},
        {"author", author.c_str()},
        {"id", name.c_str()},
        {"title", title.c_str()},
        {"subtitle", (argc > 4) ? argv[4] : ""},
        {"backgroundImage", (argc > 5) ? argv[5] : ""},
        {"titleImage", (argc > 6) ? argv[6] : ""},
        {"category", (argc > 7) ? argv[7] : "Uncategorized"}
    };
    indexjson[name] = block;

    index.open("../index.json", std::ios_base::out | std::ios_base::trunc);
    index << indexjson.dump(4);
    index.close();


    std::filesystem::create_directory("../"+name);

    std::ofstream md;
    md.open("../"+name+"/"+name+".md", std::ios_base::app);
    if (!md.is_open()){
        std::cerr << "Error: failed to create markdown file" << "../"+name+"/"+name+".md" << '\n';
        return 0;
    }
    md.close();

    return 0;
}

#include <iostream>
#include <filesystem>
#include <fstream>
#include <string>
#include <ctime>
#include "json.hpp"
#include "argparse.h"

using namespace argparse;


ArgumentParser MakeParser(){
	ArgumentParser parser("postcmd", "This tool is used to create new blog post pages for my portfolio website");
	parser.add_argument("-a", "--author", "The author of the page", true);
	parser.add_argument("-n", "--id", "The ID/name without spaces of the page", true);
	parser.add_argument("-t", "--title", "The title of the page (this is used differently from the ID/name)", true);
	parser.add_argument("-s", "--subtitle", "The subtitle of the page", false);
	parser.add_argument("-b", "--background", "The background image link, relative to the page's folder, or an absolute link", false);
	parser.add_argument("-i", "--image", "The title image link, relative to the page's folder, or an absolute link", false);
    parser.add_argument("-c", "--category", "The category of the blog post", false);
	parser.enable_help();
	return parser;
}


int main(int argc, const char* argv[]) {
    ArgumentParser parser(MakeParser());
    ArgumentParser::Result err = parser.parse(argc, argv);
	if (err) {
		std::cerr << err << "\n\n";
        parser.print_help();
		return 0;
	}

    if (parser.exists("help")) {
		parser.print_help();
		return 0;
	}

    std::string author = parser.get<std::string>("author");
    std::string id = parser.get<std::string>("id");
    std::string title = parser.get<std::string>("title");


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

    time_t now;
    time(&now);
    char buf[sizeof "2011-10-08T07:07:09Z"]; // ISO 8601 standard
    strftime(buf, sizeof buf, "%FT%TZ", gmtime(&now));

    nlohmann::json block = {
        {"time", buf},
        {"author", author},
        {"id", id},
        {"title", title},
        {"subtitle", parser.exists("subtitle") ? parser.get<std::string>("subtitle") : ""},
        {"backgroundImage", parser.exists("background") ? parser.get<std::string>("background") : ""},
        {"titleImage", parser.exists("image") ? parser.get<std::string>("image") : ""},
        {"category", parser.exists("category") ? parser.get<std::string>("category") : "Uncategorized"}
    };
    indexjson[id] = block;

    index.open("../index.json", std::ios_base::out | std::ios_base::trunc);
    index << indexjson.dump(4);
    index.close();


    std::filesystem::create_directory("../"+id);

    std::ofstream md;
    md.open("../"+id+"/"+id+".md", std::ios_base::app);
    if (!md.is_open()){
        std::cerr << "Error: failed to create markdown file" << "../"+id+"/"+id+".md" << '\n';
        return 0;
    }
    md.close();

    return 0;
}

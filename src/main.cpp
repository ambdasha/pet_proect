
#define CPPHTTPLIB_NO_INCLUDES
#define _WIN32_WINNT 0x0A00
#define WIN32_LEAN_AND_MEAN
#include <winsock2.h>
#include <windows.h>

#include <iostream>
#include <string>
#include <functional>
#include <thread>
#include <vector>
#include <map>
#include <sstream>
#include <fstream>

#include "../lib/httplib.h"
#include "../lib/json/json.hpp"
#include <mysql.h> 

using namespace std;
using namespace httplib;
using json = nlohmann::json;

//установки CORS заголовков
void set_cors_headers(Response& res, const std::string& origin = "*") {
    res.set_header("Access-Control-Allow-Origin", origin);
    res.set_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.set_header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
    res.set_header("Access-Control-Max-Age", "86400");
}

MYSQL* get_db_connection() {
    MYSQL* conn = mysql_init(NULL);
    if (!conn) {
        cerr << "MySQL initialization failed" << endl;
        return nullptr;
    }

    if (!mysql_real_connect(conn, "localhost", "root", "", "db", 3306, NULL, 0)) {
        cerr << "DB Connection error: " << mysql_error(conn) << endl;
        mysql_close(conn);
        return nullptr;
    }
    
    cout << "Connected to MySQL successfully!" << endl;
    return conn;
}





int main() {
    if (mysql_library_init(0, NULL, NULL)) {
        cerr << "Could not initialize MySQL library" << endl;
        return 1;
    }
    Server svr;

    svr.Options(R"(/.*)", [](const Request& req, Response& res) {
        set_cors_headers(res);
        res.status = 200;
    });

    svr.set_mount_point("/", "./www/fnd"); 

    
    svr.Post("/submit", [](const Request& req, Response& res) {
        set_cors_headers(res);

        auto name = req.get_param_value("c_name");
        auto email = req.get_param_value("email");
        auto service_type = req.get_param_value("serv_type");
        auto message = req.get_param_value("c_message");

        MYSQL* conn = get_db_connection();
        if (!conn) {
            res.set_content("Database connection error", "text/plain");
            res.status = 500;
            return;
        }

        char escaped_name[100];
        char escaped_email[100];
        char escaped_service[50];
        char escaped_message[500];
        
        mysql_real_escape_string(conn, escaped_name, name.c_str(), name.length());
        mysql_real_escape_string(conn, escaped_email, email.c_str(), email.length());
        mysql_real_escape_string(conn, escaped_service, service_type.c_str(), service_type.length());
        mysql_real_escape_string(conn, escaped_message, message.c_str(), message.length());

        string query = "INSERT INTO applications (c_name, email, serv_type, c_message) VALUES ('" +string(escaped_name) + "', '" +string(escaped_email) + "', '" +string(escaped_service) + "', '" +string(escaped_message) + "')";

        if (mysql_query(conn, query.c_str())) {
            res.set_content("Database error: " + string(mysql_error(conn)), "text/plain");
            res.status = 500;
        } else {
            res.set_redirect("/success.html");
        }

        mysql_close(conn);
    });



    // получение всех заявок
    svr.Get("/admin_data", [](const Request& req, Response& res) {
        set_cors_headers(res);
        
        MYSQL* conn = get_db_connection();
        if (!conn) {
            res.set_content("Database connection error", "text/plain");
            res.status = 500;
            return;
        }

        if (mysql_query(conn, "SELECT id, c_name, email, serv_type, c_message, created_at FROM applications ORDER BY created_at DESC")) {
            res.set_content("Database error: " + string(mysql_error(conn)), "text/plain");
            res.status = 500;
            mysql_close(conn);
            return;
        }

        MYSQL_RES* result = mysql_store_result(conn);
        if (!result) {
            res.set_content("No data found", "text/plain");
            mysql_close(conn);
            return;
        }

        json jsonData = json::array();
        
        MYSQL_ROW row;
        while ((row = mysql_fetch_row(result))) {
            json application;
            application["id"] = stoi(row[0]);
            application["c_name"] = row[1] ? row[1] : "";
            application["email"] = row[2] ? row[2] : "";
            application["serv_type"] = row[3] ? row[3] : "";
            application["c_message"] = row[4] ? row[4] : "";
            application["created_at"] = row[5] ? row[5] : "";
            
            jsonData.push_back(application);
        }
        
        res.set_content(jsonData.dump(), "application/json");
        
        mysql_free_result(result);
        mysql_close(conn);
    });


// API для очистки всех заявок
svr.Post("/admin_data/clear", [](const Request& req, Response& res) {
    set_cors_headers(res);
    
    MYSQL* conn = get_db_connection();
    if (!conn) {
        json error_response = {{"error", "Database connection error"}};
        res.set_content(error_response.dump(), "application/json");
        res.status = 500;
        return;
    }

    if (mysql_query(conn, "DELETE FROM applications")) {
        json error_response = {{"error", string(mysql_error(conn))}};
        res.set_content(error_response.dump(), "application/json");
        res.status = 500;
    } else {
        int affected = mysql_affected_rows(conn);
        json response = {
            {"message", "All applications deleted successfully"},
            {"deleted_count", affected}
        };
        res.set_content(response.dump(), "application/json");
        cout << "Cleared " << affected << " applications from database" << endl;
    }

    mysql_close(conn);
});


    // -----------------------
    cout << "Server starting on http://localhost:8080\n";
    cout << "MySQL client version: " << mysql_get_client_info() << endl;
    
    svr.listen("localhost", 8080);
    
    // Освобождение ресурсов MySQL
    mysql_library_end();
    return 0;
}
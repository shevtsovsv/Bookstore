from http.server import HTTPServer, CGIHTTPRequestHandler
import os, sys

# Change working directory to script location for convenience
os.chdir(os.path.dirname(__file__) or ".")

PORT = 8000
handler = CGIHTTPRequestHandler
# Ensure cgi-bin is executable by handler; it will look for /cgi-bin/
httpd = HTTPServer(("", PORT), handler)
print(f"Запуск сервера на http://localhost:{PORT} (CTRL+C для остановки)")
try:
    httpd.serve_forever()
except KeyboardInterrupt:
    print("\nСервер остановлен")

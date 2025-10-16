#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Простой HTTP сервер для тестирования веб-приложения
Запуск: python server.py
"""
import http.server
import socketserver
import webbrowser
import os

PORT = 8000

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

def main():
    handler = MyHTTPRequestHandler
    
    with socketserver.TCPServer(("", PORT), handler) as httpd:
        print(f"Сервер запущен на http://localhost:{PORT}")
        print(f"Главная страница: http://localhost:{PORT}/index.html")
        print(f"Каталог книг: http://localhost:{PORT}/html/book.html")
        print("Нажмите Ctrl+C для остановки сервера")
        
        # Автоматически открываем браузер
        webbrowser.open(f'http://localhost:{PORT}/index.html')
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nСервер остановлен")

if __name__ == "__main__":
    main()
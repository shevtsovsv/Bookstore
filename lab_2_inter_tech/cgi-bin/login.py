#!/usr/bin/env python3
import cgi, os, html
users_file = os.path.join(os.path.dirname(__file__), 'users.txt')
form = cgi.FieldStorage()
username = form.getfirst("username", "").strip()
password = form.getfirst("password", "").strip()
print("Content-Type: text/html; charset=utf-8\n")
print("<html><head><meta charset='utf-8'><title>Вход</title></head><body>")
print("<a href='/index.html'>Главная</a> | <a href='/book.html'>Каталог</a> | <a href='/contacts.html'>Контакты</a><hr>")
if not username or not password:
    print("<h2>Ошибка: заполните все поля</h2>")
else:
    users = {}
    if os.path.exists(users_file):
        with open(users_file, "r", encoding="utf-8") as f:
            for line in f:
                if ':' in line:
                    u,p = line.strip().split(":",1)
                    users[u]=p
    if username in users and users[username]==password:
        print(f"<h2>Добро пожаловать, {html.escape(username)}!</h2>")
    else:
        print("<h2>Неверный логин или пароль</h2>")
        print("<p><a href='/login.html'>Попробовать снова</a></p>")
print("</body></html>")

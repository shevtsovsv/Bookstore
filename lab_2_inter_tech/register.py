# # #!/usr/bin/env python3
# # import cgi
# # import cgitb
# # import os
# # import json
# #
# # # Включаем отладку
# # cgitb.enable()
# #
# # # Файл для хранения пользователей
# # USERS_FILE = 'users.json'
# #
# #
# # def load_users():
# #     """Загружает пользователей из файла"""
# #     if os.path.exists(USERS_FILE):
# #         with open(USERS_FILE, 'r', encoding='utf-8') as f:
# #             return json.load(f)
# #     return {}
# #
# #
# # def save_users(users):
# #     """Сохраняет пользователей в файл"""
# #     with open(USERS_FILE, 'w', encoding='utf-8') as f:
# #         json.dump(users, f, ensure_ascii=False, indent=2)
# #
# #
# # def main():
# #     print("Content-Type: text/html\n")
# #
# #     form = cgi.FieldStorage()
# #
# #     # Получаем данные из формы
# #     username = form.getvalue('username', '').strip()
# #     password = form.getvalue('password', '').strip()
# #
# #     # Проверяем данные
# #     if not username or not password:
# #         print("""
# #         <script>
# #             alert('Заполните все поля!');
# #             window.history.back();
# #         </script>
# #         """)
# #         return
# #
# #     # Загружаем существующих пользователей
# #     users = load_users()
# #
# #     # Проверяем, существует ли пользователь
# #     if username in users:
# #         print("""
# #         <script>
# #             alert('Пользователь с таким логином уже существует!');
# #             window.history.back();
# #         </script>
# #         """)
# #         return
# #
# #     # Сохраняем нового пользователя
# #     users[username] = password
# #     save_users(users)
# #
# #     # Перенаправляем на страницу успеха
# #     print(f"""
# #     <!DOCTYPE html>
# #     <html>
# #     <head>
# #         <meta http-equiv="refresh" content="0; url=../success_register.html?username={username}">
# #     </head>
# #     <body>
# #         <p>Регистрация успешна! Перенаправление...</p>
# #     </body>
# #     </html>
# #     """)
# #
# #
# # if __name__ == '__main__':
# #     main()
#
#
#
# #!/usr/bin/env python3
# import cgi
# import cgitb
# import os
# import json
#
# # Включаем отладку
# cgitb.enable()
#
# USERS_FILE = 'users.json'
#
# def load_users():
#     """Загружает пользователей из файла"""
#     if os.path.exists(USERS_FILE):
#         with open(USERS_FILE, 'r', encoding='utf-8') as f:
#             try:
#                 return json.load(f)
#             except json.JSONDecodeError:
#                 return {}
#     return {}
#
# def save_users(users):
#     """Сохраняет пользователей в файл"""
#     with open(USERS_FILE, 'w', encoding='utf-8') as f:
#         json.dump(users, f, ensure_ascii=False, indent=2)
#
# def print_alert(message):
#     """Выводит alert и возвращает на предыдущую страницу"""
#     print("Content-Type: text/html\n")
#     print(f"""
#     <script>
#         alert('{message}');
#         window.history.back();
#     </script>
#     """)
#
# def main():
#     form = cgi.FieldStorage()
#     username = form.getvalue('username', '').strip()
#     password = form.getvalue('password', '').strip()
#
#     # Проверка пустых полей
#     if not username or not password:
#         print_alert('Заполните все поля!')
#         return
#
#     # Загружаем пользователей
#     users = load_users()
#
#     # Проверка существующего пользователя
#     if username in users:
#         print_alert('Пользователь с таким логином уже существует!')
#         return
#
#     # Сохраняем нового пользователя
#     users[username] = password
#     save_users(users)
#
#     # Редирект на страницу успешной регистрации (302 — максимально совместимый)
#     print("Status: 302 Found")
#     print(f"Location: /success_register.html?username={username}\n")
#
# if __name__ == '__main__':
#     main()


#
# #!/usr/bin/env python3
# import cgi
# import cgitb
# import os
# import json
#
# cgitb.enable()
#
# USERS_FILE = 'users.json'  # путь относительно cgi-bin
#
# def load_users():
#     if os.path.exists(USERS_FILE):
#         with open(USERS_FILE, 'r', encoding='utf-8') as f:
#             try:
#                 return json.load(f)
#             except:
#                 return {}
#     return {}
#
# def save_users(users):
#     with open(USERS_FILE, 'w', encoding='utf-8') as f:
#         json.dump(users, f, ensure_ascii=False, indent=2)
#
# def print_alert(message):
#     print("Content-Type: text/html\n")
#     print(f"""
#     <script>
#         alert('{message}');
#         window.history.back();
#     </script>
#     """)
#
# def main():
#     form = cgi.FieldStorage()
#     username = form.getvalue('username', '').strip()
#     password = form.getvalue('password', '').strip()
#
#     if not username or not password:
#         print_alert("Заполните все поля!")
#         return
#
#     users = load_users()
#     if username in users:
#         print_alert("Пользователь с таким логином уже существует!")
#         return
#
#     users[username] = password
#     save_users(users)
#
#     # Редирект на страницу успешной регистрации
#     print("Status: 302 Found")
#     print("Content-Type: text/html")
#     print(f"Location: /success_register.html?username={username}\n")
#
# if __name__ == "__main__":
#     main()

#
# #!/usr/bin/env python3
# import cgi
# import cgitb
# import os
# import json
#
# cgitb.enable()
#
# USERS_FILE = 'users.json'  # путь к файлу users.json
#
# def load_users():
#     if os.path.exists(USERS_FILE):
#         with open(USERS_FILE, 'r', encoding='utf-8') as f:
#             try:
#                 return json.load(f)
#             except:
#                 return {}
#     return {}
#
# def save_users(users):
#     with open(USERS_FILE, 'w', encoding='utf-8') as f:
#         json.dump(users, f, ensure_ascii=False, indent=2)
#
# def main():
#     form = cgi.FieldStorage()
#     username = form.getvalue('username', '').strip()
#     password = form.getvalue('password', '').strip()
#
#     message = ""
#     users = load_users()
#
#     if username and password:
#         if username in users:
#             message = f"Пользователь {username} уже существует!"
#         else:
#             users[username] = password
#             save_users(users)
#             message = f"Вы успешно зарегистрированы, {username}!"
#     elif username or password:
#         message = "Заполните все поля!"
#
#     # Выводим HTML с уведомлением
#     print("Content-Type: text/html\n")
#     print(f"""
#     <!DOCTYPE html>
#     <html lang="ru">
#     <head>
#         <meta charset="UTF-8">
#         <title>Регистрация</title>
#     </head>
#     <body>
#         <h1>Регистрация</h1>
#         <p style="color: green;">{message}</p>
#         <form action="/cgi-bin/register.py" method="post">
#             <label>Логин: <input type="text" name="username" required></label><br>
#             <label>Пароль: <input type="password" name="password" required></label><br>
#             <button type="submit">Зарегистрироваться</button>
#         </form>
#     </body>
#     </html>
#     """)
#
# if __name__ == "__main__":
#     main()

#
# #!/usr/bin/env python3
# import cgi
# import cgitb
# import os
# import json
#
# cgitb.enable()
#
# USERS_FILE = '../users.json'  # путь к файлу
#
# def load_users():
#     if os.path.exists(USERS_FILE):
#         with open(USERS_FILE, 'r', encoding='utf-8') as f:
#             try:
#                 return json.load(f)
#             except:
#                 return {}
#     return {}
#
# def save_users(users):
#     with open(USERS_FILE, 'w', encoding='utf-8') as f:
#         json.dump(users, f, ensure_ascii=False, indent=2)
#
# def main():
#     form = cgi.FieldStorage()
#     username = form.getvalue('username', '').strip()
#     password = form.getvalue('password', '').strip()
#
#     if not username or not password:
#         print("Content-Type: text/html\n")
#         print('<span class="error">Заполните все поля!</span>')
#         return
#
#     users = load_users()
#     if username in users:
#         print("Content-Type: text/html\n")
#         print(f'<span class="error">Пользователь {username} уже существует!</span>')
#         return
#
#     users[username] = password
#     save_users(users)
#
#     print("Content-Type: text/html\n")
#     print(f'<span class="success">Вы успешно зарегистрированы, {username}!</span>')
#
# if __name__ == "__main__":
#     main()


#
# #!/usr/bin/env python3
# import cgi
# import cgitb
# import os
# import json
#
# cgitb.enable()
#
# USERS_FILE = os.path.join(os.path.dirname(__file__), 'users.json')
#
#
# def load_users():
#     if os.path.exists(USERS_FILE):
#         with open(USERS_FILE, 'r', encoding='utf-8') as f:
#             try:
#                 return json.load(f)
#             except:
#                 return {}
#     return {}
#
# def save_users(users):
#     with open(USERS_FILE, 'w', encoding='utf-8') as f:
#         json.dump(users, f, ensure_ascii=False, indent=2)
#
# def main():
#     form = cgi.FieldStorage()
#     username = form.getvalue('username', '').strip()
#     password = form.getvalue('password', '').strip()
#
#     print("Content-Type: text/html\n")  # обязательно
#
#     if not username or not password:
#         print('Заполните все поля!')
#         return
#
#     users = load_users()
#     if username in users:
#         print(f"Пользователь '{username}' уже существует")
#         return
#
#     users[username] = password
#     save_users(users)
#
#     print(f"Вы успешно зарегистрированы, {username}!")
#
# if __name__ == "__main__":
#     main()


#
# #!/usr/bin/env python3
# import cgi
# import cgitb
# import os
#
# cgitb.enable()
#
# USERS_FILE = os.path.join(os.path.dirname(__file__), 'users.txt')
#
#
# def load_users():
#     """Считывает пользователей из текстового файла."""
#     users = {}
#     if os.path.exists(USERS_FILE):
#         with open(USERS_FILE, 'r', encoding='utf-8') as f:
#             for line in f:
#                 line = line.strip()
#                 if ':' in line:
#                     username, password = line.split(':', 1)
#                     users[username] = password
#     return users
#
#
# def save_user(username, password):
#     """Добавляет пользователя в текстовый файл."""
#     with open(USERS_FILE, 'a', encoding='utf-8') as f:
#         f.write(f"{username}:{password}\n")
#
#
# def main():
#     form = cgi.FieldStorage()
#     username = form.getvalue('username', '').strip()
#     password = form.getvalue('password', '').strip()
#
#     print("Content-Type: text/html\n")  # обязательно для CGI
#
#     if not username or not password:
#         print("Заполните все поля!")
#         return
#
#     users = load_users()
#     if username in users:
#         print(f"Пользователь '{username}' уже существует!")
#         return
#
#     save_user(username, password)
#     print(f"Вы успешно зарегистрированы, {username}!")
#
#
# if __name__ == "__main__":
#     main()





#!/usr/bin/env python3
import cgi
import cgitb
import os

cgitb.enable()

USERS_FILE = os.path.join(os.path.dirname(__file__), 'users.txt')


def load_users():

    users = {}
    if os.path.exists(USERS_FILE):
        with open(USERS_FILE, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if ':' in line:
                    username, password = line.split(':', 1)
                    users[username] = password
    return users


def save_user(username, password):

    with open(USERS_FILE, 'a', encoding='utf-8') as f:
        f.write(f"{username}:{password}\n")


def main():
    form = cgi.FieldStorage()
    username = form.getvalue('username', '').strip()
    password = form.getvalue('password', '').strip()

    print("Content-Type: text/html\n")  # обязательно для CGI

    if not username or not password:
        print("""<div style="color: #e74c3c; font-weight: bold; text-align: center; padding: 20px;">
                  Заполните все поля!
                </div>""")
        return

    users = load_users()
    if username in users:
        print(f"""<div style="color: #e74c3c; font-weight: bold; text-align: center; padding: 20px;">
                  Пользователь '{username}' уже существует!
                </div>""")
        return

    save_user(username, password)
    print(f"""<div style="color: #27ae60; font-weight: bold; text-align: center; padding: 20px;">
              Вы успешно зарегистрированы, {username}!
            </div>""")


if __name__ == "__main__":
    main()

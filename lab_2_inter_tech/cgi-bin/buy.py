#!/usr/bin/env python3
import cgi, os, html
orders_file = os.path.join(os.path.dirname(__file__), 'orders.txt')
form = cgi.FieldStorage()
book = form.getfirst("book", "").strip()
name = form.getfirst("name", "").strip()
phone = form.getfirst("phone", "").strip()
print("Content-Type: text/html; charset=utf-8\n")
print("<html><head><meta charset='utf-8'><title>Покупка</title></head><body>")
print("<a href='/index.html'>Главная</a> | <a href='/book.html'>Каталог</a> | <a href='/contacts.html'>Контакты</a><hr>")
if not book:
    print("<h2>Ошибка: не указана книга</h2>")
elif not name or not phone:
    # show form for buyer data
    print(f"<h2>Оформление заказа: {html.escape(book)}</h2>")
    print("<form action='/cgi-bin/buy.py' method='post'>")
    print(f"<input type='hidden' name='book' value='{html.escape(book)}'>")
    print("Имя: <input name='name' required><br>")
    print("Телефон: <input name='phone' required><br>")
    print("<button type='submit'>Подтвердить</button>")
    print("</form>")
else:
    with open(orders_file, "a", encoding="utf-8") as f:
        f.write(f"{book}|{name}|{phone}\n")
    print(f"<h2>Спасибо, {html.escape(name)}! Ваш заказ на «{html.escape(book)}» принят.</h2>")
print("</body></html>")

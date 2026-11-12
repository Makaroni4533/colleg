############################################################
# Автор: Минченко Макар Евгеньевич
# Группа: 9/2-РПО-24/1
# Дисциплина: Основы алгоритмизации и программирования
# Работа: Домашняя работа №7 — Телеметрия марсохода
############################################################

from flask import Flask, render_template

app = Flask(__name__)

SUBSYSTEMS = [
    {"name": "Двигатели", "status": "ok", "value": 42, "unit": "°C"},
    {"name": "Антенна", "status": "warning", "value": 67, "unit": "°C"},
    {"name": "Научный отсек", "status": "critical", "value": 96, "unit": "°C"},
    {"name": "Навигация", "status": "ok", "value": 35, "unit": "°C"},
]


@app.get("/")
def index():
    return render_template("index.html", battery=64, subsystems=SUBSYSTEMS)


if __name__ == "__main__":
    app.run(port=5007)

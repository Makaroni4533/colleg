############################################################
# Автор: Минченко Макар Евгеньевич
# Группа: 9/2-РПО-24/1
# Дисциплина: Основы алгоритмизации и программирования
# Работа: Домашняя работа №1 — Django. Расписание занятий
############################################################

import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "college.settings")
application = get_wsgi_application()

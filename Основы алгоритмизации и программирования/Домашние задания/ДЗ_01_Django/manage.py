############################################################
# Автор: Минченко Макар Евгеньевич
# Группа: 9/2-РПО-24/1
# Дисциплина: Основы алгоритмизации и программирования
# Работа: Домашняя работа №1 — Django. Расписание занятий
############################################################

import os
import sys

from django.core.management import execute_from_command_line

if __name__ == "__main__":
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "college.settings")
    execute_from_command_line(sys.argv)

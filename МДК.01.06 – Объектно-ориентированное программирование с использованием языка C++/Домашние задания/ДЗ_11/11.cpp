////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Автор: Минченко Макар Евгеньевич
// Группа: 9/2-РПО-24/1
// Дисциплина: МДК.01.06 – Объектно-ориентированное программирование с использованием языка C++
// Работа: Домашняя работа №11
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



#include <iostream>
using namespace std;
class Student {
public:
    string name;

    Student(string name) {
        this->name = name;
    }

};
class Shool {
private:
    Student* student;
public:
    Shool(Student* student) {
        this->student = student;
    }
    void showStudent() {
        cout << student->name << endl;
    }
};
class Teacher {
public:
    string name;

    Teacher(string name) {
        this->name = name;
    };
};
class Course {
private:
    string courseName;
    Teacher* teacher;
    
public:
    

    Course(Teacher* teacher) {
        this->teacher = teacher;
    }
    Course(string courseName, Teacher* t) : courseName(courseName), teacher(t) {};
    void show() {
        cout << "Преподаватель: " << teacher->name << " Курс " << courseName << endl;
    }
};

int main()
{
    setlocale(LC_ALL, "ru");
    Student s("Иван");
    Student s2("F");
   
    Shool c2(&s2);

  
    c2.showStudent();

    Teacher t("Андрей");
    
    Course c("C++", &t);
    c.show();


    

    
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Автор: Минченко Макар Евгеньевич
// Группа: 9/2-РПО-24/1
// Дисциплина: МДК.01.06 – Объектно-ориентированное программирование с использованием языка C++
// Работа: Практическая работа №4
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

#include <iostream>
#include <vector>

using namespace std;


class Ability {
public:
    virtual void use() = 0; 
    virtual ~Ability() {}
};

class Fireball : public Ability {
public:
    void use() override {
        cout << "Нанесён урон огнём" << endl;
    }
};

class Heal : public Ability {
public:
    void use() override {
        cout << "Восстановлено здоровье" << endl;
    }
};

class Shield : public Ability {
public:
    void use() override {
        cout << "Активирован щит" << endl;
    }
};

int main() {
    setlocale(LC_ALL, "ru");
    
    vector<Ability*> abilities;

    abilities.push_back(new Fireball());
    abilities.push_back(new Heal());
    abilities.push_back(new Shield());

    for (Ability* ability : abilities) {
        ability->use();
    }

    for (Ability* ability : abilities) {
        delete ability;
    }

    return 0;
}
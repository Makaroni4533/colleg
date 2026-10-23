////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Автор: Минченко Макар Евгеньевич
// Группа: 9/2-РПО-24/1
// Дисциплина: МДК.01.06 – Объектно-ориентированное программирование с использованием языка C++
// Работа: Домашняя работа №1
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



#include <iostream>

using namespace std;
class Car {
private:
	string model = "Audi";
public:
	int fuel = 20;
	int drive(int distance) {
		fuel -= (distance / 100);
		return fuel;
	};
	int refuel(int amount) {
		fuel += amount;
		return fuel;
	};
	int getFuel() {
		cout << fuel << endl;
		return fuel;
	};

};

int main() {
	Car car;
	car.drive(1000);
	car.getFuel();
	car.refuel(5);
	car.getFuel();


}

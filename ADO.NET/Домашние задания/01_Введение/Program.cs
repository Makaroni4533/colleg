////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Автор: Минченко Макар Евгеньевич
// Группа: 9/2-РПО-24/1
// Дисциплина: ADO.NET (платформа Microsoft .NET)
// Работа: 01. Введение в ADO.NET и архитектура доступа к данным
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

using Microsoft.Data.SqlClient;

return await Db.Run(() =>
{
    using SqlConnection connection = Db.Connect();
    connection.Open();
    using SqlCommand command = new("SELECT DB_NAME();", connection);
    Console.WriteLine($"Текущая база данных: {command.ExecuteScalar()}");
    return Task.CompletedTask;
});

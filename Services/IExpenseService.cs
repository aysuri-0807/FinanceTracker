using FinanceApp.Models; 

namespace FinanceApp.Services; 

public interface IExpenseService
{
    IEnumerable<ExpenseModel> GetAll(); 

    ExpenseModel? GetById(int id); 

    void Add(ExpenseModel expense); 

    bool Remove(int id);
}
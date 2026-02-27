using FinanceApp.Models; 

namespace FinanceApp.Services; 

public class ExpenseService : IExpenseService
{
    private readonly List<ExpenseModel> _expenses = []; 
    private int _nextId = 1; 
    public IEnumerable<ExpenseModel> GetAll() => _expenses; 

    public ExpenseModel? GetById(int id)
    {
       return _expenses.FirstOrDefault(i => i.Id == id); 
    }

    public void Add(ExpenseModel expense)
    {
        expense.Id = _nextId++; 
        _expenses.Add(expense); 
    }
        
}
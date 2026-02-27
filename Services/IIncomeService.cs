using FinanceApp.Models; 

namespace FinanceApp.Services;

public interface IIncomeService
{
    IEnumerable<IncomeModel> GetAll(); 
    IncomeModel? GetById(int id); 
    void Add(IncomeModel income); 
}
using System.Runtime.CompilerServices;
using FinanceApp.Models;

namespace FinanceApp.Services; 

public class IncomeService : IIncomeService
{
    private readonly List<IncomeModel> _incomes = []; //Initialize a list of incomes assigned to _incomes
    private int _nextId = 1; //Initialize ID system 

    public IEnumerable<IncomeModel> GetAll() => _incomes; //public func GetAll() returns _incomes 

    public IncomeModel? GetById(int id) => //Find an actual initialized object for the income baed on ID
        _incomes.FirstOrDefault(i => i.Id == id); //i => i.Id == id is a lambda function; return first item in _incomes matching index = ID 

    public void Add(IncomeModel income)
    {
        income.Id = _nextId ++; //Move to next unique ID after adding this to UI 
        _incomes.Add(income); //Add the income to the list 
    }
}
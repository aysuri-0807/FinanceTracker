using FinanceApp.Models; 


namespace FinanceApp.Services; 

public class BalanceService : IBalanceService
{
    private readonly IIncomeService _incomeService;
    private readonly IExpenseService _expenseService;

    public BalanceService(IIncomeService incomeService, IExpenseService expenseService)
    {
        _incomeService = incomeService;
        _expenseService = expenseService;
    }

    public BalanceModel GetBalance()
    {
        var totalIncome = _incomeService.GetAll().Sum(i => i.Amount);
        var totalExpense = _expenseService.GetAll().Sum(e => e.Amount);

        return new BalanceModel
        {
            Balance = totalIncome - totalExpense
        };
    }
}
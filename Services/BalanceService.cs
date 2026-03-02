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

    public BalanceModel GetBalance(int userId)
    {
        var totalIncome = _incomeService.GetAll().Where(i => i.UserId == userId).Sum(i => i.Amount);
        var totalExpense = _expenseService.GetAll().Where(e => e.UserId == userId).Sum(e => e.Amount);

        return new BalanceModel
        {
            Balance = totalIncome - totalExpense
        };
    }
}
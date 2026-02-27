using FinanceApp.Models; 


namespace FinanceApp.Services; 

public interface IBalanceService
{
    BalanceModel GetBalance(); 
}
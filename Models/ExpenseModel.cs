namespace FinanceApp.Models; 

public class ExpenseModel
{
    public int Id {get; set; } 
    public string Title {get; set; } 
    
    public string Description {get; set; }

    public decimal Amount {get; set; } 
}
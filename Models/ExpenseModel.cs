namespace FinanceApp.Models; 

public class ExpenseModel
{
    public int Id {get; set; } 
    required public string Title {get; set; } 
    
    required public string Description {get; set; }

    public decimal Amount {get; set; } 

    public string? Group { get; set; }

    public int UserId {get; set; }
}
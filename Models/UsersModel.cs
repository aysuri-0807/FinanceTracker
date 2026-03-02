namespace FinanceApp.Models; 

public class UsersModel
{
    public int Id {get; set; }
    public string Name {get; set; } = string.Empty;
    public string Email {get; set; } = string.Empty;
    public string PasswordHash {get; set; } = string.Empty;
}
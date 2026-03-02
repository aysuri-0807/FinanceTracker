using FinanceApp.Models; 

namespace FinanceApp.Services; 

public interface IUserService
{
    IEnumerable<UsersModel> GetAll(); 
    UsersModel? GetById(int id); 
    void Add(UsersModel user); 
    bool Remove(int id);
    UsersModel? GetByEmail(string email);
    UsersModel Register(string email, string password, string? name = null);
    UsersModel? ValidateCredentials(string email, string password);
}

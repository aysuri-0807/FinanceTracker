using System.Security.Cryptography;
using FinanceApp.Models;

namespace FinanceApp.Services;

public class UserService : IUserService
{
	private readonly List<UsersModel> _users = [];
	private int _nextId = 1;

	public IEnumerable<UsersModel> GetAll() => _users;

	public UsersModel? GetById(int id) => _users.FirstOrDefault(u => u.Id == id);

	public UsersModel? GetByEmail(string email) =>
		_users.FirstOrDefault(u => string.Equals(u.Email, email, StringComparison.OrdinalIgnoreCase));

	public void Add(UsersModel user)
	{
		user.Id = _nextId++;
		_users.Add(user);
	}

	public bool Remove(int id)
	{
		var user = GetById(id);
		if (user is null)
		{
			return false;
		}

		_users.Remove(user);
		return true;
	}

	public UsersModel Register(string email, string password, string? name = null)
	{
		if (GetByEmail(email) is not null)
		{
			throw new InvalidOperationException("Email is already registered.");
		}

		var user = new UsersModel
		{
			Name = string.IsNullOrWhiteSpace(name) ? email.Split('@')[0] : name.Trim(),
			Email = email.Trim(),
			PasswordHash = HashPassword(password)
		};

		Add(user);
		return user;
	}

	public UsersModel? ValidateCredentials(string email, string password)
	{
		var user = GetByEmail(email);
		if (user is null)
		{
			return null;
		}

		return VerifyPassword(password, user.PasswordHash) ? user : null;
	}

	private static string HashPassword(string password)
	{
		var salt = RandomNumberGenerator.GetBytes(16);
		var hash = Rfc2898DeriveBytes.Pbkdf2(password, salt, 100_000, HashAlgorithmName.SHA256, 32);
		return Convert.ToBase64String(salt) + ":" + Convert.ToBase64String(hash);
	}

	private static bool VerifyPassword(string password, string storedHash)
	{
		if (string.IsNullOrWhiteSpace(storedHash))
		{
			return false;
		}

		var parts = storedHash.Split(':');
		if (parts.Length != 2)
		{
			return false;
		}

		try
		{
			var salt = Convert.FromBase64String(parts[0]);
			var expectedHash = Convert.FromBase64String(parts[1]);
			var actualHash = Rfc2898DeriveBytes.Pbkdf2(password, salt, 100_000, HashAlgorithmName.SHA256, 32);
			return CryptographicOperations.FixedTimeEquals(expectedHash, actualHash);
		}
		catch (FormatException)
		{
			return false;
		}
	}
}

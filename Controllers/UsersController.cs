namespace FinanceApp.Controllers; 

using System.Security.Claims;
using FinanceApp.Models;
using FinanceApp.Services;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[Route("Users")]
public class UsersController : Controller 
{
    private readonly IUserService _userService;

    public UsersController(IUserService userService)
    {
        _userService = userService;
    }

    [HttpGet("Login")]
    [AllowAnonymous]
    public IActionResult Login()
    {
        return View();
    }

    [HttpGet("Register")]
    [AllowAnonymous]
    public IActionResult Register()
    {
        return View();
    }

    [HttpPost("Logout")]
    [Authorize]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Logout()
    {
        await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
        return RedirectToAction("Login", "Users");
    }

    [HttpGet("/api/users/me")]
    public IActionResult Me()
    {
        if (!User.Identity?.IsAuthenticated ?? true)
        {
            return Unauthorized();
        }

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var email = User.FindFirstValue(ClaimTypes.Email);

        return Ok(new
        {
            Id = userId,
            Email = email
        });
    }

    [HttpPost("/api/users/register")]
    [AllowAnonymous]
    public async Task<IActionResult> RegisterApi([FromBody] RegisterRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest("Email and password are required.");
        }

        try
        {
            var user = _userService.Register(request.Email, request.Password, request.Name);
            await SignInUserAsync(user);
            return Ok(new { user.Id, user.Email });
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(ex.Message);
        }
    }

    [HttpPost("/api/users/login")]
    [AllowAnonymous]
    public async Task<IActionResult> LoginApi([FromBody] LoginRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest("Email and password are required.");
        }

        var user = _userService.ValidateCredentials(request.Email, request.Password);
        if (user is null)
        {
            return Unauthorized("Invalid email or password.");
        }

        await SignInUserAsync(user);
        return Ok(new { user.Id, user.Email });
    }

    [HttpPost("/api/users/logout")]
    [Authorize]
    public async Task<IActionResult> LogoutApi()
    {
        await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
        return NoContent();
    }

    private async Task SignInUserAsync(UsersModel user)
    {
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(ClaimTypes.Email, user.Email),
            new(ClaimTypes.Name, user.Name)
        };

        var identity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
        var principal = new ClaimsPrincipal(identity);

        await HttpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, principal);
    }

    public class RegisterRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string? Name { get; set; }
    }

    public class LoginRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }
}

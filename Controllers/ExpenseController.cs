using FinanceApp.Models;
using FinanceApp.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace FinanceApp.Controllers;

public class ExpenseController : Controller
{
    private static readonly string[] AllowedGroups = ["Utilities", "Rent", "Investing", "Leisure", "Other"];
    private readonly IExpenseService _expenseService;

    public ExpenseController(IExpenseService expenseService)
    {
        _expenseService = expenseService;
    }

    public IActionResult Index()
    {
        var expenses = _expenseService.GetAll();
        return View(expenses);
    }

    [HttpGet("/api/expenses")]
    [Authorize]
    public IActionResult GetAllApi()
    {
        var userId = GetCurrentUserId();
        var expenses = _expenseService.GetAll().Where(e => e.UserId == userId);
        return Ok(expenses);
    }

    public IActionResult Details(int id)
    {
        var expense = _expenseService.GetById(id);
        if (expense is null)
        {
            return NotFound();
        }

        return View(expense);
    }

    [HttpGet]
    public IActionResult Create()
    {
        return View();
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public IActionResult Create(ExpenseModel expense)
    {
        if (!ModelState.IsValid)
        {
            return View(expense);
        }

        if (string.IsNullOrWhiteSpace(expense.Group))
        {
            expense.Group = "Other";
        }

        _expenseService.Add(expense);
        return RedirectToAction(nameof(Index));
    }

    [HttpPost("/api/expenses")]
    [Authorize]
    public IActionResult CreateApi([FromBody] ExpenseModel expense)
    {
        if (string.IsNullOrWhiteSpace(expense.Title) || string.IsNullOrWhiteSpace(expense.Description))
        {
            return BadRequest("Title and description are required.");
        }

        if (string.IsNullOrWhiteSpace(expense.Group))
        {
            expense.Group = "Other";
        }

        if (!AllowedGroups.Contains(expense.Group))
        {
            return BadRequest("Group must be one of: Utilities, Rent, Investing, Leisure, Other.");
        }

        expense.UserId = GetCurrentUserId();
        _expenseService.Add(expense);
        return CreatedAtAction(nameof(GetAllApi), new { id = expense.Id }, expense);
    }

    [HttpDelete("/api/expenses/{id:int}")]
    [Authorize]
    public IActionResult DeleteApi(int id)
    {
        var userId = GetCurrentUserId();
        var expense = _expenseService.GetById(id);
        if (expense is null || expense.UserId != userId)
        {
            return NotFound();
        }

        var removed = _expenseService.Remove(id);
        if (!removed)
        {
            return NotFound();
        }

        return NoContent();
    }

    private int GetCurrentUserId()
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return int.TryParse(userIdClaim, out var userId) ? userId : 0;
    }
}
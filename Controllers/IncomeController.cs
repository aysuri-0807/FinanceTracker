using FinanceApp.Models;
using FinanceApp.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace FinanceApp.Controllers;

public class IncomeController : Controller
{
    private readonly IIncomeService _incomeService;

    public IncomeController(IIncomeService incomeService)
    {
        _incomeService = incomeService;
    }

    public IActionResult Index()
    {
        var incomes = _incomeService.GetAll();
        return View(incomes);
    }

    [HttpGet("/api/incomes")]
    [Authorize]
    public IActionResult GetAllApi()
    {
        var userId = GetCurrentUserId();
        var incomes = _incomeService.GetAll().Where(i => i.UserId == userId);
        return Ok(incomes);
    }

    public IActionResult Details(int id)
    {
        var income = _incomeService.GetById(id);
        if (income is null)
        {
            return NotFound();
        }

        return View(income);
    }

    [HttpGet]
    public IActionResult Create()
    {
        return View();
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public IActionResult Create(IncomeModel income)
    {
        if (!ModelState.IsValid)
        {
            return View(income);
        }

        _incomeService.Add(income);
        return RedirectToAction(nameof(Index));
    }

    [HttpPost("/api/incomes")]
    [Authorize]
    public IActionResult CreateApi([FromBody] IncomeModel income)
    {
        if (string.IsNullOrWhiteSpace(income.Title) || string.IsNullOrWhiteSpace(income.Description))
        {
            return BadRequest("Title and description are required.");
        }

        income.UserId = GetCurrentUserId();
        _incomeService.Add(income);
        return CreatedAtAction(nameof(GetAllApi), new { id = income.Id }, income);
    }

    [HttpDelete("/api/incomes/{id:int}")]
    [Authorize]
    public IActionResult DeleteApi(int id)
    {
        var userId = GetCurrentUserId();
        var income = _incomeService.GetById(id);
        if (income is null || income.UserId != userId)
        {
            return NotFound();
        }

        var removed = _incomeService.Remove(id);
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
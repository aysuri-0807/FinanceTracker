using FinanceApp.Models;
using FinanceApp.Services;
using Microsoft.AspNetCore.Mvc;

namespace FinanceApp.Controllers;

public class ExpenseController : Controller
{
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

        _expenseService.Add(expense);
        return RedirectToAction(nameof(Index));
    }
}
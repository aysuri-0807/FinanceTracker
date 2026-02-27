using FinanceApp.Models;
using FinanceApp.Services;
using Microsoft.AspNetCore.Mvc;

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
}
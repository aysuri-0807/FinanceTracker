(function () {
    const mountNode = document.getElementById("react-root");
    const hasReact = typeof React !== "undefined" && typeof ReactDOM !== "undefined";
    const THEME_STORAGE_KEY = "financeapp-theme";
    const EXPENSE_GROUPS = ["Utilities", "Rent", "Investing", "Leisure"];
    const CHART_GROUPS = [...EXPENSE_GROUPS, "Other"];
    const GROUP_COLORS = {
        Utilities: "#4e79a7",
        Rent: "#f28e2b",
        Investing: "#59a14f",
        Leisure: "#e15759",
        Other: "#af7aa1",
        FreeIncome: "#76b7b2"
    };

    async function apiRequest(url, options) {
        const response = await fetch(url, {
            credentials: "same-origin",
            ...options
        });

        if (!response.ok) {
            const errorText = await response.text();
            const error = new Error(errorText || "Request failed.");
            error.status = response.status;
            throw error;
        }

        if (response.status === 204) {
            return null;
        }

        return response.json();
    }

    function getInitialTheme() {
        const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
        if (storedTheme === "dark" || storedTheme === "light") {
            return storedTheme;
        }

        return "light";
    }

    function applyTheme(theme, persistTheme) {
        const isDarkMode = theme === "dark";
        const body = document.body;
        const navBar = document.querySelector("header nav.navbar");
        const navLinks = document.querySelectorAll("header nav .nav-link");

        if (isDarkMode) {
            body.classList.remove("light-mode");
            body.classList.add("dark-mode");
        } else {
            body.classList.remove("dark-mode");
            body.classList.add("light-mode");
        }

        if (navBar) {
            if (isDarkMode) {
                navBar.classList.remove("navbar-light", "bg-white");
                navBar.classList.add("navbar-dark", "bg-dark");
                navLinks.forEach(function (link) {
                    link.classList.remove("text-dark");
                    link.classList.add("text-light");
                });
            } else {
                navBar.classList.remove("navbar-dark", "bg-dark");
                navBar.classList.add("navbar-light", "bg-white");
                navLinks.forEach(function (link) {
                    link.classList.remove("text-light");
                    link.classList.add("text-dark");
                });
            }
        }

        if (persistTheme) {
            localStorage.setItem(THEME_STORAGE_KEY, isDarkMode ? "dark" : "light");
        }
    }

    function toggleBgMode() {
        const isDarkMode = document.body.classList.contains("dark-mode");
        const nextTheme = isDarkMode ? "light" : "dark";
        applyTheme(nextTheme, true);
    }

    function wireThemeToggleButton() {
        const themeToggleButton = document.getElementById("theme-toggle-btn");
        if (!themeToggleButton) {
            return;
        }

        themeToggleButton.addEventListener("click", toggleBgMode);
    }

    applyTheme(getInitialTheme(), false);
    wireThemeToggleButton();

    if (!mountNode || !hasReact) {
        return;
    }

    const viewKey = mountNode.dataset.reactView;

    function redirectToLogin() {
        window.location.href = "/Users/Login";
    }

    function PageHeader(props) {
        return React.createElement(
            "div",
            { className: "mb-4 sleek-animate" },
            React.createElement("h1", { className: "display-5 mb-2" }, props.title),
            React.createElement("p", { className: "lead mb-0" }, props.subtitle)
        );
    }

    function EntryForm(props) {
        const [title, setTitle] = React.useState("");
        const [description, setDescription] = React.useState("");
        const [amount, setAmount] = React.useState("");
        const [group, setGroup] = React.useState("");

        async function handleSubmit(event) {
            event.preventDefault();

            const payload = {
                title: title.trim(),
                description: description.trim(),
                amount: Number(amount)
            };

            if (props.groupOptions) {
                payload.group = group || null;
            }

            await props.onSubmit(payload);
            setTitle("");
            setDescription("");
            setAmount("");
            setGroup("");
        }

        return React.createElement(
            "form",
            { onSubmit: handleSubmit, className: "mb-4 app-form-card sleek-animate" },
            React.createElement("h5", null, props.heading),
            React.createElement(
                "div",
                { className: "mb-2" },
                React.createElement("input", {
                    className: "form-control",
                    placeholder: "Title",
                    value: title,
                    onChange: function (event) { setTitle(event.target.value); },
                    required: true
                })
            ),
            props.groupOptions
                ? React.createElement(
                    "div",
                    { className: "mb-2" },
                    React.createElement(
                        "select",
                        {
                            className: "form-select",
                            value: group,
                            onChange: function (event) { setGroup(event.target.value); }
                        },
                        React.createElement("option", { value: "" }, "No group"),
                        props.groupOptions.map(function (groupName) {
                            return React.createElement("option", { key: groupName, value: groupName }, groupName);
                        })
                    )
                )
                : null,
            React.createElement(
                "div",
                { className: "mb-2" },
                React.createElement("input", {
                    className: "form-control",
                    placeholder: "Description",
                    value: description,
                    onChange: function (event) { setDescription(event.target.value); },
                    required: true
                })
            ),
            React.createElement(
                "div",
                { className: "mb-2" },
                React.createElement("input", {
                    className: "form-control",
                    type: "number",
                    step: "0.01",
                    min: "0",
                    placeholder: "Amount",
                    value: amount,
                    onChange: function (event) { setAmount(event.target.value); },
                    required: true
                })
            ),
            React.createElement(
                "button",
                { type: "submit", className: "btn entry-submit-btn" },
                props.submitLabel
            )
        );
    }

    function IncomeSplitPieChart(props) {
        const incomeTotal = props.incomeTotal;
        const spendingByGroup = props.spendingByGroup;

        if (incomeTotal <= 0) {
            return React.createElement(
                "div",
                { className: "pie-chart-card sleek-animate" },
                React.createElement("h5", null, "Income Split"),
                React.createElement("p", { className: "pie-chart-caption mb-0" }, "Add income entries to generate the pie chart.")
            );
        }

        const categorizedSpent = CHART_GROUPS.reduce(function (sum, groupName) {
            return sum + (spendingByGroup[groupName] || 0);
        }, 0);

        const freeIncome = Math.max(incomeTotal - categorizedSpent, 0);
        const denominator = Math.max(incomeTotal, categorizedSpent, 1);

        const targetSlices = [
            ...CHART_GROUPS.map(function (groupName) {
                return {
                    label: groupName,
                    amount: spendingByGroup[groupName] || 0,
                    color: GROUP_COLORS[groupName]
                };
            }),
            {
                label: "Free income",
                amount: freeIncome,
                color: GROUP_COLORS.FreeIncome
            }
        ];

        const previousSliceValuesRef = React.useRef(
            Object.fromEntries(targetSlices.map(function (slice) {
                return [slice.label, slice.amount];
            }))
        );

        const [animatedSliceValues, setAnimatedSliceValues] = React.useState(previousSliceValuesRef.current);

        React.useEffect(function () {
            const durationMs = 550;
            const startValues = previousSliceValuesRef.current;
            const endValues = Object.fromEntries(targetSlices.map(function (slice) {
                return [slice.label, slice.amount];
            }));

            const animationStart = performance.now();
            let frameId;

            function step(now) {
                const progress = Math.min((now - animationStart) / durationMs, 1);
                const easedProgress = 1 - Math.pow(1 - progress, 3);
                const nextValues = {};

                targetSlices.forEach(function (slice) {
                    const fromValue = startValues[slice.label] ?? 0;
                    const toValue = endValues[slice.label] ?? 0;
                    nextValues[slice.label] = fromValue + ((toValue - fromValue) * easedProgress);
                });

                setAnimatedSliceValues(nextValues);

                if (progress < 1) {
                    frameId = requestAnimationFrame(step);
                    return;
                }

                previousSliceValuesRef.current = endValues;
            }

            frameId = requestAnimationFrame(step);

            return function () {
                if (frameId) {
                    cancelAnimationFrame(frameId);
                }
            };
        }, [incomeTotal, ...CHART_GROUPS.map(function (groupName) { return spendingByGroup[groupName] || 0; })]);

        const slices = targetSlices.map(function (slice) {
            return {
                label: slice.label,
                color: slice.color,
                amount: animatedSliceValues[slice.label] ?? 0
            };
        });

        let currentStart = 0;
        const gradientParts = slices.map(function (slice) {
            const slicePercent = (slice.amount / denominator) * 100;
            const start = currentStart;
            const end = currentStart + slicePercent;
            currentStart = end;
            return slice.color + " " + start.toFixed(2) + "% " + end.toFixed(2) + "%";
        });

        return React.createElement(
            "div",
            { className: "pie-chart-card sleek-animate" },
            React.createElement("h5", null, "Income Split"),
            React.createElement(
                "p",
                { className: "pie-chart-caption small mb-3" },
                "Based on total income and expense tags."
            ),
            React.createElement(
                "div",
                { className: "pie-chart-layout" },
                React.createElement("div", {
                    className: "pie-chart-circle",
                    style: {
                        background: "conic-gradient(" + gradientParts.join(", ") + ")"
                    }
                }),
                React.createElement(
                    "ul",
                    { className: "pie-chart-legend" },
                    slices.map(function (slice) {
                        return React.createElement(
                            "li",
                            { key: slice.label },
                            React.createElement("span", {
                                className: "legend-swatch",
                                style: { backgroundColor: slice.color }
                            }),
                            React.createElement("span", null, slice.label + ": $" + slice.amount.toFixed(2))
                        );
                    })
                )
            )
        );
    }

    function HomeIndexView() {
        const [incomes, setIncomes] = React.useState([]);
        const [expenses, setExpenses] = React.useState([]);
        const [errorMessage, setErrorMessage] = React.useState("");
        const [isLoading, setIsLoading] = React.useState(true);

        async function loadData() {
            setIsLoading(true);
            setErrorMessage("");

            try {
                const [incomeData, expenseData] = await Promise.all([
                    apiRequest("/api/incomes"),
                    apiRequest("/api/expenses")
                ]);

                setIncomes(incomeData || []);
                setExpenses(expenseData || []);
            } catch (error) {
                if (error.status === 401) {
                    redirectToLogin();
                    return;
                }

                setErrorMessage(error.message || "Unable to load data.");
            } finally {
                setIsLoading(false);
            }
        }

        React.useEffect(function () {
            applyTheme(getInitialTheme(), false);
            loadData();
        }, []);

        const entries = [];
        const totalIncome = incomes.reduce(function (sum, income) {
            return sum + Number(income.amount);
        }, 0);
        const spendingByGroup = {
            Utilities: 0,
            Rent: 0,
            Investing: 0,
            Leisure: 0,
            Other: 0
        };

        incomes.forEach(function (income) {
            entries.push({
                key: "income-" + income.id,
                entryType: "income",
                id: income.id,
                sign: "+",
                title: income.title,
                amount: Number(income.amount)
            });
        });

        expenses.forEach(function (expense) {
            const normalizedGroup = CHART_GROUPS.includes(expense.group) ? expense.group : "Other";
            spendingByGroup[normalizedGroup] += Number(expense.amount);

            entries.push({
                key: "expense-" + expense.id,
                entryType: "expense",
                id: expense.id,
                sign: "-",
                title: expense.title,
                amount: Number(expense.amount),
                group: expense.group || "-"
            });
        });

        const subtotal = entries.reduce(function (sum, entry) {
            return entry.sign === "+" ? sum + entry.amount : sum - entry.amount;
        }, 0);

        async function removeEntry(entry) {
            setErrorMessage("");

            const endpoint = entry.entryType === "income"
                ? "/api/incomes/" + entry.id
                : "/api/expenses/" + entry.id;

            try {
                await apiRequest(endpoint, { method: "DELETE" });
                await loadData();
            } catch (error) {
                if (error.status === 401) {
                    redirectToLogin();
                    return;
                }

                setErrorMessage(error.message || "Unable to remove entry.");
            }
        }

        if (isLoading) {
            return React.createElement("p", null, "Loading finance data...");
        }

        return React.createElement(
            "div",
            { className: "sleek-animate" },
            React.createElement(PageHeader, {
                title: "Your Dashboard",
                subtitle: "View your current balance, manage your income and expenses, and see a visual breakdown of your finances. "
            }),
            errorMessage ? React.createElement("div", { className: "alert alert-danger" }, errorMessage) : null,
            React.createElement(
                "div",
                { className: "finance-table-wrapper" },
                React.createElement(
                "table",
                { className: "table align-middle finance-table" },
                React.createElement(
                    "thead",
                    null,
                    React.createElement(
                        "tr",
                        null,
                        React.createElement("th", null, "Title"),
                        React.createElement("th", null, "Group"),
                        React.createElement("th", { className: "text-end" }, "Amount"),
                        React.createElement("th", { className: "text-center" }, "Remove")
                    )
                ),
                React.createElement(
                    "tbody",
                    null,
                    entries.length === 0
                        ? React.createElement(
                            "tr",
                            null,
                            React.createElement("td", { colSpan: 4, className: "text-center text-muted" }, "No entries yet.")
                        )
                        : entries.map(function (entry) {
                            const rowClassName = entry.sign === "+" ? "income-row" : "expense-row";
                            const amountClassName = entry.sign === "+" ? "amount-positive" : "amount-negative";

                            return React.createElement(
                                "tr",
                                { key: entry.key, className: rowClassName },
                                React.createElement("td", null, entry.title),
                                React.createElement("td", null, entry.sign === "-" ? entry.group : "-"),
                                React.createElement("td", { className: "text-end " + amountClassName }, entry.sign, " $", entry.amount.toFixed(2)),
                                React.createElement(
                                    "td",
                                    { className: "text-center" },
                                    React.createElement(
                                        "button",
                                        {
                                            type: "button",
                                            className: "btn btn-sm btn-outline-danger",
                                            onClick: function () { removeEntry(entry); }
                                        },
                                        "Remove"
                                    )
                                )
                            );
                        })
                ),
                React.createElement(
                    "tfoot",
                    null,
                    React.createElement(
                        "tr",
                        { className: "balance-row" },
                        React.createElement("td", { className: "fw-bold" }, "Balance"),
                        React.createElement("td", null),
                        React.createElement("td", { className: "text-end fw-bold" }, "$", subtotal.toFixed(2)),
                        React.createElement("td", null)
                    )
                )
                )
            ),
            React.createElement(IncomeSplitPieChart, {
                incomeTotal: totalIncome,
                spendingByGroup: spendingByGroup
            })
        );
    }

    function IncomeCreateView() {
        const [statusMessage, setStatusMessage] = React.useState("");
        const [errorMessage, setErrorMessage] = React.useState("");

        React.useEffect(function () {
            applyTheme(getInitialTheme(), false);
        }, []);

        async function submitIncome(payload) {
            setStatusMessage("");
            setErrorMessage("");

            try {
                await apiRequest("/api/incomes", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });

                setStatusMessage("Income saved.");
            } catch (error) {
                if (error.status === 401) {
                    redirectToLogin();
                    return;
                }

                setErrorMessage(error.message || "Unable to save income.");
            }
        }

        return React.createElement(
            "div",
            { className: "sleek-animate" },
            React.createElement(PageHeader, {
                title: "Income Form",
                subtitle: "Add income entries on a dedicated page."
            }),
            errorMessage ? React.createElement("div", { className: "alert alert-danger" }, errorMessage) : null,
            statusMessage ? React.createElement("div", { className: "alert alert-success" }, statusMessage) : null,
            React.createElement(EntryForm, {
                heading: "Add Income",
                submitLabel: "Save Income",
                onSubmit: submitIncome
            })
        );
    }

    function ExpenseCreateView() {
        const [statusMessage, setStatusMessage] = React.useState("");
        const [errorMessage, setErrorMessage] = React.useState("");

        React.useEffect(function () {
            applyTheme(getInitialTheme(), false);
        }, []);

        async function submitExpense(payload) {
            setStatusMessage("");
            setErrorMessage("");

            try {
                await apiRequest("/api/expenses", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });

                setStatusMessage("Expense saved.");
            } catch (error) {
                if (error.status === 401) {
                    redirectToLogin();
                    return;
                }

                setErrorMessage(error.message || "Unable to save expense.");
            }
        }

        return React.createElement(
            "div",
            { className: "sleek-animate" },
            React.createElement(PageHeader, {
                title: "Expense Form",
                subtitle: "Add expense entries on a dedicated page."
            }),
            errorMessage ? React.createElement("div", { className: "alert alert-danger" }, errorMessage) : null,
            statusMessage ? React.createElement("div", { className: "alert alert-success" }, statusMessage) : null,
            React.createElement(EntryForm, {
                heading: "Add Expense",
                submitLabel: "Save Expense",
                groupOptions: EXPENSE_GROUPS,
                onSubmit: submitExpense
            })
        );
    }

    function UsersLoginView() {
        const [email, setEmail] = React.useState("");
        const [password, setPassword] = React.useState("");
        const [errorMessage, setErrorMessage] = React.useState("");

        React.useEffect(function () {
            applyTheme(getInitialTheme(), false);
        }, []);

        async function handleLogin(event) {
            event.preventDefault();
            setErrorMessage("");

            try {
                await apiRequest("/api/users/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email: email.trim(), password: password })
                });

                window.location.href = "/Home/Index";
            } catch (error) {
                setErrorMessage(error.message || "Unable to login.");
            }
        }

        return React.createElement(
            "div",
            { className: "sleek-animate" },
            React.createElement(PageHeader, {
                title: "Login",
                subtitle: "Sign in to view and save your own finance table."
            }),
            errorMessage ? React.createElement("div", { className: "alert alert-danger" }, errorMessage) : null,
            React.createElement(
                "form",
                { onSubmit: handleLogin, className: "mb-4 app-form-card sleek-animate" },
                React.createElement(
                    "div",
                    { className: "mb-2" },
                    React.createElement("input", {
                        className: "form-control",
                        type: "email",
                        placeholder: "Email",
                        value: email,
                        onChange: function (event) { setEmail(event.target.value); },
                        required: true
                    })
                ),
                React.createElement(
                    "div",
                    { className: "mb-3" },
                    React.createElement("input", {
                        className: "form-control",
                        type: "password",
                        placeholder: "Password",
                        value: password,
                        onChange: function (event) { setPassword(event.target.value); },
                        required: true
                    })
                ),
                React.createElement("button", { type: "submit", className: "btn btn-primary" }, "Login")
            ),
            React.createElement(
                "p",
                null,
                "Need an account? ",
                React.createElement("a", { href: "/Users/Register" }, "Register")
            )
        );
    }

    function UsersRegisterView() {
        const [name, setName] = React.useState("");
        const [email, setEmail] = React.useState("");
        const [password, setPassword] = React.useState("");
        const [errorMessage, setErrorMessage] = React.useState("");

        React.useEffect(function () {
            applyTheme(getInitialTheme(), false);
        }, []);

        async function handleRegister(event) {
            event.preventDefault();
            setErrorMessage("");

            try {
                await apiRequest("/api/users/register", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name: name.trim(), email: email.trim(), password: password })
                });

                window.location.href = "/Home/Index";
            } catch (error) {
                setErrorMessage(error.message || "Unable to register.");
            }
        }

        return React.createElement(
            "div",
            { className: "sleek-animate" },
            React.createElement(PageHeader, {
                title: "Register",
                subtitle: "Create an account to keep your own income and expense data."
            }),
            errorMessage ? React.createElement("div", { className: "alert alert-danger" }, errorMessage) : null,
            React.createElement(
                "form",
                { onSubmit: handleRegister, className: "mb-4 app-form-card sleek-animate" },
                React.createElement(
                    "div",
                    { className: "mb-2" },
                    React.createElement("input", {
                        className: "form-control",
                        placeholder: "Name (optional)",
                        value: name,
                        onChange: function (event) { setName(event.target.value); }
                    })
                ),
                React.createElement(
                    "div",
                    { className: "mb-2" },
                    React.createElement("input", {
                        className: "form-control",
                        type: "email",
                        placeholder: "Email",
                        value: email,
                        onChange: function (event) { setEmail(event.target.value); },
                        required: true
                    })
                ),
                React.createElement(
                    "div",
                    { className: "mb-3" },
                    React.createElement("input", {
                        className: "form-control",
                        type: "password",
                        placeholder: "Password",
                        value: password,
                        onChange: function (event) { setPassword(event.target.value); },
                        required: true
                    })
                ),
                React.createElement("button", { type: "submit", className: "btn btn-primary" }, "Register")
            ),
            React.createElement(
                "p",
                null,
                "Already have an account? ",
                React.createElement("a", { href: "/Users/Login" }, "Login")
            )
        );
    }

    const views = {
        "home-index": HomeIndexView,
        "income-create": IncomeCreateView,
        "expense-create": ExpenseCreateView,
        "users-login": UsersLoginView,
        "users-register": UsersRegisterView
    };

    const SelectedView = views[viewKey];
    if (!SelectedView) {
        return;
    }

    ReactDOM.createRoot(mountNode).render(React.createElement(SelectedView));
})();

import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  browserLocalPersistence,
  GoogleAuthProvider,
  onAuthStateChanged,
  setPersistence,
  signOut,
  signInWithPopup,
} from "firebase/auth";
import { doc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
import {
  ArrowDownRight,
  ArrowUpRight,
  Bell,
  CalendarDays,
  Check,
  Copy,
  CreditCard,
  Download,
  Edit3,
  Filter,
  HandCoins,
  Home,
  Landmark,
  LayoutDashboard,
  LineChart,
  PiggyBank,
  Plus,
  ReceiptText,
  Search,
  Settings,
  Target,
  TrendingUp,
  Trash2,
  Upload,
  WalletCards,
  Wifi,
  X,
  Zap,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { auth, db, hasFirebaseConfig } from "./firebase";
import "./styles.css";

const currency = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  maximumFractionDigits: 0,
});

const categoryOptions = [
  { name: "Income", color: "#99d18a" },
  { name: "Food", color: "#d6b36a" },
  { name: "Bills", color: "#6f9d8f" },
  { name: "Transport", color: "#9d89c7" },
  { name: "Shopping", color: "#c77777" },
  { name: "Savings", color: "#8dbf72" },
  { name: "Personal", color: "#c59da4" },
  { name: "Monthly Amortization", color: "#b7a17d" },
  { name: "Investment", color: "#7fb39f" },
  { name: "Parent Allowance", color: "#d09a73" },
];

const accountOptions = ["Cash", "GCash", "Maya", "GoTyme", "BPI", "BDO", "UnionBank"];

const emptyTransactionForm = {
  title: "",
  amount: "",
  type: "expense",
  category: "Food",
  account: "GCash",
  date: getDefaultDateForMonth(getCurrentMonthKey()),
  note: "",
};

const emptyGoalForm = {
  title: "",
  target: "",
  saved: "",
  deadline: "2026-12-31",
};

const emptyBillForm = {
  name: "",
  amount: "",
  category: "Bills",
  icon: "card",
};

const storageKey = "budget-studio-state-v1";

const emptyMonthState = {
  monthlySalary: 0,
  transactions: [],
  budgets: [],
  bills: [],
};

const emptyBudgetState = {
  selectedMonth: getCurrentMonthKey(),
  months: {},
  goals: [],
};

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "plan", label: "Plan", icon: WalletCards },
  { id: "transactions", label: "Transactions", icon: ReceiptText },
  { id: "budgets", label: "Budgets", icon: Landmark },
  { id: "goals", label: "Goals", icon: Target },
  { id: "reports", label: "Reports", icon: LineChart },
  { id: "settings", label: "Settings", icon: Settings },
];

const tooltipStyle = {
  background: "#141313",
  border: "1px solid rgba(214,179,106,0.28)",
  borderRadius: 8,
  color: "#f5efe2",
};

function formatShortDate(dateValue) {
  return new Intl.DateTimeFormat("en-PH", {
    month: "short",
    day: "numeric",
  }).format(new Date(`${dateValue}T00:00:00`));
}

function getCurrentMonthKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function getMonthLabel(monthKey) {
  return new Intl.DateTimeFormat("en-PH", {
    month: "long",
    year: "numeric",
  }).format(new Date(`${monthKey}-01T00:00:00`));
}

function shiftMonth(monthKey, offset) {
  const date = new Date(`${monthKey}-01T00:00:00`);
  date.setMonth(date.getMonth() + offset);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function getDefaultDateForMonth(monthKey) {
  const currentMonth = getCurrentMonthKey();
  if (monthKey === currentMonth) {
    const now = new Date();
    return `${monthKey}-${String(now.getDate()).padStart(2, "0")}`;
  }
  return `${monthKey}-01`;
}

function createMonthState(source = {}) {
  return {
    monthlySalary: Number(source.monthlySalary) || 0,
    transactions: source.transactions ?? [],
    budgets: source.budgets ?? [],
    bills: source.bills ?? [],
  };
}

function normalizeBudgetState(state) {
  if (state?.months) {
    return {
      selectedMonth: state.selectedMonth || getCurrentMonthKey(),
      months: state.months,
      goals: state.goals ?? [],
    };
  }

  const selectedMonth = state?.selectedMonth || getCurrentMonthKey();
  return {
    selectedMonth,
    months: {
      [selectedMonth]: createMonthState(state),
    },
    goals: state?.goals ?? [],
  };
}

function percentage(value, total) {
  return total > 0 ? Math.round((value / total) * 100) : 0;
}

function normalizeMoneyInput(value) {
  return value.replace(/[^\d]/g, "").replace(/^0+(?=\d)/, "");
}

function getBudgetStateSignature(state) {
  return JSON.stringify({
    selectedMonth: state.selectedMonth,
    months: state.months,
    goals: state.goals,
  });
}

function csvEscape(value) {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function transactionsToCsv(transactions) {
  const headers = ["date", "type", "title", "amount", "category", "account", "note"];
  const rows = transactions.map((transaction) =>
    [
      transaction.date,
      transaction.type,
      transaction.title,
      transaction.amount,
      transaction.category,
      transaction.account,
      transaction.note,
    ].map(csvEscape).join(","),
  );
  return [headers.join(","), ...rows].join("\n");
}

function parseCsvLine(line) {
  const values = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];

    if (char === '"' && inQuotes && next === '"') {
      current += '"';
      index += 1;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      values.push(current);
      current = "";
    } else {
      current += char;
    }
  }

  values.push(current);
  return values;
}

function parseTransactionsCsv(csvText) {
  const lines = csvText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) return [];

  const headers = parseCsvLine(lines[0]).map((header) => header.toLowerCase());
  const headerIndex = (name) => headers.indexOf(name);

  return lines.slice(1).map((line, index) => {
    const cells = parseCsvLine(line);
    const rawAmount = Number(cells[headerIndex("amount")]);
    const rawType = cells[headerIndex("type")] || (rawAmount < 0 ? "expense" : "income");
    const type = rawType.toLowerCase() === "income" ? "income" : "expense";

    return {
      id: `import-${Date.now()}-${index}`,
      title: cells[headerIndex("title")] || "Imported transaction",
      amount: Math.abs(Number.isFinite(rawAmount) ? rawAmount : 0),
      type,
      category: type === "income" ? "Income" : cells[headerIndex("category")] || "Personal",
      account: cells[headerIndex("account")] || "Cash",
      date: cells[headerIndex("date")] || getDefaultDateForMonth(getCurrentMonthKey()),
      note: cells[headerIndex("note")] || "Imported from CSV",
    };
  }).filter((transaction) => transaction.amount > 0);
}

function downloadFile(filename, content, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function App() {
  const [activeView, setActiveView] = useState("dashboard");
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthKey());
  const [months, setMonths] = useState({});
  const [salaryInput, setSalaryInput] = useState("");
  const [goals, setGoals] = useState(emptyBudgetState.goals);
  const [authUser, setAuthUser] = useState(null);
  const [authReady, setAuthReady] = useState(!hasFirebaseConfig);
  const [dataReady, setDataReady] = useState(!hasFirebaseConfig);
  const [authError, setAuthError] = useState("");
  const [transactionForm, setTransactionForm] = useState(emptyTransactionForm);
  const [editingTransactionId, setEditingTransactionId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [budgetForm, setBudgetForm] = useState({ category: "Food", limit: "" });
  const [billForm, setBillForm] = useState(emptyBillForm);
  const [goalForm, setGoalForm] = useState(emptyGoalForm);
  const [dataMessage, setDataMessage] = useState("");
  const lastSyncedSignatureRef = useRef("");

  const activeMonthState = months[selectedMonth] ?? emptyMonthState;
  const transactions = activeMonthState.transactions;
  const budgets = activeMonthState.budgets;
  const bills = activeMonthState.bills;
  const monthlySalary = Number(salaryInput) || 0;
  const selectedMonthLabel = getMonthLabel(selectedMonth);
  const previousMonth = shiftMonth(selectedMonth, -1);
  const previousMonthLabel = getMonthLabel(previousMonth);
  const previousMonthState = createMonthState(months[previousMonth] ?? emptyMonthState);
  const canCopyPreviousPlan =
    previousMonthState.monthlySalary > 0 ||
    previousMonthState.bills.length > 0 ||
    previousMonthState.budgets.length > 0;

  function updateActiveMonth(updater) {
    setMonths((current) => {
      const currentMonth = createMonthState(current[selectedMonth] ?? emptyMonthState);
      return {
        ...current,
        [selectedMonth]: updater(currentMonth),
      };
    });
  }

  function changeSelectedMonth(nextMonth) {
    setMonths((current) => ({
      ...current,
      [selectedMonth]: {
        ...createMonthState(current[selectedMonth] ?? emptyMonthState),
        monthlySalary,
      },
    }));
    const nextMonthState = createMonthState(months[nextMonth] ?? emptyMonthState);
    setSelectedMonth(nextMonth);
    setSalaryInput(nextMonthState.monthlySalary ? String(nextMonthState.monthlySalary) : "");
    setTransactionForm((current) => ({
      ...current,
      date: getDefaultDateForMonth(nextMonth),
    }));
  }

  function copyPreviousMonthPlan() {
    if (!canCopyPreviousPlan) {
      setDataMessage(`No plan found for ${previousMonthLabel}.`);
      return;
    }

    updateActiveMonth((current) => ({
      ...current,
      monthlySalary: previousMonthState.monthlySalary,
      bills: previousMonthState.bills.map((bill) => ({ ...bill })),
      budgets: previousMonthState.budgets.map((budget) => ({ ...budget })),
    }));
    setSalaryInput(
      previousMonthState.monthlySalary ? String(previousMonthState.monthlySalary) : "",
    );
    setDataMessage(`Copied salary, bills, and budgets from ${previousMonthLabel}.`);
  }

  function clearRuntimeBudgetState() {
    const currentMonth = getCurrentMonthKey();
    setActiveView("dashboard");
    setSelectedMonth(currentMonth);
    setMonths(emptyBudgetState.months);
    setSalaryInput("");
    setGoals(emptyBudgetState.goals);
    setTransactionForm({
      ...emptyTransactionForm,
      date: getDefaultDateForMonth(currentMonth),
    });
    setBudgetForm({ category: "Food", limit: "" });
    setBillForm(emptyBillForm);
    setGoalForm(emptyGoalForm);
    setEditingTransactionId(null);
    setSearchTerm("");
    setTypeFilter("all");
    setCategoryFilter("all");
  }

  useEffect(() => {
    const savedState = window.localStorage.getItem(storageKey);
    if (savedState) {
      try {
        const parsed = normalizeBudgetState(JSON.parse(savedState));
        const monthState = parsed.months[parsed.selectedMonth] ?? emptyMonthState;
        setSelectedMonth(parsed.selectedMonth);
        setMonths(parsed.months);
        setSalaryInput(monthState.monthlySalary ? String(monthState.monthlySalary) : "");
        setTransactionForm((current) => ({
          ...current,
          date: getDefaultDateForMonth(parsed.selectedMonth),
        }));
        setGoals(parsed.goals ?? emptyBudgetState.goals);
        lastSyncedSignatureRef.current = getBudgetStateSignature(parsed);
      } catch {
        window.localStorage.removeItem(storageKey);
      }
    }
    if (!hasFirebaseConfig) {
      setDataReady(true);
    }
    return undefined;
  }, []);

  useEffect(() => {
    if (!hasFirebaseConfig || !auth) return undefined;

    return onAuthStateChanged(auth, (user) => {
      setAuthUser(user);
      setAuthReady(true);
      setDataReady(!user);
      if (!user) {
        clearRuntimeBudgetState();
        lastSyncedSignatureRef.current = "";
      }
    });
  }, []);

  useEffect(() => {
    if (!hasFirebaseConfig || !db || !authUser) return undefined;

    const stateRef = doc(db, "users", authUser.uid, "budgetStudio", "state");
    return onSnapshot(
      stateRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = normalizeBudgetState(snapshot.data());
          const monthState = data.months[data.selectedMonth] ?? emptyMonthState;
          setSelectedMonth(data.selectedMonth);
          setMonths(data.months);
          setSalaryInput(monthState.monthlySalary ? String(monthState.monthlySalary) : "");
          setTransactionForm((current) => ({
            ...current,
            date: getDefaultDateForMonth(data.selectedMonth),
          }));
          setGoals(data.goals ?? emptyBudgetState.goals);
          lastSyncedSignatureRef.current = getBudgetStateSignature(data);
        } else {
          const savedState = window.localStorage.getItem(storageKey);
          let fallbackState = emptyBudgetState;
          try {
            fallbackState = savedState ? normalizeBudgetState(JSON.parse(savedState)) : emptyBudgetState;
          } catch {
            window.localStorage.removeItem(storageKey);
          }
          setDoc(stateRef, { ...fallbackState, updatedAt: serverTimestamp() });
          lastSyncedSignatureRef.current = getBudgetStateSignature(fallbackState);
        }
        setDataReady(true);
      },
      (error) => {
        setDataReady(true);
        setDataMessage(`Cloud load failed: ${error.message}`);
      },
    );
  }, [authUser]);

  useEffect(() => {
    if (!dataReady) return undefined;
    if (hasFirebaseConfig && !authUser) return undefined;

    const nextMonths = {
      ...months,
      [selectedMonth]: {
        ...activeMonthState,
        monthlySalary,
      },
    };
    const state = {
      selectedMonth,
      months: nextMonths,
      goals,
    };
    const nextSignature = getBudgetStateSignature(state);

    if (nextSignature === lastSyncedSignatureRef.current) {
      return undefined;
    }

    window.localStorage.setItem(storageKey, JSON.stringify(state));
    lastSyncedSignatureRef.current = nextSignature;

    if (!hasFirebaseConfig) {
      return undefined;
    }

    if (!db || !authUser) return undefined;

    const timeout = window.setTimeout(() => {
      setDoc(
        doc(db, "users", authUser.uid, "budgetStudio", "state"),
        { ...state, updatedAt: serverTimestamp() },
        { merge: true },
      ).catch((error) => {
        setDataMessage(`Cloud save failed: ${error.message}`);
      });
    }, 500);

    return () => window.clearTimeout(timeout);
  }, [activeMonthState, authUser, dataReady, goals, monthlySalary, months, selectedMonth]);

  const expenseTransactions = useMemo(
    () => transactions.filter((transaction) => transaction.type === "expense"),
    [transactions],
  );

  const totalIncome = useMemo(
    () =>
      transactions
        .filter((transaction) => transaction.type === "income")
        .reduce((total, transaction) => total + transaction.amount, 0),
    [transactions],
  );

  const totalExpenses = useMemo(
    () => expenseTransactions.reduce((total, transaction) => total + transaction.amount, 0),
    [expenseTransactions],
  );

  const remaining = totalIncome - totalExpenses;
  const totalBills = bills.reduce((total, bill) => total + bill.amount, 0);
  const flexibleBudgetTotal = budgets.reduce((total, budget) => total + budget.limit, 0);
  const plannedOutflow = totalBills + flexibleBudgetTotal;
  const plannedRemaining = monthlySalary - plannedOutflow;
  const afterBills = monthlySalary - totalBills;
  const savingsRate = percentage(remaining, totalIncome);
  const safeToSpend = Math.max(Math.round(remaining / 6), 0);
  const plannedDailyAllowance = Math.max(Math.round(plannedRemaining / 30), 0);
  const totalBudgetLimit = flexibleBudgetTotal;
  const budgetUsed = percentage(totalExpenses, totalBudgetLimit);
  const totalGoalTarget = goals.reduce((total, goal) => total + goal.target, 0);
  const totalGoalSaved = goals.reduce((total, goal) => total + goal.saved, 0);

  const categoryBreakdown = useMemo(
    () =>
      categoryOptions
        .filter((category) => category.name !== "Income")
        .map((category) => ({
          name: category.name,
          color: category.color,
          value: expenseTransactions
            .filter((transaction) => transaction.category === category.name)
            .reduce((total, transaction) => total + transaction.amount, 0),
        }))
        .filter((category) => category.value > 0),
    [expenseTransactions],
  );

  const monthlyTrend = useMemo(() => {
    const year = Number(selectedMonth.slice(0, 4));
    const monthIndex = Number(selectedMonth.slice(5, 7)) - 1;
    const lastDay = new Date(year, monthIndex + 1, 0).getDate();
    const selectedDays = [1, 5, 10, 15, 20, 25, lastDay].map(
      (day) => `${selectedMonth}-${String(Math.min(day, lastDay)).padStart(2, "0")}`,
    );

    return selectedDays.map((day) => ({
      day: formatShortDate(day),
      spend: expenseTransactions
        .filter((transaction) => transaction.date <= day)
        .reduce((total, transaction) => total + transaction.amount, 0),
    }));
  }, [expenseTransactions, selectedMonth]);

  const accounts = useMemo(
    () =>
      accountOptions.map((account) => {
        const balance = transactions.reduce((total, transaction) => {
          if (transaction.account !== account) return total;
          return transaction.type === "income"
            ? total + transaction.amount
            : total - transaction.amount;
        }, 0);

        return { name: account, amount: Math.max(balance, 0) };
      }),
    [transactions],
  );

  const budgetsWithSpend = useMemo(
    () =>
      budgets.map((budget) => {
        const spent = expenseTransactions
          .filter((transaction) => transaction.category === budget.category)
          .reduce((total, transaction) => total + transaction.amount, 0);
        return {
          ...budget,
          spent,
          used: percentage(spent, budget.limit),
          remaining: budget.limit - spent,
        };
      }),
    [budgets, expenseTransactions],
  );

  const transactionCategoryOptions = useMemo(() => {
    const budgetCategories = budgets.map((budget) => budget.category);
    const activeCategories = budgetCategories.length > 0
      ? budgetCategories
      : categoryOptions
          .filter((category) => category.name !== "Income")
          .map((category) => category.name);

    return ["Income", ...new Set(activeCategories)];
  }, [budgets]);

  useEffect(() => {
    if (
      transactionForm.type === "expense" &&
      !transactionCategoryOptions.includes(transactionForm.category)
    ) {
      setTransactionForm((current) => ({
        ...current,
        category: transactionCategoryOptions.find((category) => category !== "Income") ?? "Food",
      }));
    }

    if (categoryFilter !== "all" && !transactionCategoryOptions.includes(categoryFilter)) {
      setCategoryFilter("all");
    }
  }, [categoryFilter, transactionCategoryOptions, transactionForm.category, transactionForm.type]);

  const summaryCards = [
    {
      label: "Monthly Income",
      amount: totalIncome,
      detail: `${transactions.filter((item) => item.type === "income").length} income entries`,
      icon: ArrowUpRight,
      tone: "positive",
    },
    {
      label: "Expenses",
      amount: totalExpenses,
      detail: `${expenseTransactions.length} expenses tracked`,
      icon: ArrowDownRight,
      tone: "negative",
    },
    {
      label: "Remaining",
      amount: remaining,
      detail: "After tracked expenses",
      icon: WalletCards,
      tone: "neutral",
    },
    {
      label: "Safe To Spend",
      amount: safeToSpend,
      detail: "Daily allowance",
      icon: PiggyBank,
      tone: "gold",
    },
  ];

  const filteredTransactions = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return [...transactions]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .filter((transaction) => {
        const matchesType = typeFilter === "all" || transaction.type === typeFilter;
        const matchesCategory = categoryFilter === "all" || transaction.category === categoryFilter;
        const searchable =
          `${transaction.title} ${transaction.category} ${transaction.account} ${transaction.note}`.toLowerCase();
        return matchesType && matchesCategory && searchable.includes(normalizedSearch);
      });
  }, [categoryFilter, searchTerm, transactions, typeFilter]);

  function updateTransactionForm(field, value) {
    setTransactionForm((current) => ({
      ...current,
      [field]: value,
      ...(field === "type" && value === "income" ? { category: "Income" } : {}),
      ...(field === "type" && value === "expense" && current.category === "Income"
        ? { category: "Food" }
        : {}),
    }));
  }

  function resetTransactionForm() {
    setTransactionForm(emptyTransactionForm);
    setEditingTransactionId(null);
  }

  function handleTransactionSubmit(event) {
    event.preventDefault();
    const cleanAmount = Number(transactionForm.amount);

    if (!transactionForm.title.trim() || !Number.isFinite(cleanAmount) || cleanAmount <= 0) {
      return;
    }

    const nextTransaction = {
      id: editingTransactionId ?? `txn-${Date.now()}`,
      title: transactionForm.title.trim(),
      amount: cleanAmount,
      type: transactionForm.type,
      category: transactionForm.type === "income" ? "Income" : transactionForm.category,
      account: transactionForm.account,
      date: transactionForm.date,
      note: transactionForm.note.trim(),
    };

    updateActiveMonth((current) => ({
      ...current,
      transactions: editingTransactionId
        ? current.transactions.map((transaction) =>
            transaction.id === editingTransactionId ? nextTransaction : transaction,
          )
        : [nextTransaction, ...current.transactions],
    }));
    resetTransactionForm();
  }

  function editTransaction(transaction) {
    setEditingTransactionId(transaction.id);
    setTransactionForm({
      title: transaction.title,
      amount: String(transaction.amount),
      type: transaction.type,
      category: transaction.category,
      account: transaction.account,
      date: transaction.date,
      note: transaction.note,
    });
    setActiveView("transactions");
  }

  function deleteTransaction(transactionId) {
    updateActiveMonth((current) => ({
      ...current,
      transactions: current.transactions.filter((transaction) => transaction.id !== transactionId),
    }));
    if (editingTransactionId === transactionId) {
      resetTransactionForm();
    }
  }

  function handleBudgetSubmit(event) {
    event.preventDefault();
    const cleanLimit = Number(budgetForm.limit);

    if (!budgetForm.category || !Number.isFinite(cleanLimit) || cleanLimit <= 0) return;

    updateActiveMonth((month) => {
      const exists = month.budgets.some((budget) => budget.category === budgetForm.category);
      const budgets = exists
        ? month.budgets.map((budget) =>
            budget.category === budgetForm.category ? { ...budget, limit: cleanLimit } : budget,
          )
        : [
            ...month.budgets,
            {
              id: `budget-${Date.now()}`,
              category: budgetForm.category,
              limit: cleanLimit,
            },
          ];

      return {
        ...month,
        budgets,
      };
    });
    setBudgetForm({ category: "Food", limit: "" });
  }

  function removeBudget(budgetId) {
    updateActiveMonth((current) => ({
      ...current,
      budgets: current.budgets.filter((budget) => budget.id !== budgetId),
    }));
  }

  function handleBillSubmit(event) {
    event.preventDefault();
    const cleanAmount = Number(billForm.amount);

    if (!billForm.name.trim() || !Number.isFinite(cleanAmount) || cleanAmount <= 0) return;

    updateActiveMonth((current) => ({
      ...current,
      bills: [
        ...current.bills,
        {
          id: `bill-${Date.now()}`,
          name: billForm.name.trim(),
          category: billForm.category,
          amount: cleanAmount,
          icon: billForm.icon,
        },
      ],
    }));
    setBillForm(emptyBillForm);
  }

  function removeBill(billId) {
    updateActiveMonth((current) => ({
      ...current,
      bills: current.bills.filter((bill) => bill.id !== billId),
    }));
  }

  function handleGoalSubmit(event) {
    event.preventDefault();
    const target = Number(goalForm.target);
    const saved = Number(goalForm.saved);

    if (!goalForm.title.trim() || !Number.isFinite(target) || target <= 0) return;

    setGoals((current) => [
      {
        id: `goal-${Date.now()}`,
        title: goalForm.title.trim(),
        target,
        saved: Number.isFinite(saved) ? Math.max(saved, 0) : 0,
        deadline: goalForm.deadline,
      },
      ...current,
    ]);
    setGoalForm(emptyGoalForm);
  }

  function addGoalContribution(goalId, amount) {
    setGoals((current) =>
      current.map((goal) =>
        goal.id === goalId
          ? { ...goal, saved: Math.min(goal.saved + amount, goal.target) }
          : goal,
      ),
    );
  }

  function removeGoal(goalId) {
    setGoals((current) => current.filter((goal) => goal.id !== goalId));
  }

  async function handleGoogleSignIn() {
    if (!auth) return;

    setAuthError("");
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope("profile");
      provider.addScope("email");
      await setPersistence(auth, browserLocalPersistence);
      await signInWithPopup(auth, provider);
    } catch (error) {
      setAuthError(error.message);
    }
  }

  async function handleLogout() {
    if (!auth) return;
    await signOut(auth);
  }

  function handleExportTransactions() {
    downloadFile(
      `budget-studio-${selectedMonth}-transactions.csv`,
      transactionsToCsv(transactions),
      "text/csv;charset=utf-8",
    );
    setDataMessage(`Exported ${transactions.length} transactions.`);
  }

  function handleImportTransactions(file) {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const imported = parseTransactionsCsv(String(reader.result ?? ""));
        if (imported.length === 0) {
          setDataMessage("No valid transactions found in that CSV.");
          return;
        }

        updateActiveMonth((current) => ({
          ...current,
          transactions: [...imported, ...current.transactions],
        }));
        setDataMessage(`Imported ${imported.length} transactions.`);
      } catch {
        setDataMessage("Could not read that CSV. Check the columns and try again.");
      }
    };
    reader.readAsText(file);
  }

  async function handleResetDemoData() {
    setSalaryInput("");
    setSelectedMonth(getCurrentMonthKey());
    setMonths(emptyBudgetState.months);
    setGoals(emptyBudgetState.goals);
    setTransactionForm(emptyTransactionForm);
    setBudgetForm({ category: "Food", limit: "" });
    setBillForm(emptyBillForm);
    setGoalForm(emptyGoalForm);
    setDataMessage("Budget Studio is clean and ready for your own data.");
    window.localStorage.setItem(storageKey, JSON.stringify(emptyBudgetState));

    if (!hasFirebaseConfig) {
      return;
    }

    if (db && authUser) {
      await setDoc(
        doc(db, "users", authUser.uid, "budgetStudio", "state"),
        { ...emptyBudgetState, updatedAt: serverTimestamp() },
        { merge: true },
      );
    }
  }

  function renderActiveView() {
    if (activeView === "plan") {
      return (
        <PlanView
          afterBills={afterBills}
          billForm={billForm}
          bills={bills}
          budgets={budgetsWithSpend}
          monthlySalary={monthlySalary}
          plannedDailyAllowance={plannedDailyAllowance}
          plannedOutflow={plannedOutflow}
          plannedRemaining={plannedRemaining}
          canCopyPreviousPlan={canCopyPreviousPlan}
          dataMessage={dataMessage}
          previousMonthLabel={previousMonthLabel}
          selectedMonthLabel={selectedMonthLabel}
          totalBills={totalBills}
          totalBudgetLimit={totalBudgetLimit}
          onBillFormChange={setBillForm}
          onBillSubmit={handleBillSubmit}
          onBudgetChange={setBudgetForm}
          onBudgetRemove={removeBudget}
          onBudgetSubmit={handleBudgetSubmit}
          onCopyPreviousPlan={copyPreviousMonthPlan}
          onRemoveBill={removeBill}
          salaryInput={salaryInput}
          onSalaryChange={setSalaryInput}
          budgetForm={budgetForm}
        />
      );
    }

    if (activeView === "transactions") {
      return (
        <TransactionsView
          categoryFilter={categoryFilter}
          categoryOptionsForTransactions={transactionCategoryOptions}
          editingId={editingTransactionId}
          filteredTransactions={filteredTransactions}
          form={transactionForm}
          searchTerm={searchTerm}
          typeFilter={typeFilter}
          onCategoryFilter={setCategoryFilter}
          onDelete={deleteTransaction}
          onEdit={editTransaction}
          onReset={resetTransactionForm}
          onSearch={setSearchTerm}
          onSubmit={handleTransactionSubmit}
          onTypeFilter={setTypeFilter}
          onUpdateForm={updateTransactionForm}
        />
      );
    }

    if (activeView === "budgets") {
      return (
        <BudgetsView
          afterBills={afterBills}
          budgets={budgetsWithSpend}
          form={budgetForm}
          monthlySalary={monthlySalary}
          plannedRemaining={plannedRemaining}
          selectedMonthLabel={selectedMonthLabel}
          totalBudgetLimit={totalBudgetLimit}
          totalBills={totalBills}
          totalExpenses={totalExpenses}
          onChange={setBudgetForm}
          onRemove={removeBudget}
          onSubmit={handleBudgetSubmit}
        />
      );
    }

    if (activeView === "goals") {
      return (
        <GoalsView
          form={goalForm}
          goals={goals}
          totalGoalSaved={totalGoalSaved}
          totalGoalTarget={totalGoalTarget}
          onAddContribution={addGoalContribution}
          onChange={setGoalForm}
          onRemove={removeGoal}
          onSubmit={handleGoalSubmit}
        />
      );
    }

    if (activeView === "reports") {
      return (
        <ReportsView
          categoryBreakdown={categoryBreakdown}
          monthlyTrend={monthlyTrend}
          selectedMonthLabel={selectedMonthLabel}
          totalExpenses={totalExpenses}
          totalIncome={totalIncome}
        />
      );
    }

    if (activeView === "settings") {
      return (
        <SettingsView
          authError={authError}
          authReady={authReady}
          authUser={authUser}
          dataMessage={dataMessage}
          dataReady={dataReady}
          firebaseEnabled={hasFirebaseConfig}
          transactionCount={transactions.length}
          onExportTransactions={handleExportTransactions}
          onGoogleSignIn={handleGoogleSignIn}
          onImportTransactions={handleImportTransactions}
          onLogout={handleLogout}
          onResetDemoData={handleResetDemoData}
        />
      );
    }

    return (
      <DashboardView
        accounts={accounts}
        afterBills={afterBills}
        budgetUsed={budgetUsed}
        budgets={budgetsWithSpend}
        bills={bills}
        categoryBreakdown={categoryBreakdown}
        monthlySalary={monthlySalary}
        monthlyTrend={monthlyTrend}
        plannedDailyAllowance={plannedDailyAllowance}
        plannedRemaining={plannedRemaining}
        remaining={remaining}
        selectedMonthLabel={selectedMonthLabel}
        safeToSpend={safeToSpend}
        savingsRate={savingsRate}
        summaryCards={summaryCards}
        totalExpenses={totalExpenses}
        transactions={transactions}
        onAddEntry={() => setActiveView("transactions")}
        onViewBudgets={() => setActiveView("budgets")}
      />
    );
  }

  if (!hasFirebaseConfig || !authReady || !authUser || !dataReady) {
    return (
      <LoginView
        authError={authError}
        authReady={authReady}
        firebaseEnabled={hasFirebaseConfig}
        isLoadingWorkspace={Boolean(authUser && !dataReady)}
        onGoogleSignIn={handleGoogleSignIn}
      />
    );
  }

  return (
    <main className="app-shell">
      <aside className="sidebar" aria-label="Main navigation">
        <div className="brand">
          <div className="brand-mark">BS</div>
          <div>
            <p>Budget</p>
            <strong>Studio</strong>
          </div>
        </div>

        <nav className="nav-list">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                className={activeView === item.id ? "active" : ""}
                key={item.id}
                type="button"
                onClick={() => setActiveView(item.id)}
              >
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-note">
          <span>{hasFirebaseConfig ? "Firebase Sync" : "Local Demo"}</span>
          <strong>
            {hasFirebaseConfig ? (authUser ? "Connected" : "Sign In Needed") : "Ready"}
          </strong>
          <p>
            {hasFirebaseConfig
              ? "Your plan syncs to your private Firestore document after sign in."
              : "Add Firebase keys in .env to enable login and cloud sync."}
          </p>
        </div>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <span className="eyebrow">Budget Studio</span>
            <h1>{navItems.find((item) => item.id === activeView)?.label ?? "Dashboard"}</h1>
          </div>
          <div className="topbar-actions">
            <button className="icon-button" type="button" aria-label="View reminders">
              <Bell size={18} />
            </button>
            <button
              className="icon-button"
              type="button"
              aria-label="Previous month"
              onClick={() => changeSelectedMonth(shiftMonth(selectedMonth, -1))}
            >
              <ArrowDownRight size={17} />
            </button>
            <button className="secondary-button" type="button">
              <CalendarDays size={17} />
              {selectedMonthLabel}
            </button>
            <button
              className="icon-button"
              type="button"
              aria-label="Next month"
              onClick={() => changeSelectedMonth(shiftMonth(selectedMonth, 1))}
            >
              <ArrowUpRight size={17} />
            </button>
            <button
              className="secondary-button"
              type="button"
              onClick={() => setActiveView("settings")}
            >
              {hasFirebaseConfig ? (authUser ? "Cloud Sync" : "Sign In") : "Local Mode"}
            </button>
            <button
              className="primary-button"
              type="button"
              onClick={() => setActiveView("transactions")}
            >
              <Plus size={18} />
              Add Entry
            </button>
          </div>
        </header>

        {renderActiveView()}
      </section>
    </main>
  );
}

function LoginView({ authError, authReady, firebaseEnabled, isLoadingWorkspace, onGoogleSignIn }) {
  const buttonText = !firebaseEnabled
    ? "Setup needed"
    : isLoadingWorkspace
      ? "Opening Budget Studio"
    : authReady
      ? "Continue with Google"
      : "Checking session";

  return (
    <main className="login-shell">
      <section className="login-panel" aria-labelledby="login-title">
        <div className="login-brand">
          <div className="brand-mark">BS</div>
          <div>
            <span>Private finance workspace</span>
            <strong>Budget Studio</strong>
          </div>
        </div>

        <div className="login-copy">
          <span>Personal Budget Tracker</span>
          <h1 id="login-title">Your money plan, all in one calm place.</h1>
          <p>
            Sign in to continue tracking your salary, bills, spending, savings
            goals, and monthly plan.
          </p>
        </div>

        <button
          className="google-login-button"
          type="button"
          onClick={onGoogleSignIn}
          disabled={!firebaseEnabled || !authReady || isLoadingWorkspace}
        >
          <span className="google-mark" aria-hidden="true">G</span>
          {buttonText}
        </button>

        {!firebaseEnabled && (
          <div className="login-alert">
            Login is almost ready. Finish the app setup first, then come back here.
          </div>
        )}
        {authError && <div className="login-alert danger">{authError}</div>}
      </section>

      <aside className="login-side">
        <div>
          <span>Stay Signed In</span>
          <strong>Open Budget Studio again without starting over.</strong>
        </div>
        <div>
          <span>Your Space</span>
          <strong>Your budget belongs to your account only.</strong>
        </div>
        <div>
          <span>Private Plan</span>
          <strong>Salary, bills, budgets, and goals stay connected month to month.</strong>
        </div>
      </aside>
    </main>
  );
}

function DashboardView({
  accounts,
  afterBills,
  budgetUsed,
  budgets,
  bills,
  categoryBreakdown,
  monthlySalary,
  monthlyTrend,
  plannedDailyAllowance,
  plannedRemaining,
  remaining,
  selectedMonthLabel,
  savingsRate,
  summaryCards,
  totalExpenses,
  transactions,
  onAddEntry,
  onViewBudgets,
}) {
  return (
    <>
      <section className="hero-band">
        <div className="hero-copy">
          <span>Planned month remainder</span>
          <strong>{currency.format(plannedRemaining)}</strong>
          <p>
            Your {currency.format(monthlySalary)} salary covers {bills.length} fixed
            bills, then leaves {currency.format(afterBills)} before flexible budgets.
          </p>
        </div>
        <div className="hero-metrics">
          <div>
            <span>After Bills</span>
            <strong>{currency.format(afterBills)}</strong>
          </div>
          <div>
            <span>Daily Plan</span>
            <strong>{currency.format(plannedDailyAllowance)}</strong>
          </div>
        </div>
      </section>

      <section className="summary-grid" aria-label="Monthly summary">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <article className={`metric-card ${card.tone}`} key={card.label}>
              <div>
                <span>{card.label}</span>
                <strong>{currency.format(card.amount)}</strong>
                <p>{card.detail}</p>
              </div>
              <div className="metric-icon">
                <Icon size={20} />
              </div>
            </article>
          );
        })}
      </section>

      <section className="content-grid">
        <SpendingTrend
          monthlyTrend={monthlyTrend}
          selectedMonthLabel={selectedMonthLabel}
          totalExpenses={totalExpenses}
        />
        <CategorySplit categoryBreakdown={categoryBreakdown} />
        <BudgetPreview budgets={budgets} onViewBudgets={onViewBudgets} />
        <RecentTransactions transactions={transactions} />
        <AccountsChart accounts={accounts} />
        <article className="panel quick-actions">
          <div className="panel-header">
            <div>
              <span>Workflow</span>
              <h2>Studio Actions</h2>
            </div>
          </div>
          <button className="primary-button" type="button" onClick={onAddEntry}>
            <Plus size={18} />
            New Transaction
          </button>
          <button className="secondary-button" type="button" onClick={onViewBudgets}>
            <Landmark size={17} />
            Tune Budgets
          </button>
        </article>
      </section>
    </>
  );
}

function PlanView({
  afterBills,
  billForm,
  bills,
  budgetForm,
  budgets,
  canCopyPreviousPlan,
  dataMessage,
  monthlySalary,
  salaryInput,
  plannedDailyAllowance,
  plannedOutflow,
  plannedRemaining,
  previousMonthLabel,
  totalBills,
  totalBudgetLimit,
  onBillFormChange,
  onBillSubmit,
  onBudgetChange,
  onBudgetRemove,
  onBudgetSubmit,
  onCopyPreviousPlan,
  onRemoveBill,
  onSalaryChange,
}) {
  return (
    <>
      <section className="hero-band plan-hero">
        <div className="hero-copy">
          <span>Monthly salary</span>
          <label className="salary-input">
            <span>Salary amount</span>
            <input
              min="0"
              step="1"
              inputMode="numeric"
              type="text"
              value={salaryInput}
              onChange={(event) => onSalaryChange(normalizeMoneyInput(event.target.value))}
              placeholder="0"
            />
          </label>
          <p>
            Plan every peso before the month starts: salary, fixed bills,
            flexible budgets, and what remains.
          </p>
          <div className="plan-copy-row">
            <button
              className="secondary-button"
              type="button"
              onClick={onCopyPreviousPlan}
              disabled={!canCopyPreviousPlan}
              title={`Copy salary, bills, and budgets from ${previousMonthLabel}`}
            >
              <Copy size={17} />
              Copy {previousMonthLabel} Plan
            </button>
            {dataMessage && <span className="success-message">{dataMessage}</span>}
          </div>
        </div>
        <div className="hero-metrics">
          <div>
            <span>After Bills</span>
            <strong>{currency.format(afterBills)}</strong>
          </div>
          <div>
            <span>After Plan</span>
            <strong>{currency.format(plannedRemaining)}</strong>
          </div>
        </div>
      </section>

      <section className="plan-summary-grid">
        <article className="metric-card gold">
          <div>
            <span>Fixed Bills</span>
            <strong>{currency.format(totalBills)}</strong>
            <p>{bills.length} monthly obligations</p>
          </div>
          <div className="metric-icon">
            <ReceiptText size={20} />
          </div>
        </article>
        <article className="metric-card neutral">
          <div>
            <span>Flexible Budgets</span>
            <strong>{currency.format(totalBudgetLimit)}</strong>
            <p>Food, transport, shopping, personal</p>
          </div>
          <div className="metric-icon">
            <Landmark size={20} />
          </div>
        </article>
        <article className={`metric-card ${plannedRemaining >= 0 ? "positive" : "negative"}`}>
          <div>
            <span>Plan Balance</span>
            <strong>{currency.format(plannedRemaining)}</strong>
            <p>{plannedRemaining >= 0 ? "Unassigned money" : "Over planned income"}</p>
          </div>
          <div className="metric-icon">
            <WalletCards size={20} />
          </div>
        </article>
        <article className="metric-card gold">
          <div>
            <span>Daily Remainder</span>
            <strong>{currency.format(plannedDailyAllowance)}</strong>
            <p>Based on 30 days</p>
          </div>
          <div className="metric-icon">
            <PiggyBank size={20} />
          </div>
        </article>
      </section>

      <section className="content-grid">
        <article className="panel plan-panel">
          <div className="panel-header">
            <div>
              <span>Monthly bills</span>
              <h2>Fixed Obligations</h2>
            </div>
            <strong>{currency.format(totalBills)}</strong>
          </div>
          <form className="bill-form" onSubmit={onBillSubmit}>
            <label>
              Bill
              <input
                value={billForm.name}
                onChange={(event) =>
                  onBillFormChange((current) => ({ ...current, name: event.target.value }))
                }
                placeholder="Electricity, internet, allowance"
                required
              />
            </label>
            <label>
              Amount
              <input
                min="1"
                step="1"
                type="number"
                value={billForm.amount}
                onChange={(event) =>
                  onBillFormChange((current) => ({ ...current, amount: event.target.value }))
                }
                placeholder="0"
                required
              />
            </label>
            <label>
              Type
              <select
                value={billForm.icon}
                onChange={(event) =>
                  onBillFormChange((current) => ({ ...current, icon: event.target.value }))
                }
              >
                <option value="card">Loan / CC</option>
                <option value="electric">Electricity</option>
                <option value="wifi">Internet</option>
                <option value="home">Monthly Amortization</option>
                <option value="investment">Investment</option>
                <option value="allowance">Parent Allowance</option>
              </select>
            </label>
            <button className="primary-button submit-button" type="submit">
              <Plus size={18} />
              Add Bill
            </button>
          </form>
          <div className="bill-list">
            {bills.map((bill) => (
              <div className="bill-row" key={bill.id}>
                <div className="bill-icon">
                  <BillIcon type={bill.icon} />
                </div>
                <div>
                  <strong>{bill.name}</strong>
                  <span>{bill.category}</span>
                </div>
                <em>{currency.format(bill.amount)}</em>
                <button
                  className="icon-button danger"
                  type="button"
                  aria-label={`Remove ${bill.name}`}
                  onClick={() => onRemoveBill(bill.id)}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        </article>

        <article className="panel plan-panel">
          <div className="panel-header">
            <div>
              <span>Monthly budgets</span>
              <h2>Flexible Spending</h2>
            </div>
            <strong>{currency.format(totalBudgetLimit)}</strong>
          </div>
          <form className="budget-form compact-form" onSubmit={onBudgetSubmit}>
            <label>
              Category
              <select
                value={budgetForm.category}
                onChange={(event) =>
                  onBudgetChange((current) => ({ ...current, category: event.target.value }))
                }
              >
                {categoryOptions
                  .filter((category) => category.name !== "Income")
                  .map((category) => (
                    <option key={category.name}>{category.name}</option>
                  ))}
              </select>
            </label>
            <label>
              Limit
              <input
                min="1"
                step="1"
                type="number"
                value={budgetForm.limit}
                onChange={(event) =>
                  onBudgetChange((current) => ({ ...current, limit: event.target.value }))
                }
                placeholder="0"
                required
              />
            </label>
            <button className="primary-button submit-button" type="submit">
              <Check size={18} />
              Save
            </button>
          </form>
          <div className="budget-list spacious">
            {budgets.map((budget) => (
              <div className="budget-row" key={budget.id}>
                <div>
                  <strong>{budget.category}</strong>
                  <span>{currency.format(budget.limit)} planned</span>
                </div>
                <div className="progress-shell" aria-label={`${budget.category} ${budget.used}% used`}>
                  <span style={{ width: `${Math.min(budget.used, 100)}%` }} />
                </div>
                <em>{budget.used}%</em>
                <button
                  className="icon-button danger"
                  type="button"
                  aria-label={`Remove ${budget.category} budget`}
                  onClick={() => onBudgetRemove(budget.id)}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        </article>

        <article className="panel wide allocation-panel">
          <div className="panel-header">
            <div>
              <span>Allocation</span>
              <h2>Salary Breakdown</h2>
            </div>
            <strong>{currency.format(plannedOutflow)} planned</strong>
          </div>
          <div className="allocation-bars">
            <div>
              <span>Bills</span>
              <strong>{percentage(totalBills, monthlySalary)}%</strong>
              <div className="progress-shell tall">
                <span style={{ width: `${Math.min(percentage(totalBills, monthlySalary), 100)}%` }} />
              </div>
            </div>
            <div>
              <span>Flexible</span>
              <strong>{percentage(totalBudgetLimit, monthlySalary)}%</strong>
              <div className="progress-shell tall">
                <span style={{ width: `${Math.min(percentage(totalBudgetLimit, monthlySalary), 100)}%` }} />
              </div>
            </div>
            <div>
              <span>Remaining</span>
              <strong>{percentage(Math.max(plannedRemaining, 0), monthlySalary)}%</strong>
              <div className="progress-shell tall">
                <span style={{ width: `${Math.min(percentage(Math.max(plannedRemaining, 0), monthlySalary), 100)}%` }} />
              </div>
            </div>
          </div>
        </article>
      </section>
    </>
  );
}

function BillIcon({ type }) {
  if (type === "electric") return <Zap size={18} />;
  if (type === "wifi") return <Wifi size={18} />;
  if (type === "home") return <Home size={18} />;
  if (type === "investment") return <TrendingUp size={18} />;
  if (type === "allowance") return <HandCoins size={18} />;
  return <CreditCard size={18} />;
}

function TransactionsView({
  categoryFilter,
  categoryOptionsForTransactions,
  editingId,
  filteredTransactions,
  form,
  searchTerm,
  typeFilter,
  onCategoryFilter,
  onDelete,
  onEdit,
  onReset,
  onSearch,
  onSubmit,
  onTypeFilter,
  onUpdateForm,
}) {
  return (
    <section className="content-grid">
      <article className="panel transaction-studio">
        <div className="panel-header">
          <div>
            <span>Manual entry</span>
            <h2>{editingId ? "Edit Transaction" : "Add Transaction"}</h2>
          </div>
          {editingId && (
            <button className="text-button" type="button" onClick={onReset}>
              <X size={16} />
              Cancel
            </button>
          )}
        </div>
        <TransactionForm
          categoryOptionsForTransactions={categoryOptionsForTransactions}
          editingId={editingId}
          form={form}
          onSubmit={onSubmit}
          onUpdateForm={onUpdateForm}
        />
      </article>

      <article className="panel wide transaction-ledger">
        <TransactionFilters
          categoryFilter={categoryFilter}
          categoryOptionsForTransactions={categoryOptionsForTransactions}
          count={filteredTransactions.length}
          searchTerm={searchTerm}
          typeFilter={typeFilter}
          onCategoryFilter={onCategoryFilter}
          onSearch={onSearch}
          onTypeFilter={onTypeFilter}
        />
        <TransactionList transactions={filteredTransactions} onDelete={onDelete} onEdit={onEdit} />
      </article>
    </section>
  );
}

function TransactionForm({ categoryOptionsForTransactions, editingId, form, onSubmit, onUpdateForm }) {
  return (
    <form className="transaction-form" onSubmit={onSubmit}>
      <div className="type-toggle" aria-label="Transaction type">
        <button
          className={form.type === "expense" ? "selected" : ""}
          type="button"
          onClick={() => onUpdateForm("type", "expense")}
        >
          <ArrowDownRight size={17} />
          Expense
        </button>
        <button
          className={form.type === "income" ? "selected" : ""}
          type="button"
          onClick={() => onUpdateForm("type", "income")}
        >
          <ArrowUpRight size={17} />
          Income
        </button>
      </div>

      <label>
        Title
        <input
          value={form.title}
          onChange={(event) => onUpdateForm("title", event.target.value)}
          placeholder="Dinner, salary, rent"
          required
        />
      </label>

      <label>
        Amount
        <input
          min="1"
          step="1"
          type="number"
          value={form.amount}
          onChange={(event) => onUpdateForm("amount", event.target.value)}
          placeholder="0"
          required
        />
      </label>

      <label>
        Category
        <select
          value={form.category}
          onChange={(event) => onUpdateForm("category", event.target.value)}
          disabled={form.type === "income"}
        >
          {categoryOptionsForTransactions
            .filter((category) =>
              form.type === "income" ? category === "Income" : category !== "Income",
            )
            .map((category) => (
              <option key={category}>{category}</option>
            ))}
        </select>
      </label>

      <label>
        Account
        <select value={form.account} onChange={(event) => onUpdateForm("account", event.target.value)}>
          {accountOptions.map((account) => (
            <option key={account}>{account}</option>
          ))}
        </select>
      </label>

      <label>
        Date
        <input
          type="date"
          value={form.date}
          onChange={(event) => onUpdateForm("date", event.target.value)}
          required
        />
      </label>

      <label className="form-wide">
        Note
        <input
          value={form.note}
          onChange={(event) => onUpdateForm("note", event.target.value)}
          placeholder="Optional detail"
        />
      </label>

      <button className="primary-button submit-button" type="submit">
        {editingId ? <Check size={18} /> : <Plus size={18} />}
        {editingId ? "Save Changes" : "Add Entry"}
      </button>
    </form>
  );
}

function TransactionFilters({
  categoryFilter,
  categoryOptionsForTransactions,
  count,
  searchTerm,
  typeFilter,
  onCategoryFilter,
  onSearch,
  onTypeFilter,
}) {
  return (
    <>
      <div className="panel-header ledger-header">
        <div>
          <span>Latest movement</span>
          <h2>Transactions</h2>
        </div>
        <strong>{count} shown</strong>
      </div>

      <div className="filter-bar">
        <label className="search-field">
          <Search size={17} />
          <input
            value={searchTerm}
            onChange={(event) => onSearch(event.target.value)}
            placeholder="Search transactions"
          />
        </label>

        <label>
          <Filter size={16} />
          <select value={typeFilter} onChange={(event) => onTypeFilter(event.target.value)}>
            <option value="all">All types</option>
            <option value="income">Income</option>
            <option value="expense">Expenses</option>
          </select>
        </label>

        <label>
          Category
          <select value={categoryFilter} onChange={(event) => onCategoryFilter(event.target.value)}>
            <option value="all">All categories</option>
            {categoryOptionsForTransactions.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>
      </div>
    </>
  );
}

function TransactionList({ transactions, onDelete, onEdit }) {
  const canManage = onDelete && onEdit;

  return (
    <div className="transaction-list">
      {transactions.map((transaction) => (
        <div className={`transaction-row ${canManage ? "editable" : ""}`} key={transaction.id}>
          <div className={`transaction-icon ${transaction.type}`}>
            {transaction.type === "income" ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
          </div>
          <div>
            <strong>{transaction.title}</strong>
            <span>
              {transaction.account} • {transaction.category}
            </span>
          </div>
          <time>{formatShortDate(transaction.date)}</time>
          <em className={transaction.type === "income" ? "income" : "expense"}>
            {transaction.type === "income" ? "+" : "-"}
            {currency.format(transaction.amount)}
          </em>
          {canManage && (
            <div className="row-actions">
              <button
                className="icon-button"
                type="button"
                aria-label={`Edit ${transaction.title}`}
                onClick={() => onEdit(transaction)}
              >
                <Edit3 size={15} />
              </button>
              <button
                className="icon-button danger"
                type="button"
                aria-label={`Delete ${transaction.title}`}
                onClick={() => onDelete(transaction.id)}
              >
                <Trash2 size={15} />
              </button>
            </div>
          )}
        </div>
      ))}
      {transactions.length === 0 && (
        <div className="empty-state">
          <strong>No transactions found</strong>
          <span>Adjust your filters or add a new entry.</span>
        </div>
      )}
    </div>
  );
}

function BudgetsView({
  budgets,
  form,
  selectedMonthLabel,
  totalBudgetLimit,
  totalExpenses,
  onChange,
  onRemove,
  onSubmit,
}) {
  return (
    <>
      <section className="hero-band compact-hero">
        <div className="hero-copy">
          <span>Monthly budget limit</span>
          <strong>{currency.format(totalBudgetLimit)}</strong>
          <p>
            You have used {percentage(totalExpenses, totalBudgetLimit)}% of your
            planned {selectedMonthLabel} spending envelope.
          </p>
        </div>
        <div className="hero-metrics">
          <div>
            <span>Spent</span>
            <strong>{currency.format(totalExpenses)}</strong>
          </div>
          <div>
            <span>Remaining</span>
            <strong>{currency.format(totalBudgetLimit - totalExpenses)}</strong>
          </div>
        </div>
      </section>

      <section className="content-grid">
        <article className="panel transaction-studio">
          <div className="panel-header">
            <div>
              <span>Category limit</span>
              <h2>Set Monthly Budget</h2>
            </div>
          </div>
          <form className="budget-form" onSubmit={onSubmit}>
            <label>
              Category
              <select
                value={form.category}
                onChange={(event) => onChange((current) => ({ ...current, category: event.target.value }))}
              >
                {categoryOptions
                  .filter((category) => category.name !== "Income")
                  .map((category) => (
                    <option key={category.name}>{category.name}</option>
                  ))}
              </select>
            </label>
            <label>
              Monthly Limit
              <input
                min="1"
                step="1"
                type="number"
                value={form.limit}
                onChange={(event) => onChange((current) => ({ ...current, limit: event.target.value }))}
                placeholder="0"
                required
              />
            </label>
            <button className="primary-button submit-button" type="submit">
              <Check size={18} />
              Save Limit
            </button>
          </form>
        </article>

        <article className="panel wide transaction-ledger">
          <div className="panel-header">
            <div>
              <span>Progress</span>
              <h2>Budget Lines</h2>
            </div>
            <strong>{budgets.length} categories</strong>
          </div>
          <div className="budget-card-grid">
            {budgets.map((budget) => (
              <div className={`budget-card ${budget.used >= 100 ? "over" : ""}`} key={budget.id}>
                <div className="budget-card-top">
                  <div>
                    <span>{budget.category}</span>
                    <strong>{budget.used}% used</strong>
                  </div>
                  <button
                    className="icon-button danger"
                    type="button"
                    aria-label={`Remove ${budget.category} budget`}
                    onClick={() => onRemove(budget.id)}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
                <div className="progress-shell tall">
                  <span style={{ width: `${Math.min(budget.used, 100)}%` }} />
                </div>
                <div className="budget-card-bottom">
                  <span>{currency.format(budget.spent)} spent</span>
                  <span>{currency.format(budget.limit)} limit</span>
                </div>
                <p>
                  {budget.remaining >= 0
                    ? `${currency.format(budget.remaining)} left this month`
                    : `${currency.format(Math.abs(budget.remaining))} over limit`}
                </p>
              </div>
            ))}
          </div>
        </article>
      </section>
    </>
  );
}

function GoalsView({
  form,
  goals,
  totalGoalSaved,
  totalGoalTarget,
  onAddContribution,
  onChange,
  onRemove,
  onSubmit,
}) {
  return (
    <>
      <section className="hero-band compact-hero">
        <div className="hero-copy">
          <span>Goal progress</span>
          <strong>{currency.format(totalGoalSaved)}</strong>
          <p>
            Your savings goals are {percentage(totalGoalSaved, totalGoalTarget)}%
            funded across {goals.length} active targets.
          </p>
        </div>
        <div className="hero-metrics">
          <div>
            <span>Total Target</span>
            <strong>{currency.format(totalGoalTarget)}</strong>
          </div>
          <div>
            <span>Remaining</span>
            <strong>{currency.format(totalGoalTarget - totalGoalSaved)}</strong>
          </div>
        </div>
      </section>

      <section className="content-grid">
        <article className="panel transaction-studio">
          <div className="panel-header">
            <div>
              <span>Savings target</span>
              <h2>Create Goal</h2>
            </div>
          </div>
          <form className="goal-form" onSubmit={onSubmit}>
            <label>
              Goal Name
              <input
                value={form.title}
                onChange={(event) => onChange((current) => ({ ...current, title: event.target.value }))}
                placeholder="Emergency fund"
                required
              />
            </label>
            <label>
              Target
              <input
                min="1"
                step="1"
                type="number"
                value={form.target}
                onChange={(event) => onChange((current) => ({ ...current, target: event.target.value }))}
                placeholder="0"
                required
              />
            </label>
            <label>
              Saved
              <input
                min="0"
                step="1"
                type="number"
                value={form.saved}
                onChange={(event) => onChange((current) => ({ ...current, saved: event.target.value }))}
                placeholder="0"
              />
            </label>
            <label>
              Deadline
              <input
                type="date"
                value={form.deadline}
                onChange={(event) => onChange((current) => ({ ...current, deadline: event.target.value }))}
                required
              />
            </label>
            <button className="primary-button submit-button" type="submit">
              <Target size={18} />
              Add Goal
            </button>
          </form>
        </article>

        <article className="panel wide transaction-ledger">
          <div className="panel-header">
            <div>
              <span>Milestones</span>
              <h2>Active Goals</h2>
            </div>
            <strong>{percentage(totalGoalSaved, totalGoalTarget)}% funded</strong>
          </div>
          <div className="goal-grid">
            {goals.map((goal) => {
              const progress = percentage(goal.saved, goal.target);
              return (
                <div className="goal-card" key={goal.id}>
                  <div className="goal-ring" style={{ "--progress": `${progress}%` }}>
                    <strong>{progress}%</strong>
                  </div>
                  <div className="goal-details">
                    <div className="goal-title-row">
                      <div>
                        <span>Due {formatShortDate(goal.deadline)}</span>
                        <h3>{goal.title}</h3>
                      </div>
                      <button
                        className="icon-button danger"
                        type="button"
                        aria-label={`Remove ${goal.title}`}
                        onClick={() => onRemove(goal.id)}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                    <p>
                      {currency.format(goal.saved)} saved of {currency.format(goal.target)}
                    </p>
                    <div className="progress-shell tall">
                      <span style={{ width: `${Math.min(progress, 100)}%` }} />
                    </div>
                    <button
                      className="secondary-button"
                      type="button"
                      onClick={() => onAddContribution(goal.id, 1000)}
                    >
                      <Plus size={16} />
                      Add {currency.format(1000)}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </article>
      </section>
    </>
  );
}

function ReportsView({ categoryBreakdown, monthlyTrend, selectedMonthLabel, totalExpenses, totalIncome }) {
  return (
    <section className="content-grid">
      <SpendingTrend
        monthlyTrend={monthlyTrend}
        selectedMonthLabel={selectedMonthLabel}
        totalExpenses={totalExpenses}
      />
      <CategorySplit categoryBreakdown={categoryBreakdown} />
      <article className="panel wide">
        <div className="panel-header">
          <div>
            <span>Cashflow</span>
            <h2>Income Versus Expense</h2>
          </div>
        </div>
        <div className="bar-frame">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={[
                { name: "Income", amount: totalIncome },
                { name: "Expenses", amount: totalExpenses },
              ]}
            >
              <XAxis dataKey="name" tickLine={false} axisLine={false} />
              <YAxis hide />
              <Tooltip formatter={(value) => currency.format(value)} contentStyle={tooltipStyle} />
              <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                <Cell fill="#99d18a" />
                <Cell fill="#d6b36a" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </article>
    </section>
  );
}

function SettingsView({
  authError,
  authReady,
  authUser,
  dataMessage,
  dataReady,
  firebaseEnabled,
  transactionCount,
  onExportTransactions,
  onGoogleSignIn,
  onImportTransactions,
  onLogout,
  onResetDemoData,
}) {
  return (
    <section className="content-grid">
      <article className="panel wide">
        <div className="panel-header">
          <div>
            <span>Preferences</span>
            <h2>Budget Studio Setup</h2>
          </div>
        </div>
        <div className="settings-list">
          <div>
            <strong>Currency</strong>
            <span>Philippine peso only</span>
          </div>
          <div>
            <strong>Data mode</strong>
            <span>
              {firebaseEnabled ? "Firebase Auth + Firestore" : "Local browser storage"} by month
            </span>
          </div>
          <div>
            <strong>Theme</strong>
            <span>Dark luxury/minimal</span>
          </div>
          <div>
            <strong>Sync status</strong>
            <span>
              {firebaseEnabled
                ? authUser
                  ? `Signed in as ${authUser.email}`
                  : "Firebase configured, sign in to sync"
                : "Waiting for .env Firebase config"}
            </span>
          </div>
        </div>
      </article>

      <article className="panel auth-panel">
        <div className="panel-header">
          <div>
            <span>Account</span>
            <h2>{firebaseEnabled ? "Firebase Login" : "Firebase Setup"}</h2>
          </div>
        </div>

        {!firebaseEnabled && (
          <div className="setup-note">
            <strong>Local mode is active</strong>
            <span>
              Create a Firebase web app, copy its config into `.env`, then restart
              the app to enable email/password login and Firestore sync.
            </span>
          </div>
        )}

        {firebaseEnabled && !authReady && (
          <div className="setup-note">
            <strong>Preparing Firebase</strong>
            <span>Checking your auth session.</span>
          </div>
        )}

        {firebaseEnabled && authReady && authUser && (
          <div className="setup-note">
            <strong>{dataReady ? "Cloud sync active" : "Loading your cloud data"}</strong>
            <span>{authUser.email}</span>
            <button className="secondary-button" type="button" onClick={onLogout}>
              Sign Out
            </button>
          </div>
        )}

        {firebaseEnabled && authReady && !authUser && (
          <div className="auth-form">
            <div className="setup-note">
              <strong>Google sign-in is ready</strong>
              <span>
                Enable Google in Firebase Authentication providers, then continue
                with the same Google account you want attached to Budget Studio.
              </span>
            </div>
            {authError && <span className="form-error">{authError}</span>}
            <button className="google-button" type="button" onClick={onGoogleSignIn}>
              <span>G</span>
              Continue with Google
            </button>
          </div>
        )}
      </article>

      <article className="panel auth-panel">
        <div className="panel-header">
          <div>
            <span>Backup</span>
            <h2>Data Tools</h2>
          </div>
        </div>
        <div className="data-tool-list">
          <button className="secondary-button" type="button" onClick={onExportTransactions}>
            <Download size={17} />
            Export CSV
          </button>
          <label className="import-button">
            <Upload size={17} />
            Import CSV
            <input
              accept=".csv,text/csv"
              type="file"
              onChange={(event) => {
                onImportTransactions(event.target.files?.[0]);
                event.target.value = "";
              }}
            />
          </label>
          <button className="secondary-button danger-outline" type="button" onClick={onResetDemoData}>
            Start Fresh
          </button>
        </div>
        <div className="setup-note compact-note">
          <strong>{transactionCount} transactions saved</strong>
          <span>
            CSV columns: date, type, title, amount, category, account, note.
          </span>
          {dataMessage && <span className="success-message">{dataMessage}</span>}
        </div>
      </article>
    </section>
  );
}

function SpendingTrend({ monthlyTrend, selectedMonthLabel, totalExpenses }) {
  return (
    <article className="panel wide">
      <div className="panel-header">
        <div>
          <span>Daily spending</span>
          <h2>{selectedMonthLabel} Rhythm</h2>
        </div>
        <strong>{currency.format(totalExpenses)} total</strong>
      </div>
      <div className="chart-frame">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={monthlyTrend}>
            <defs>
              <linearGradient id="spendGlow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#d6b36a" stopOpacity={0.55} />
                <stop offset="95%" stopColor="#d6b36a" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis dataKey="day" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} />
            <Tooltip formatter={(value) => currency.format(value)} contentStyle={tooltipStyle} />
            <Area
              type="monotone"
              dataKey="spend"
              stroke="#d6b36a"
              strokeWidth={3}
              fill="url(#spendGlow)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </article>
  );
}

function CategorySplit({ categoryBreakdown }) {
  return (
    <article className="panel">
      <div className="panel-header">
        <div>
          <span>Category split</span>
          <h2>Where It Goes</h2>
        </div>
      </div>
      <div className="donut-wrap">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={categoryBreakdown} dataKey="value" innerRadius={58} outerRadius={86} paddingAngle={4}>
              {categoryBreakdown.map((item) => (
                <Cell key={item.name} fill={item.color} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => currency.format(value)} contentStyle={tooltipStyle} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="legend-list">
        {categoryBreakdown.slice(0, 4).map((item) => (
          <div key={item.name}>
            <span style={{ backgroundColor: item.color }} />
            <p>{item.name}</p>
            <strong>{currency.format(item.value)}</strong>
          </div>
        ))}
      </div>
    </article>
  );
}

function BudgetPreview({ budgets, onViewBudgets }) {
  return (
    <article className="panel">
      <div className="panel-header">
        <div>
          <span>Budget health</span>
          <h2>Monthly Limits</h2>
        </div>
        <button className="text-button" type="button" onClick={onViewBudgets}>
          Manage
        </button>
      </div>
      <div className="budget-list">
        {budgets.slice(0, 4).map((budget) => (
          <div className="budget-row" key={budget.id}>
            <div>
              <strong>{budget.category}</strong>
              <span>
                {currency.format(budget.spent)} of {currency.format(budget.limit)}
              </span>
            </div>
            <div className="progress-shell" aria-label={`${budget.category} budget ${budget.used}% used`}>
              <span style={{ width: `${Math.min(budget.used, 100)}%` }} />
            </div>
            <em>{budget.used}%</em>
          </div>
        ))}
      </div>
    </article>
  );
}

function RecentTransactions({ transactions }) {
  return (
    <article className="panel wide transaction-ledger">
      <div className="panel-header ledger-header">
        <div>
          <span>Latest movement</span>
          <h2>Recent Transactions</h2>
        </div>
      </div>
      <TransactionList
        transactions={[...transactions].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5)}
      />
    </article>
  );
}

function AccountsChart({ accounts }) {
  return (
    <article className="panel">
      <div className="panel-header">
        <div>
          <span>Wallets</span>
          <h2>Accounts</h2>
        </div>
      </div>
      <div className="bar-frame">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={accounts}>
            <XAxis dataKey="name" tickLine={false} axisLine={false} />
            <YAxis hide />
            <Tooltip formatter={(value) => currency.format(value)} contentStyle={tooltipStyle} />
            <Bar dataKey="amount" radius={[6, 6, 0, 0]} fill="#d6b36a" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </article>
  );
}

createRoot(document.getElementById("root")).render(<App />);

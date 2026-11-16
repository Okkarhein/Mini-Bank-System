
(function () {
  "use strict";

  // ==============================
  // ACCOUNT SETTINGS
  // ==============================

  const startingBalance = 120000000;
  let balance = startingBalance;

  let activeFilter = "all";
  let selectedQuickAmount = null;
  let toastTimer = null;

  // MMK currency formatter
  const money = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });

  function formatMoney(amount) {
    return money.format(amount) + " MMK";
  }

  // ==============================
  // DATE FUNCTION
  // ==============================

  function daysAgo(days, hour, minute) {
    const date = new Date();

    date.setDate(date.getDate() - days);
    date.setHours(hour, minute, 0, 0);

    return date;
  }

  // ==============================
  // TRANSACTION DATA
  // ==============================

  let transactions = [
    {
      name: "Salary deposit",
      type: "income",
      amount: 3200000,
      date: daysAgo(2, 9, 15)
    },
    {
      name: "Grocery market",
      type: "expense",
      amount: 86420,
      date: daysAgo(3, 16, 42)
    },
    {
      name: "Coffee House",
      type: "expense",
      amount: 12500,
      date: daysAgo(4, 8, 30)
    },
    {
      name: "Transfer from savings",
      type: "income",
      amount: 250000,
      date: daysAgo(6, 11, 5)
    },
    {
      name: "Electric bill",
      type: "expense",
      amount: 74180,
      date: daysAgo(8, 14, 20)
    }
  ];

  // ==============================
  // HTML ELEMENTS
  // ==============================

  const balanceElement = document.getElementById("balance");
  const listElement = document.getElementById("transaction-list");
  const toastElement = document.getElementById("toast");

  const depositButton = document.getElementById("deposit-button");
  const withdrawButton = document.getElementById("withdraw-button");
  const exportButton = document.getElementById("export-button");

  const todayElement = document.getElementById("today-date");

  const monthlyDeposits = document.getElementById("monthly-deposits");
  const monthlyWithdrawals = document.getElementById("monthly-withdrawals");
  const transactionCount = document.getElementById("transaction-count");

  // Check required HTML elements
  if (
    !balanceElement ||
    !listElement ||
    !toastElement ||
    !depositButton ||
    !withdrawButton ||
    !exportButton ||
    !todayElement ||
    !monthlyDeposits ||
    !monthlyWithdrawals ||
    !transactionCount
  ) {
    console.error("Some required HTML elements are missing.");
    return;
  }

  // ==============================
  // TODAY'S DATE
  // ==============================

  todayElement.textContent = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric"
  }).format(new Date());

  // ==============================
  // TOAST NOTIFICATION
  // ==============================

  function showToast(message) {
    toastElement.textContent = message;
    toastElement.classList.add("show");

    clearTimeout(toastTimer);

    toastTimer = setTimeout(function () {
      toastElement.classList.remove("show");
    }, 2800);
  }

  // ==============================
  // RESET QUICK AMOUNTS
  // ==============================

  function resetQuickAmounts() {
    selectedQuickAmount = null;

    document.querySelectorAll(".quick-amount").forEach(function (button) {
      button.classList.remove("selected");
      button.setAttribute("aria-pressed", "false");
    });
  }

  // ==============================
  // RENDER TRANSACTIONS
  // ==============================

  function render() {

    // Update available balance
    balanceElement.textContent = formatMoney(balance);

    // Filter transactions
    const visibleTransactions = transactions.filter(function (transaction) {
      return activeFilter === "all" ||
        transaction.type === activeFilter;
    });

    listElement.replaceChildren();

    if (visibleTransactions.length === 0) {

      const emptyItem = document.createElement("li");

      emptyItem.className = "empty-state";
      emptyItem.textContent = "No transactions in this category yet.";

      listElement.appendChild(emptyItem);

    } else {

      visibleTransactions.forEach(function (transaction) {

        const isIncome = transaction.type === "income";

        const item = document.createElement("li");
        item.className = "transaction";

        const info = document.createElement("div");
        info.className = "transaction-info";

        const icon = document.createElement("span");

        icon.className =
          "transaction-icon" + (isIncome ? " income" : "");

        // Create SVG icon
        const svg = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "svg"
        );

        svg.setAttribute("width", "17");
        svg.setAttribute("height", "17");
        svg.setAttribute("viewBox", "0 0 20 20");
        svg.setAttribute("fill", "none");
        svg.setAttribute("aria-hidden", "true");

        const path = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "path"
        );

        path.setAttribute(
          "d",
          isIncome
            ? "M10 15V5m0 0L6 9m4-4 4 4"
            : "M10 5v10m0 0 4-4m-4 4-4-4"
        );

        path.setAttribute("stroke", "currentColor");
        path.setAttribute("stroke-width", "1.6");
        path.setAttribute("stroke-linecap", "round");
        path.setAttribute("stroke-linejoin", "round");

        svg.appendChild(path);
        icon.appendChild(svg);

        // Transaction details
        const details = document.createElement("div");

        const title = document.createElement("div");
        title.className = "transaction-title";
        title.textContent = transaction.name;

        const date = document.createElement("div");
        date.className = "transaction-date";

        date.textContent = new Intl.DateTimeFormat("en-US", {
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit"
        }).format(transaction.date);

        details.append(title, date);
        info.append(icon, details);

        // Transaction amount
        const amount = document.createElement("span");

        amount.className =
          "transaction-amount" + (isIncome ? " income" : "");

        amount.textContent =
          (isIncome ? "+" : "−") +
          formatMoney(transaction.amount);

        item.append(info, amount);

        listElement.appendChild(item);

      });
    }

    // ==============================
    // MONTHLY SUMMARY
    // ==============================

    const now = new Date();

    const thisMonth = transactions.filter(function (transaction) {
      return (
        transaction.date.getMonth() === now.getMonth() &&
        transaction.date.getFullYear() === now.getFullYear()
      );
    });

    const deposits = thisMonth
      .filter(function (transaction) {
        return transaction.type === "income";
      })
      .reduce(function (total, transaction) {
        return total + transaction.amount;
      }, 0);

    const withdrawals = thisMonth
      .filter(function (transaction) {
        return transaction.type === "expense";
      })
      .reduce(function (total, transaction) {
        return total + transaction.amount;
      }, 0);

    monthlyDeposits.textContent = formatMoney(deposits);

    monthlyWithdrawals.textContent = formatMoney(withdrawals);

    transactionCount.textContent = String(thisMonth.length);

  }

  // ==============================
  // DEPOSIT AND WITHDRAW
  // ==============================

  function requestAmount(action) {

    let amount = selectedQuickAmount;

    if (amount === null) {

      const amountText = window.prompt(
        "Enter the amount to " + action + " (MMK):",
        ""
      );

      if (amountText === null) return;

      const cleanedAmount = amountText.trim();

      // Validate input
      if (!/^\d+(\.\d{1,2})?$/.test(cleanedAmount)) {
        showToast("Please enter a valid MMK amount.");
        return;
      }

      amount = Number(cleanedAmount);

    }

    if (!Number.isFinite(amount) || amount <= 0) {
      showToast("Enter a valid amount greater than 0 MMK.");
      return;
    }

    if (Math.round(amount * 100) !== amount * 100) {
      showToast("Amount can only have two decimal places.");
      return;
    }

    // Check available balance
    if (action === "withdraw" && amount > balance) {
      showToast("Insufficient available balance.");
      return;
    }

    // Calculate balance in cents
    const amountInCents = Math.round(amount * 100);
    const balanceInCents = Math.round(balance * 100);

    const newBalanceInCents =
      action === "deposit"
        ? balanceInCents + amountInCents
        : balanceInCents - amountInCents;

    if (newBalanceInCents < 0) {
      showToast("Insufficient balance.");
      return;
    }

    balance = newBalanceInCents / 100;

    // Add new transaction
    transactions.unshift({
      name: action === "deposit"
        ? "Cash deposit"
        : "Cash withdrawal",

      type: action === "deposit" ? "income" : "expense",

      amount: amountInCents / 100,

      date: new Date()
    });

    resetQuickAmounts();

    render();

    showToast(
      formatMoney(amount) +
      (action === "deposit"
        ? " deposited successfully."
        : " withdrawn successfully.")
    );

  }

  // ==============================
  // DEPOSIT BUTTON
  // ==============================

  depositButton.addEventListener("click", function () {
    requestAmount("deposit");
  });

  // ==============================
  // WITHDRAW BUTTON
  // ==============================

  withdrawButton.addEventListener("click", function () {
    requestAmount("withdraw");
  });

  // ==============================
  // QUICK AMOUNT BUTTONS
  // ==============================

  document.querySelectorAll(".quick-amount").forEach(function (button) {

    button.addEventListener("click", function () {

      const amount = Number(button.dataset.amount);

      if (!Number.isFinite(amount) || amount <= 0) {
        showToast("Invalid quick amount.");
        return;
      }

      selectedQuickAmount = amount;

      document.querySelectorAll(".quick-amount").forEach(function (quickButton) {

        const isSelected = quickButton === button;

        quickButton.classList.toggle("selected", isSelected);

        quickButton.setAttribute(
          "aria-pressed",
          String(isSelected)
        );

      });

      showToast(
        formatMoney(selectedQuickAmount) +
        " selected. Choose deposit or withdraw."
      );

    });

  });

  // ==============================
  // TRANSACTION FILTERS
  // ==============================

  document.querySelectorAll(".filter-button").forEach(function (button) {

    button.addEventListener("click", function () {

      const filter = button.dataset.filter;

      if (!["all", "income", "expense"].includes(filter)) {
        return;
      }

      activeFilter = filter;

      document.querySelectorAll(".filter-button").forEach(function (filterButton) {

        const isActive = filterButton === button;

        filterButton.classList.toggle("active", isActive);

        filterButton.setAttribute(
          "aria-pressed",
          String(isActive)
        );

      });

      render();

    });

  });

  // ==============================
  // EXPORT CSV
  // ==============================

  exportButton.addEventListener("click", function () {

    const rows = [
      ["Description", "Type", "Amount (MMK)", "Date"]
    ];

    transactions.forEach(function (transaction) {

      rows.push([
        transaction.name,

        transaction.type === "income"
          ? "Deposit"
          : "Withdrawal",

        transaction.amount.toFixed(2),

        transaction.date.toISOString()
      ]);

    });

    // Convert data to CSV
    const csv = rows.map(function (row) {

      return row.map(function (cell) {

        return '"' + String(cell).replace(/"/g, '""') + '"';

      }).join(",");

    }).join("\r\n");

    const blob = new Blob(
      ["\uFEFF" + csv],
      { type: "text/csv;charset=utf-8;" }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = "bzk-transactions-mmk.csv";

    document.body.appendChild(link);

    link.click();

    link.remove();

    setTimeout(function () {
      URL.revokeObjectURL(url);
    }, 1000);

    showToast("Your MMK transaction history has been exported.");

  });

  // ==============================
  // INITIAL RENDER
  // ==============================

  render();

})();

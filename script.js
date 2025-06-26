document.addEventListener("DOMContentLoaded", () => {
  // Tab switching
  const tabs = document.querySelectorAll(".tab-btn");
  const panels = document.querySelectorAll(".tab-panel");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("active"));
      panels.forEach((p) => p.classList.remove("active"));
      tab.classList.add("active");
      document.getElementById(tab.dataset.tab).classList.add("active");
    });
  });

  // Set default tab
  tabs[0].classList.add("active");
  panels[0].classList.add("active");

  // Financial Calculations
  const formatCurrency = (value) => `$${parseFloat(value).toFixed(2)}`;

  // Simple Interest
  document
    .getElementById("simple-interest-form")
    .addEventListener("submit", (e) => {
      e.preventDefault();
      const principal = parseFloat(
        document.getElementById("si-principal").value
      );
      const rate = parseFloat(document.getElementById("si-rate").value) / 100;
      const time = parseFloat(document.getElementById("si-time").value);
      const interest = principal * rate * time;
      const total = principal + interest;
      document.getElementById("si-result").innerHTML = `
            <p>Interest Earned: ${formatCurrency(interest)}</p>
            <p>Total Amount: ${formatCurrency(total)}</p>
        `;
    });

  // Compound Interest
  document
    .getElementById("compound-interest-form")
    .addEventListener("submit", (e) => {
      e.preventDefault();
      const principal = parseFloat(
        document.getElementById("ci-principal").value
      );
      const rate = parseFloat(document.getElementById("ci-rate").value) / 100;
      const compounds = parseFloat(
        document.getElementById("ci-compounds").value
      );
      const time = parseFloat(document.getElementById("ci-time").value);
      const total =
        principal * Math.pow(1 + rate / compounds, compounds * time);
      const interest = total - principal;
      document.getElementById("ci-result").innerHTML = `
            <p>Interest Earned: ${formatCurrency(interest)}</p>
            <p>Total Amount: ${formatCurrency(total)}</p>
        `;
    });

  // Loan Payment
  document
    .getElementById("loan-payment-form")
    .addEventListener("submit", (e) => {
      e.preventDefault();
      const principal = parseFloat(
        document.getElementById("loan-principal").value
      );
      const rate = parseFloat(document.getElementById("loan-rate").value) / 100;
      const payments = parseFloat(
        document.getElementById("loan-payments").value
      );
      const monthlyPayment =
        (principal * (rate * Math.pow(1 + rate, payments))) /
        (Math.pow(1 + rate, payments) - 1);
      const totalPaid = monthlyPayment * payments;
      const totalInterest = totalPaid - principal;
      document.getElementById("loan-result").innerHTML = `
            <p>Monthly Payment: ${formatCurrency(monthlyPayment)}</p>
            <p>Total Paid: ${formatCurrency(totalPaid)}</p>
            <p>Total Interest: ${formatCurrency(totalInterest)}</p>
        `;
    });

  // Mortgage Calculator
  document.getElementById("mortgage-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const principal = parseFloat(
      document.getElementById("mortgage-principal").value
    );
    const annualRate =
      parseFloat(document.getElementById("mortgage-rate").value) / 100;
    const term = parseFloat(document.getElementById("mortgage-term").value);
    const income = parseFloat(document.getElementById("mortgage-income").value);
    const maxPercent =
      parseFloat(document.getElementById("mortgage-max-percent").value) / 100;
    const monthlyRate = annualRate / 12;
    const payments = term * 12;
    const monthlyPayment =
      (principal * (monthlyRate * Math.pow(1 + monthlyRate, payments))) /
      (Math.pow(1 + monthlyRate, payments) - 1);
    const totalPaid = monthlyPayment * payments;
    const totalInterest = totalPaid - principal;
    const maxPayment = income * maxPercent;
    const affordable = monthlyPayment <= maxPayment ? "Yes" : "No";
    document.getElementById("mortgage-result").innerHTML = `
            <p>Monthly Payment: ${formatCurrency(monthlyPayment)}</p>
            <p>Total Paid: ${formatCurrency(totalPaid)}</p>
            <p>Total Interest: ${formatCurrency(totalInterest)}</p>
            <p>Within ${maxPercent * 100}% of Income: ${affordable}</p>
        `;
  });

  // Savings Goal
  document
    .getElementById("savings-goal-form")
    .addEventListener("submit", (e) => {
      e.preventDefault();
      const goal = parseFloat(
        document.getElementById("savings-goal-amount").value
      );
      const current = parseFloat(
        document.getElementById("savings-current").value
      );
      const months = parseFloat(
        document.getElementById("savings-months").value
      );
      const monthlySavings = (goal - current) / months;
      document.getElementById("savings-result").innerHTML = `
            <p>Monthly Savings Needed: ${formatCurrency(monthlySavings)}</p>
        `;
    });

  // Budget Planner
  let budgetChart = null;
  document.getElementById("budget-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const income = parseFloat(document.getElementById("budget-income").value);
    const food = parseFloat(document.getElementById("budget-food").value);
    const transport = parseFloat(
      document.getElementById("budget-transport").value
    );
    const utilities = parseFloat(
      document.getElementById("budget-utilities").value
    );
    const other = parseFloat(document.getElementById("budget-other").value);
    const totalExpenses = food + transport + utilities + other;
    const savings = income - totalExpenses;
    const percentages = {
      Food: ((food / totalExpenses) * 100).toFixed(2),
      Transport: ((transport / totalExpenses) * 100).toFixed(2),
      Utilities: ((utilities / totalExpenses) * 100).toFixed(2),
      Other: ((other / totalExpenses) * 100).toFixed(2),
    };
    document.getElementById("budget-result").innerHTML = `
            <p>Total Expenses: ${formatCurrency(totalExpenses)}</p>
            <p>Food: ${percentages.Food}%</p>
            <p>Transport: ${percentages.Transport}%</p>
            <p>Utilities: ${percentages.Utilities}%</p>
            <p>Other: ${percentages.Other}%</p>
            <p>Possible Savings: ${formatCurrency(savings)}</p>
        `;

    // Update Chart
    if (budgetChart) budgetChart.destroy();
    const ctx = document.getElementById("budget-chart").getContext("2d");
    budgetChart = new Chart(ctx, {
      type: "pie",
      data: {
        labels: ["Food", "Transport", "Utilities", "Other"],
        datasets: [
          {
            data: [food, transport, utilities, other],
            backgroundColor: ["#00ff99", "#ffd700", "#ff4d4d", "#4d79ff"],
            borderColor: "#1a1a1a",
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: "bottom", labels: { color: "#e0e0e0" } },
        },
      },
    });
  });

  // Investment Comparison
  let scenarioCount = 1;
  document.getElementById("add-scenario").addEventListener("click", () => {
    scenarioCount++;
    const scenarioDiv = document.createElement("div");
    scenarioDiv.classList.add("scenario", "mb-4", "border", "p-4", "rounded");
    scenarioDiv.innerHTML = `
            <h3 class="font-semibold">Scenario ${scenarioCount}</h3>
            <div class="mb-2">
                <label class="block">Principal ($)</label>
                <input type="number" step="0.01" class="w-full p-2 border rounded" name="ic-principal" required>
            </div>
            <div class="mb-2">
                <label class="block">Annual Interest Rate (%)</label>
                <input type="number" step="0.01" class="w-full p-2 border rounded" name="ic-rate" required>
            </div>
            <div class="mb-2">
                <label class="block">Time (years)</label>
                <input type="number" step="0.01" class="w-full p-2 border rounded" name="ic-time" required>
            </div>
        `;
    document.getElementById("investment-scenarios").appendChild(scenarioDiv);
  });

  document
    .getElementById("investment-compare-form")
    .addEventListener("submit", (e) => {
      e.preventDefault();
      const scenarios = document.querySelectorAll(
        "#investment-scenarios .scenario"
      );
      let results = "";
      scenarios.forEach((scenario, index) => {
        const principal = parseFloat(
          scenario.querySelector('input[name="ic-principal"]').value
        );
        const rate =
          parseFloat(scenario.querySelector('input[name="ic-rate"]').value) /
          100;
        const time = parseFloat(
          scenario.querySelector('input[name="ic-time"]').value
        );
        const total = principal * Math.pow(1 + rate, time);
        results += `
                <div class="scenario-result">
                    <h3 class="font-semibold">Scenario ${index + 1}</h3>
                    <p>Principal: ${formatCurrency(principal)}</p>
                    <p>Interest Rate: ${(rate * 100).toFixed(2)}%</p>
                    <p>Time: ${time} years</p>
                    <p>Total Amount: ${formatCurrency(total)}</p>
                </div>
            `;
      });
      document.getElementById("ic-result").innerHTML = results;
    });

  // Emergency Fund
  document
    .getElementById("emergency-fund-form")
    .addEventListener("submit", (e) => {
      e.preventDefault();
      const expenses = parseFloat(document.getElementById("ef-expenses").value);
      const months = parseFloat(document.getElementById("ef-months").value);
      const fundNeeded = expenses * months;
      document.getElementById("ef-result").innerHTML = `
            <p>Emergency Fund Needed: ${formatCurrency(fundNeeded)}</p>
            <p>(Based on ${months} months of ${formatCurrency(
        expenses
      )} monthly expenses)</p>
        `;
    });
});

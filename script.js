document.addEventListener("DOMContentLoaded", () => {
  // Audio Elements
  const interactionSound = document.getElementById("interaction-sound");
  const achievementSound = document.getElementById("achievement-sound");
  const notificationSound = document.getElementById("notification-sound");
  const downloadSound = document.getElementById("download-sound");

  // Loading Screen
  const loadingScreen = document.getElementById("loading-screen");
  setTimeout(() => {
    loadingScreen.classList.add("hidden");
  }, 1500);

  // Tutorial
  const tutorialModal = document.getElementById("tutorial-modal");
  const tutorialContent = document.getElementById("tutorial-content");
  const tutorialPrev = document.getElementById("tutorial-prev");
  const tutorialNext = document.getElementById("tutorial-next");
  const tutorialClose = document.getElementById("tutorial-close");
  const tutorialBtn = document.getElementById("tutorial-btn");

  const tutorialSteps = [
    "<p><strong>Step 1: Overview</strong><br>Welcome to the Financial Calculator! This tool helps you plan your finances with a sleek, gamer-inspired interface. Use the tabs to navigate between different calculators.</p>",
    '<p><strong>Step 2: Simple Interest</strong><br>Calculate interest earned on a principal amount with a fixed rate over time. Enter the principal, annual rate, and years, then click "Calculate".</p>',
    "<p><strong>Step 3: Compound Interest</strong><br>Explore how your investment grows with compounding. Input principal, rate, compounding frequency, and time to see your returns.</p>",
    "<p><strong>Step 4: Loan Payment</strong><br>Determine monthly payments for a loan. Provide the loan amount, monthly rate, and number of payments to get a breakdown.</p>",
    "<p><strong>Step 5: Mortgage Calculator</strong><br>Plan your home purchase by calculating monthly mortgage payments and checking affordability based on your income.</p>",
    "<p><strong>Step 6: Savings Goal</strong><br>Set a savings target and find out how much you need to save monthly to reach it within a specified time.</p>",
    "<p><strong>Step 7: Budget Planner</strong><br>Track your income and expenses, visualize spending with a pie chart, and see potential savings.</p>",
    "<p><strong>Step 8: Investment Comparison</strong><br>Compare multiple investment scenarios side-by-side by adding scenarios and entering different principals, rates, and times.</p>",
    "<p><strong>Step 9: Emergency Fund</strong><br>Calculate how much you need for an emergency fund based on your monthly expenses and desired coverage period.</p>",
    "<p><strong>Step 10: Sounds & Interactions</strong><br>Enjoy a gaming experience with sounds for button clicks (interaction), successful calculations (achievement), errors (notification), and more. Click any button to hear it!</p>",
  ];

  let currentStep = 0;

  const updateTutorial = () => {
    tutorialContent.innerHTML = tutorialSteps[currentStep];
    tutorialPrev.disabled = currentStep === 0;
    tutorialNext.disabled = currentStep === tutorialSteps.length - 1;
  };

  tutorialBtn.addEventListener("click", () => {
    interactionSound.play();
    currentStep = 0;
    updateTutorial();
    tutorialModal.classList.remove("hidden");
  });

  tutorialNext.addEventListener("click", () => {
    interactionSound.play();
    if (currentStep < tutorialSteps.length - 1) {
      currentStep++;
      updateTutorial();
    }
  });

  tutorialPrev.addEventListener("click", () => {
    interactionSound.play();
    if (currentStep > 0) {
      currentStep--;
      updateTutorial();
    }
  });

  tutorialClose.addEventListener("click", () => {
    interactionSound.play();
    tutorialModal.classList.add("hidden");
  });

  // Tab switching
  const tabs = document.querySelectorAll(".tab-btn");
  const panels = document.querySelectorAll(".tab-panel");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      interactionSound.play();
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

  const validateInputs = (inputs) => {
    for (let input of inputs) {
      if (isNaN(input) || input <= 0) {
        notificationSound.play();
        alert("Please enter valid positive numbers for all fields.");
        return false;
      }
    }
    return true;
  };

  // Simple Interest
  document
    .getElementById("simple-interest-form")
    .addEventListener("submit", (e) => {
      e.preventDefault();
      interactionSound.play();
      const principal = parseFloat(
        document.getElementById("si-principal").value
      );
      const rate = parseFloat(document.getElementById("si-rate").value) / 100;
      const time = parseFloat(document.getElementById("si-time").value);
      if (validateInputs([principal, rate, time])) {
        const interest = principal * rate * time;
        const total = principal + interest;
        document.getElementById("si-result").innerHTML = `
                <p>Interest Earned: ${formatCurrency(interest)}</p>
                <p>Total Amount: ${formatCurrency(total)}</p>
            `;
        achievementSound.play();
      }
    });

  // Compound Interest
  document
    .getElementById("compound-interest-form")
    .addEventListener("submit", (e) => {
      e.preventDefault();
      interactionSound.play();
      const principal = parseFloat(
        document.getElementById("ci-principal").value
      );
      const rate = parseFloat(document.getElementById("ci-rate").value) / 100;
      const compounds = parseFloat(
        document.getElementById("ci-compounds").value
      );
      const time = parseFloat(document.getElementById("ci-time").value);
      if (validateInputs([principal, rate, compounds, time])) {
        const total =
          principal * Math.pow(1 + rate / compounds, compounds * time);
        const interest = total - principal;
        document.getElementById("ci-result").innerHTML = `
                <p>Interest Earned: ${formatCurrency(interest)}</p>
                <p>Total Amount: ${formatCurrency(total)}</p>
            `;
        achievementSound.play();
      }
    });

  // Loan Payment
  document
    .getElementById("loan-payment-form")
    .addEventListener("submit", (e) => {
      e.preventDefault();
      interactionSound.play();
      const principal = parseFloat(
        document.getElementById("loan-principal").value
      );
      const rate = parseFloat(document.getElementById("loan-rate").value) / 100;
      const payments = parseFloat(
        document.getElementById("loan-payments").value
      );
      if (validateInputs([principal, rate, payments])) {
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
        achievementSound.play();
      }
    });

  // Mortgage Calculator
  document.getElementById("mortgage-form").addEventListener("submit", (e) => {
    e.preventDefault();
    interactionSound.play();
    const principal = parseFloat(
      document.getElementById("mortgage-principal").value
    );
    const annualRate =
      parseFloat(document.getElementById("mortgage-rate").value) / 100;
    const term = parseFloat(document.getElementById("mortgage-term").value);
    const income = parseFloat(document.getElementById("mortgage-income").value);
    const maxPercent =
      parseFloat(document.getElementById("mortgage-max-percent").value) / 100;
    if (validateInputs([principal, annualRate, term, income, maxPercent])) {
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
      achievementSound.play();
    }
  });

  // Savings Goal
  document
    .getElementById("savings-goal-form")
    .addEventListener("submit", (e) => {
      e.preventDefault();
      interactionSound.play();
      const goal = parseFloat(
        document.getElementById("savings-goal-amount").value
      );
      const current = parseFloat(
        document.getElementById("savings-current").value
      );
      const months = parseFloat(
        document.getElementById("savings-months").value
      );
      if (validateInputs([goal, current, months]) && goal >= current) {
        const monthlySavings = (goal - current) / months;
        document.getElementById("savings-result").innerHTML = `
                <p>Monthly Savings Needed: ${formatCurrency(monthlySavings)}</p>
            `;
        achievementSound.play();
      } else {
        notificationSound.play();
        alert("Savings goal must be greater than or equal to current savings.");
      }
    });

  // Budget Planner
  let budgetChart = null;
  document.getElementById("budget-form").addEventListener("submit", (e) => {
    e.preventDefault();
    interactionSound.play();
    const income = parseFloat(document.getElementById("budget-income").value);
    const food = parseFloat(document.getElementById("budget-food").value);
    const transport = parseFloat(
      document.getElementById("budget-transport").value
    );
    const utilities = parseFloat(
      document.getElementById("budget-utilities").value
    );
    const other = parseFloat(document.getElementById("budget-other").value);
    if (validateInputs([income, food, transport, utilities, other])) {
      const totalExpenses = food + transport + utilities + other;
      const savings = income - totalExpenses;
      if (savings < 0) {
        notificationSound.play();
        alert("Expenses exceed income. Adjust your budget.");
        return;
      }
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
      achievementSound.play();
    }
  });

  // Investment Comparison
  let scenarioCount = 1;
  document.getElementById("add-scenario").addEventListener("click", () => {
    interactionSound.play();
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
      interactionSound.play();
      const scenarios = document.querySelectorAll(
        "#investment-scenarios .scenario"
      );
      let valid = true;
      scenarios.forEach((scenario) => {
        const principal = parseFloat(
          scenario.querySelector('input[name="ic-principal"]').value
        );
        const rate = parseFloat(
          scenario.querySelector('input[name="ic-rate"]').value
        );
        const time = parseFloat(
          scenario.querySelector('input[name="ic-time"]').value
        );
        if (!validateInputs([principal, rate, time])) valid = false;
      });
      if (valid) {
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
        achievementSound.play();
      }
    });

  // Emergency Fund
  document
    .getElementById("emergency-fund-form")
    .addEventListener("submit", (e) => {
      e.preventDefault();
      interactionSound.play();
      const expenses = parseFloat(document.getElementById("ef-expenses").value);
      const months = parseFloat(document.getElementById("ef-months").value);
      if (validateInputs([expenses, months])) {
        const fundNeeded = expenses * months;
        document.getElementById("ef-result").innerHTML = `
                <p>Emergency Fund Needed: ${formatCurrency(fundNeeded)}</p>
                <p>(Based on ${months} months of ${formatCurrency(
          expenses
        )} monthly expenses)</p>
            `;
        achievementSound.play();
      }
    });

  // Download Button (Future Feature Placeholder)
  // Example: Add a download button to export results as CSV
  // document.getElementById('download-results').addEventListener('click', () => {
  //     downloadSound.play();
  //     // Implement CSV export logic here
  // });
});

document.addEventListener("DOMContentLoaded", () => {
  // Audio Elements
  const interactionSound = document.getElementById("interaction-sound");
  const achievementSound = document.getElementById("achievement-sound");
  const notificationSound = document.getElementById("notification-sound");
  const downloadSound = document.getElementById("download-sound");

  // Charts
  let siChart,
    ciChart,
    loanChart,
    mortgageChart,
    savingsChart,
    budgetChart,
    icChart,
    efChart;

  // History
  let history = JSON.parse(localStorage.getItem("calcHistory")) || [];

  // jsPDF
  const { jsPDF } = window.jspdf;

  // Loading Screen
  const loadingScreen = document.getElementById("loading-screen");
  setTimeout(() => {
    loadingScreen.classList.add("hidden");
  }, 2000);

  // Particles.js
  particlesJS("particles-js", {
    particles: {
      number: { value: 80, density: { enable: true, value_area: 800 } },
      color: { value: ["#00ff99", "#ffd700"] },
      shape: { type: "circle" },
      opacity: { value: 0.5, random: true },
      size: { value: 3, random: true },
      line_linked: {
        enable: true,
        distance: 150,
        color: "#00ff99",
        opacity: 0.4,
        width: 1,
      },
      move: {
        enable: true,
        speed: 6,
        direction: "none",
        random: false,
        straight: false,
        out_mode: "out",
        bounce: false,
      },
    },
    interactivity: {
      detect_on: "canvas",
      events: {
        onhover: { enable: true, mode: "repulse" },
        onclick: { enable: true, mode: "push" },
        resize: true,
      },
      modes: {
        repulse: { distance: 100, duration: 0.4 },
        push: { particles_nb: 4 },
      },
    },
    retina_detect: true,
  });

  // Tutorial
  const tutorialModal = document.getElementById("tutorial-modal");
  const tutorialContent = document.getElementById("tutorial-content");
  const tutorialPrev = document.getElementById("tutorial-prev");
  const tutorialNext = document.getElementById("tutorial-next");
  const tutorialClose = document.getElementById("tutorial-close");
  const tutorialBtn = document.getElementById("tutorial-btn");

  const tutorialSteps = [
    "<p><strong>Step 1: Overview</strong><br>Welcome to the Financial Calculator! Navigate using tabs, visualize results with bar charts, track calculations in the history modal, and export results as PDF or Excel.</p>",
    "<p><strong>Step 2: Simple Interest</strong><br>Calculate interest with principal, rate, and time. View results in a bar chart and download as PDF.</p>",
    "<p><strong>Step 3: Compound Interest</strong><br>See investment growth with compounding. The chart shows principal vs. total amount, with PDF export.</p>",
    "<p><strong>Step 4: Loan Payment</strong><br>Calculate monthly loan payments. The chart breaks down principal, interest, and total paid, with PDF export.</p>",
    "<p><strong>Step 5: Mortgage Calculator</strong><br>Plan your mortgage with affordability checks. The chart compares payment and max affordable payment, with PDF export.</p>",
    "<p><strong>Step 6: Savings Goal</strong><br>Determine monthly savings needed. The chart shows current savings vs. goal, with PDF export.</p>",
    "<p><strong>Step 7: Budget Planner</strong><br>Track expenses and savings with a pie chart for spending categories, with PDF export.</p>",
    "<p><strong>Step 8: Investment Comparison</strong><br>Compare investment scenarios. The chart displays total amounts for each scenario, with PDF export.</p>",
    "<p><strong>Step 9: Emergency Fund</strong><br>Calculate your emergency fund needs. The chart shows monthly expenses vs. fund needed, with PDF export.</p>",
    "<p><strong>Step 10: History & Export</strong><br>View past calculations in the history modal and export to Excel or PDF. Enjoy interactive sounds and animations!</p>",
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

  // History Modal
  const historyModal = document.getElementById("history-modal");
  const historyContent = document.getElementById("history-content");
  const historyClose = document.getElementById("history-close");
  const clearHistory = document.getElementById("clear-history");
  const exportExcel = document.getElementById("export-excel");
  const exportPDF = document.getElementById("export-pdf");
  const historyBtn = document.getElementById("history-btn");

  const updateHistoryDisplay = () => {
    if (history.length === 0) {
      historyContent.innerHTML = "<p>No calculations yet.</p>";
    } else {
      historyContent.innerHTML = history
        .map(
          (entry, index) => `
                <div class="mb-4">
                    <h3 class="font-semibold text-[#00ff99]">Calculation ${
                      index + 1
                    }: ${entry.type}</h3>
                    <p>${entry.details}</p>
                    <p class="text-sm text-gray-400">Timestamp: ${
                      entry.timestamp
                    }</p>
                </div>
            `
        )
        .join("");
    }
  };

  historyBtn.addEventListener("click", () => {
    interactionSound.play();
    updateHistoryDisplay();
    historyModal.classList.remove("hidden");
  });

  historyClose.addEventListener("click", () => {
    interactionSound.play();
    historyModal.classList.add("hidden");
  });

  clearHistory.addEventListener("click", () => {
    interactionSound.play();
    history = [];
    localStorage.setItem("calcHistory", JSON.stringify(history));
    updateHistoryDisplay();
    notificationSound.play();
    alert("History cleared.");
  });

  exportExcel.addEventListener("click", () => {
    interactionSound.play();
    if (history.length === 0) {
      notificationSound.play();
      alert("No history to export.");
      return;
    }
    const ws_data = [["Type", "Details", "Timestamp"]];
    history.forEach((entry) => {
      ws_data.push([entry.type, entry.details, entry.timestamp]);
    });
    const ws = XLSX.utils.aoa_to_sheet(ws_data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "History");
    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([wbout], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "financial_calculator_history.xlsx";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    downloadSound.play();
  });

  exportPDF.addEventListener("click", () => {
    interactionSound.play();
    if (history.length === 0) {
      notificationSound.play();
      alert("No history to export.");
      return;
    }
    const doc = new jsPDF();
    doc.setFont("helvetica");
    doc.setFontSize(12);
    doc.text("Financial Calculator History", 20, 20);
    let y = 30;
    history.forEach((entry, index) => {
      doc.text(`Calculation ${index + 1}: ${entry.type}`, 20, y);
      doc.text(`Details: ${entry.details}`, 20, y + 10);
      doc.text(`Timestamp: ${entry.timestamp}`, 20, y + 20);
      y += 40;
      if (y > 260) {
        doc.addPage();
        y = 20;
      }
    });
    doc.save("financial_calculator_history.pdf");
    downloadSound.play();
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

  const saveToHistory = (type, details) => {
    const timestamp = new Date().toLocaleString();
    history.push({ type, details, timestamp });
    localStorage.setItem("calcHistory", JSON.stringify(history));
  };

  const createBarChart = (canvasId, labels, data, chartRef) => {
    if (chartRef) chartRef.destroy();
    const ctx = document.getElementById(canvasId).getContext("2d");
    return new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            data,
            backgroundColor: ["#00ff99", "#ffd700", "#ff4d4d", "#4d79ff"],
            borderColor: "#1a1a1a",
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          title: {
            display: true,
            text: "Calculation Breakdown",
            color: "#e0e0e0",
          },
        },
        scales: {
          y: { beginAtZero: true, ticks: { color: "#e0e0e0" } },
          x: { ticks: { color: "#e0e0e0" } },
        },
      },
    });
  };

  const downloadResultPDF = (type, details) => {
    const doc = new jsPDF();
    doc.setFont("helvetica");
    doc.setFontSize(12);
    doc.text(`Financial Calculator - ${type}`, 20, 20);
    doc.text("Results:", 20, 30);
    const lines = doc.splitTextToSize(details, 160);
    doc.text(lines, 20, 40);
    doc.text(
      `Timestamp: ${new Date().toLocaleString()}`,
      20,
      lines.length * 10 + 50
    );
    doc.save(`${type.replace(/\s+/g, "_").toLowerCase()}_result.pdf`);
    downloadSound.play();
  };

  // Simple Interest
  let siResult = "";
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
        siResult = `
                Interest Earned: ${formatCurrency(interest)}
                Total Amount: ${formatCurrency(total)}
            `;
        document.getElementById("si-result").innerHTML = siResult;
        siChart = createBarChart(
          "si-chart",
          ["Principal", "Interest"],
          [principal, interest],
          siChart
        );
        saveToHistory(
          "Simple Interest",
          `Principal: ${formatCurrency(principal)}, Rate: ${(
            rate * 100
          ).toFixed(2)}%, Time: ${time} years, Interest: ${formatCurrency(
            interest
          )}, Total: ${formatCurrency(total)}`
        );
        achievementSound.play();
      }
    });

  document.getElementById("si-pdf").addEventListener("click", () => {
    interactionSound.play();
    if (!siResult) {
      notificationSound.play();
      alert("Please perform a calculation first.");
      return;
    }
    downloadResultPDF("Simple Interest", siResult);
  });

  // Compound Interest
  let ciResult = "";
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
        ciResult = `
                Interest Earned: ${formatCurrency(interest)}
                Total Amount: ${formatCurrency(total)}
            `;
        document.getElementById("ci-result").innerHTML = ciResult;
        ciChart = createBarChart(
          "ci-chart",
          ["Principal", "Interest"],
          [principal, interest],
          ciChart
        );
        saveToHistory(
          "Compound Interest",
          `Principal: ${formatCurrency(principal)}, Rate: ${(
            rate * 100
          ).toFixed(
            2
          )}%, Compounds: ${compounds}, Time: ${time} years, Interest: ${formatCurrency(
            interest
          )}, Total: ${formatCurrency(total)}`
        );
        achievementSound.play();
      }
    });

  document.getElementById("ci-pdf").addEventListener("click", () => {
    interactionSound.play();
    if (!ciResult) {
      notificationSound.play();
      alert("Please perform a calculation first.");
      return;
    }
    downloadResultPDF("Compound Interest", ciResult);
  });

  // Loan Payment
  let loanResult = "";
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
        loanResult = `
                Monthly Payment: ${formatCurrency(monthlyPayment)}
                Total Paid: ${formatCurrency(totalPaid)}
                Total Interest: ${formatCurrency(totalInterest)}
            `;
        document.getElementById("loan-result").innerHTML = loanResult;
        loanChart = createBarChart(
          "loan-chart",
          ["Principal", "Interest", "Total Paid"],
          [principal, totalInterest, totalPaid],
          loanChart
        );
        saveToHistory(
          "Loan Payment",
          `Principal: ${formatCurrency(principal)}, Rate: ${(
            rate * 100
          ).toFixed(2)}%, Payments: ${payments}, Monthly: ${formatCurrency(
            monthlyPayment
          )}, Total Interest: ${formatCurrency(
            totalInterest
          )}, Total Paid: ${formatCurrency(totalPaid)}`
        );
        achievementSound.play();
      }
    });

  document.getElementById("loan-pdf").addEventListener("click", () => {
    interactionSound.play();
    if (!loanResult) {
      notificationSound.play();
      alert("Please perform a calculation first.");
      return;
    }
    downloadResultPDF("Loan Payment", loanResult);
  });

  // Mortgage Calculator
  let mortgageResult = "";
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
      mortgageResult = `
                Monthly Payment: ${formatCurrency(monthlyPayment)}
                Total Paid: ${formatCurrency(totalPaid)}
                Total Interest: ${formatCurrency(totalInterest)}
                Within ${maxPercent * 100}% of Income: ${affordable}
            `;
      document.getElementById("mortgage-result").innerHTML = mortgageResult;
      mortgageChart = createBarChart(
        "mortgage-chart",
        ["Monthly Payment", "Max Affordable"],
        [monthlyPayment, maxPayment],
        mortgageChart
      );
      saveToHistory(
        "Mortgage",
        `Principal: ${formatCurrency(principal)}, Rate: ${(
          annualRate * 100
        ).toFixed(2)}%, Term: ${term} years, Income: ${formatCurrency(
          income
        )}, Max %: ${maxPercent * 100}%, Monthly: ${formatCurrency(
          monthlyPayment
        )}, Affordable: ${affordable}`
      );
      achievementSound.play();
    }
  });

  document.getElementById("mortgage-pdf").addEventListener("click", () => {
    interactionSound.play();
    if (!mortgageResult) {
      notificationSound.play();
      alert("Please perform a calculation first.");
      return;
    }
    downloadResultPDF("Mortgage", mortgageResult);
  });

  // Savings Goal
  let savingsResult = "";
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
        savingsResult = `
                Monthly Savings Needed: ${formatCurrency(monthlySavings)}
            `;
        document.getElementById("savings-result").innerHTML = savingsResult;
        savingsChart = createBarChart(
          "savings-chart",
          ["Current", "Goal", "Monthly Needed"],
          [current, goal, monthlySavings],
          savingsChart
        );
        saveToHistory(
          "Savings Goal",
          `Goal: ${formatCurrency(goal)}, Current: ${formatCurrency(
            current
          )}, Months: ${months}, Monthly: ${formatCurrency(monthlySavings)}`
        );
        achievementSound.play();
      } else {
        notificationSound.play();
        alert("Savings goal must be greater than or equal to current savings.");
      }
    });

  document.getElementById("savings-pdf").addEventListener("click", () => {
    interactionSound.play();
    if (!savingsResult) {
      notificationSound.play();
      alert("Please perform a calculation first.");
      return;
    }
    downloadResultPDF("Savings Goal", savingsResult);
  });

  // Budget Planner
  let budgetResult = "";
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
      budgetResult = `
                Total Expenses: ${formatCurrency(totalExpenses)}
                Food: ${percentages.Food}%
                Transport: ${percentages.Transport}%
                Utilities: ${percentages.Utilities}%
                Other: ${percentages.Other}%
                Possible Savings: ${formatCurrency(savings)}
            `;
      document.getElementById("budget-result").innerHTML = budgetResult;
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
      saveToHistory(
        "Budget",
        `Income: ${formatCurrency(income)}, Expenses: ${formatCurrency(
          totalExpenses
        )}, Savings: ${formatCurrency(savings)}, Food: ${
          percentages.Food
        }%, Transport: ${percentages.Transport}%, Utilities: ${
          percentages.Utilities
        }%, Other: ${percentages.Other}%`
      );
      achievementSound.play();
    }
  });

  document.getElementById("budget-pdf").addEventListener("click", () => {
    interactionSound.play();
    if (!budgetResult) {
      notificationSound.play();
      alert("Please perform a calculation first.");
      return;
    }
    downloadResultPDF("Budget Planner", budgetResult);
  });

  // Investment Comparison
  let icResult = "";
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
      const results = [];
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
        else
          results.push({
            principal,
            rate,
            time,
            total: principal * Math.pow(1 + rate / 100, time),
          });
      });
      if (valid) {
        icResult = results
          .map(
            (res, index) => `
                Scenario ${index + 1}:
                Principal: ${formatCurrency(res.principal)}
                Interest Rate: ${res.rate.toFixed(2)}%
                Time: ${res.time} years
                Total Amount: ${formatCurrency(res.total)}
            `
          )
          .join("\n");
        let html = "";
        results.forEach((res, index) => {
          html += `
                    <div class="scenario-result">
                        <h3 class="font-semibold">Scenario ${index + 1}</h3>
                        <p>Principal: ${formatCurrency(res.principal)}</p>
                        <p>Interest Rate: ${res.rate.toFixed(2)}%</p>
                        <p>Time: ${res.time} years</p>
                        <p>Total Amount: ${formatCurrency(res.total)}</p>
                    </div>
                `;
        });
        document.getElementById("ic-result").innerHTML = html;
        icChart = createBarChart(
          "ic-chart",
          results.map((_, i) => `Scenario ${i + 1}`),
          results.map((r) => r.total),
          icChart
        );
        saveToHistory(
          "Investment Comparison",
          results
            .map(
              (r, i) =>
                `Scenario ${i + 1}: Principal: ${formatCurrency(
                  r.principal
                )}, Rate: ${r.rate.toFixed(2)}%, Time: ${
                  r.time
                } years, Total: ${formatCurrency(r.total)}`
            )
            .join("; ")
        );
        achievementSound.play();
      }
    });

  document.getElementById("ic-pdf").addEventListener("click", () => {
    interactionSound.play();
    if (!icResult) {
      notificationSound.play();
      alert("Please perform a calculation first.");
      return;
    }
    downloadResultPDF("Investment Comparison", icResult);
  });

  // Emergency Fund
  let efResult = "";
  document
    .getElementById("emergency-fund-form")
    .addEventListener("submit", (e) => {
      e.preventDefault();
      interactionSound.play();
      const expenses = parseFloat(document.getElementById("ef-expenses").value);
      const months = parseFloat(document.getElementById("ef-months").value);
      if (validateInputs([expenses, months])) {
        const fundNeeded = expenses * months;
        efResult = `
                Emergency Fund Needed: ${formatCurrency(fundNeeded)}
                (Based on ${months} months of ${formatCurrency(
          expenses
        )} monthly expenses)
            `;
        document.getElementById("ef-result").innerHTML = efResult;
        efChart = createBarChart(
          "ef-chart",
          ["Monthly Expenses", "Fund Needed"],
          [expenses, fundNeeded],
          efChart
        );
        saveToHistory(
          "Emergency Fund",
          `Expenses: ${formatCurrency(
            expenses
          )}, Months: ${months}, Fund Needed: ${formatCurrency(fundNeeded)}`
        );
        achievementSound.play();
      }
    });

  document.getElementById("ef-pdf").addEventListener("click", () => {
    interactionSound.play();
    if (!efResult) {
      notificationSound.play();
      alert("Please perform a calculation first.");
      return;
    }
    downloadResultPDF("Emergency Fund", efResult);
  });
});

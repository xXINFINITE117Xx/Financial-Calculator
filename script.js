function playSound(type) {
  const sounds = {
    notification: document.getElementById("notificationSound"),
    interaction: document.getElementById("interactionSound"),
    achievement: document.getElementById("achievementSound"),
    query: document.getElementById("querySound"),
  };
  if (sounds[type]) {
    sounds[type]
      .play()
      .catch((error) => console.log("Error al reproducir audio:", error));
  }
}

function showSection(sectionId) {
  playSound("interaction");
  document
    .querySelectorAll(".section")
    .forEach((section) => section.classList.add("hidden"));
  document.getElementById(sectionId).classList.remove("hidden");
}

function calculateBasic() {
  playSound("interaction");
  const capital = parseFloat(document.getElementById("basicCapital").value);
  const rate = parseFloat(document.getElementById("basicRate").value) / 100;
  const time = parseFloat(document.getElementById("basicTime").value);

  if (isNaN(capital) || isNaN(rate) || isNaN(time)) {
    playSound("notification");
    document.getElementById("basicResult").innerHTML =
      "Por favor, ingrese valores válidos.";
    return;
  }

  const simpleInterest = capital * rate * time;
  const compoundInterest = capital * (Math.pow(1 + rate, time) - 1);
  const effectiveRate = Math.pow(1 + rate / 12, 12) - 1;
  const nominalRate = rate * 12;

  document.getElementById("basicResult").innerHTML = `
        Interés Simple: $${simpleInterest.toFixed(2)}<br>
        Interés Compuesto: $${compoundInterest.toFixed(2)}<br>
        Tasa Efectiva Anual: ${(effectiveRate * 100).toFixed(2)}%<br>
        Tasa Nominal Mensual: ${((nominalRate * 100) / 12).toFixed(2)}%
    `;
  playSound("query");
  playSound("achievement");
}

function calculateLoan() {
  playSound("interaction");
  const amount = parseFloat(document.getElementById("loanAmount").value);
  const rate = parseFloat(document.getElementById("loanRate").value) / 100 / 12;
  const term = parseInt(document.getElementById("loanTerm").value);

  if (isNaN(amount) || isNaN(rate) || isNaN(term)) {
    playSound("notification");
    document.getElementById("loanResult").innerHTML =
      "Por favor, ingrese valores válidos.";
    return;
  }

  const payment =
    (amount * (rate * Math.pow(1 + rate, term))) /
    (Math.pow(1 + rate, term) - 1);
  let balance = amount;
  let tableBody = "";

  for (let i = 1; i <= term; i++) {
    const interest = balance * rate;
    const principal = payment - interest;
    balance -= principal;
    tableBody += `
            <tr>
                <td>${i}</td>
                <td>$${payment.toFixed(2)}</td>
                <td>$${interest.toFixed(2)}</td>
                <td>$${principal.toFixed(2)}</td>
                <td>$${balance.toFixed(2)}</td>
            </tr>
        `;
  }

  document.getElementById(
    "loanResult"
  ).innerHTML = `Cuota Mensual: $${payment.toFixed(2)}`;
  document.getElementById("amortizationBody").innerHTML = tableBody;
  playSound("query");
  playSound("achievement");
}

function exportAmortization(format) {
  playSound("interaction");
  const table = document.getElementById("amortizationTable");
  const rows = table.querySelectorAll("tr");
  const data = [];

  rows.forEach((row) => {
    const cols = row.querySelectorAll("td, th");
    const rowData = [];
    cols.forEach((col) => rowData.push(col.innerText));
    data.push(rowData);
  });

  if (format === "pdf") {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.text("Tabla de Amortización", 10, 10);
    doc.autoTable({
      head: [data[0]],
      body: data.slice(1),
    });
    doc.save("amortization.pdf");
  } else if (format === "excel") {
    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Amortization");
    XLSX.writeFile(wb, "amortization.xlsx");
  }
  playSound("achievement");
}

function calculateInvestments() {
  playSound("interaction");
  const initial = parseFloat(document.getElementById("invInitial").value);
  const cashFlows = document
    .getElementById("invCashFlows")
    .value.split(",")
    .map(Number);
  const rate = parseFloat(document.getElementById("invRate").value) / 100;

  if (isNaN(initial) || cashFlows.some(isNaN) || isNaN(rate)) {
    playSound("notification");
    document.getElementById("invResult").innerHTML =
      "Por favor, ingrese valores válidos.";
    return;
  }

  let npv = -initial;
  cashFlows.forEach((cf, i) => {
    npv += cf / Math.pow(1 + rate, i + 1);
  });

  let irr = 0.1;
  for (let i = 0; i < 100; i++) {
    let npvTest = -initial;
    cashFlows.forEach((cf, j) => {
      npvTest += cf / Math.pow(1 + irr, j + 1);
    });
    if (Math.abs(npvTest) < 0.01) break;
    irr += npvTest > 0 ? 0.001 : -0.001;
  }

  const totalReturn = cashFlows.reduce((sum, cf) => sum + cf, 0);
  const roi = ((totalReturn - initial) / initial) * 100;

  document.getElementById("invResult").innerHTML = `
        VAN: $${npv.toFixed(2)}<br>
        TIR: ${(irr * 100).toFixed(2)}%<br>
        ROI: ${roi.toFixed(2)}%
    `;
  playSound("query");
  playSound("achievement");
}

function calculateBudget() {
  playSound("interaction");
  const income = parseFloat(document.getElementById("budgetIncome").value);
  const expenses = parseFloat(document.getElementById("budgetExpenses").value);

  if (isNaN(income) || isNaN(expenses)) {
    playSound("notification");
    document.getElementById("budgetResult").innerHTML =
      "Por favor, ingrese valores válidos.";
    return;
  }

  const balance = income - expenses;
  document.getElementById(
    "budgetResult"
  ).innerHTML = `Balance: $${balance.toFixed(2)}`;
  const alert = document.getElementById("budgetAlert");
  if (expenses > income) {
    alert.classList.remove("hidden");
    alert.innerText = "¡Alerta! Tus gastos superan tus ingresos.";
    playSound("notification");
  } else {
    alert.classList.add("hidden");
  }
  playSound("query");
  playSound("achievement");
}

function calculateMortgage() {
  playSound("interaction");
  const amount = parseFloat(document.getElementById("mortgageAmount").value);
  const rate =
    parseFloat(document.getElementById("mortgageRate").value) / 100 / 12;
  const term = parseInt(document.getElementById("mortgageTerm").value) * 12;
  const costs = parseFloat(document.getElementById("mortgageCosts").value);

  if (isNaN(amount) || isNaN(rate) || isNaN(term) || isNaN(costs)) {
    playSound("notification");
    document.getElementById("mortgageResult").innerHTML =
      "Por favor, ingrese valores válidos.";
    return;
  }

  const payment =
    (amount * (rate * Math.pow(1 + rate, term))) /
    (Math.pow(1 + rate, term) - 1);
  const totalCost = payment * term + costs;

  document.getElementById("mortgageResult").innerHTML = `
        Cuota Mensual: $${payment.toFixed(2)}<br>
        Costo Total: $${totalCost.toFixed(2)}
    `;
  playSound("query");
  playSound("achievement");
}

// Mostrar la sección inicial
showSection("basic");

/* Initialize particles.js for background */
particlesJS.load("particles-js", "particles-config.json", function () {
  console.log("Background Particles.js loaded");
});

/* Button particles configuration (optimized) */
const buttonParticlesConfig = {
  particles: {
    number: { value: 15, density: { enable: true, value_area: 100 } },
    color: { value: ["#ff00ff", "#00ffcc"] },
    shape: { type: "circle" },
    opacity: {
      value: 0.8,
      random: true,
      anim: { enable: true, speed: 2, opacity_min: 0.1 },
    },
    size: { value: 4, random: true },
    line_linked: { enable: false },
    move: {
      enable: true,
      speed: 4,
      direction: "none",
      random: true,
      out_mode: "out",
    },
  },
  interactivity: { events: { onclick: { enable: false } } },
};

/* Global variables */
let myChart = null;
let chartData = null;
let history = JSON.parse(localStorage.getItem("calcHistory")) || [];
let tutorialStep = 0;
let exchangeRates = { USD: 1, EUR: 1, MXN: 1 }; // Default rates

/* Fetch exchange rates */
async function fetchExchangeRates() {
  try {
    const response = await fetch(
      "https://api.exchangerate-api.com/v4/latest/USD"
    );
    const data = await response.json();
    exchangeRates = data.rates;
  } catch (error) {
    console.error("Error fetching exchange rates:", error);
  }
}

/* Convert amount to selected currency */
function convertToCurrency(amount, currency) {
  const rate = exchangeRates[currency] || 1;
  return (amount * rate).toFixed(2);
}

/* Format amount with currency symbol */
function formatCurrency(amount, currency) {
  const symbols = { USD: "$", EUR: "€", MXN: "$" };
  return `${symbols[currency] || "$"}${amount}`;
}

/* Validate cash flows */
function validateCashFlows(cashFlows) {
  return (
    cashFlows &&
    cashFlows.length > 0 &&
    cashFlows.every((flow) => !isNaN(parseFloat(flow)) && flow !== "")
  );
}

/* Calculate NPV */
function calculateNPV(rate, cashFlows) {
  return cashFlows.reduce((npv, cashFlow, i) => {
    const discounted = parseFloat(cashFlow) / Math.pow(1 + rate, i + 1);
    return npv + (isNaN(discounted) ? 0 : discounted);
  }, 0);
}

/* Calculate IRR (bisection method) */
function calculateIRR(cashFlows) {
  const precision = 0.0001;
  let low = -0.99,
    high = 1.99;
  let attempts = 100;

  const hasNegative = cashFlows.some((flow) => parseFloat(flow) < 0);
  const hasPositive = cashFlows.some((flow) => parseFloat(flow) > 0);
  if (!hasNegative || !hasPositive) return null;

  while (attempts--) {
    const irr = (low + high) / 2;
    const npv = calculateNPV(irr, cashFlows);
    if (Math.abs(npv) < precision) return irr * 100;
    if (npv > 0) low = irr;
    else high = irr;
    if (high - low < precision) break;
  }
  return null;
}

/* Generate amortization table */
function generateAmortizationTable(
  amount,
  monthlyRate,
  months,
  monthlyPayment,
  currency
) {
  let balance = amount;
  let table =
    "<table><tr><th>Período</th><th>Cuota</th><th>Interés</th><th>Capital</th><th>Saldo</th></tr>";

  for (let i = 1; i <= months; i++) {
    const interest = balance * monthlyRate;
    const principal = monthlyPayment - interest;
    balance -= principal;
    table += `<tr>
            <td>${i}</td>
            <td>${formatCurrency(
              convertToCurrency(monthlyPayment, currency),
              currency
            )}</td>
            <td>${formatCurrency(
              convertToCurrency(interest, currency),
              currency
            )}</td>
            <td>${formatCurrency(
              convertToCurrency(principal, currency),
              currency
            )}</td>
            <td>${formatCurrency(
              convertToCurrency(Math.max(0, balance), currency),
              currency
            )}</td>
        </tr>`;
  }

  table += "</table>";
  return table;
}

/* Perform sensitivity analysis */
function performSensitivityAnalysis(cashFlows, rateMin, rateMax) {
  const steps = 10;
  const stepSize = (rateMax - rateMin) / steps;
  const rates = [];
  const npvs = [];

  for (let i = 0; i <= steps; i++) {
    const rate = rateMin + i * stepSize;
    rates.push(rate.toFixed(2));
    npvs.push(calculateNPV(rate / 100, cashFlows).toFixed(2));
  }

  return { rates, npvs };
}

/* Update history list */
function updateHistoryList() {
  const historyList = document.getElementById("historyList");
  if (!historyList) {
    console.error("historyList not found!");
    return;
  }
  historyList.innerHTML = "";
  history.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    historyList.appendChild(li);
  });
}

/* Download history as CSV */
function downloadHistoryAsCSV() {
  if (history.length === 0) {
    alert("No hay cálculos en el historial.");
    return;
  }
  const csvContent =
    "data:text/csv;charset=utf-8,Cálculo\n" +
    history.map((item) => `"${item.replace(/"/g, '""')}"`).join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "historial_calculos.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/* Export to PDF */
function exportToPDF(resultText, amortizationTable, chartData, currency) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const margin = 10;
  let y = margin;

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(16);
  doc.text("Calculadora Financiera Gamer - Reporte", margin, y);
  y += 10;

  doc.setFont("Helvetica", "normal");
  doc.setFontSize(12);
  const resultLines = doc.splitTextToSize(
    resultText.replace(/<br\s*\/?>/g, "\n").replace(/<[^>]+>/g, ""),
    190
  );
  doc.text(resultLines, margin, y);
  y += resultLines.length * 10;

  if (amortizationTable) {
    y += 10;
    doc.setFontSize(14);
    doc.text("Tabla de Amortización", margin, y);
    y += 10;

    const table = document.querySelector("#amortizationTable table");
    if (table) {
      const rows = Array.from(table.rows).map((row) =>
        Array.from(row.cells).map((cell) => cell.textContent)
      );
      doc.autoTable({
        startY: y,
        head: [rows[0]],
        body: rows.slice(1),
        theme: "grid",
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [0, 204, 255] },
        margin: { left: margin },
      });
      y = doc.lastAutoTable.finalY + 10;
    }
  }

  if (chartData && myChart) {
    doc.setFontSize(14);
    doc.text("Gráfico", margin, y);
    y += 10;
    const imgData = myChart.toBase64Image();
    doc.addImage(imgData, "PNG", margin, y, 190, 100);
  }

  doc.save("reporte_financiero.pdf");
}

/* Tutorial steps */
const tutorialSteps = [
  {
    text: "¡Bienvenido a la Calculadora Financiera Gamer! Cambia el tema aquí.",
    highlight: "#theme",
  },
  {
    text: "Selecciona la moneda para los cálculos.",
    highlight: "#currency",
  },
  {
    text: "Ingresa el monto principal, tasa de interés y tiempo.",
    highlight: "#amount, #rate, #time",
  },
  {
    text: "Para VAN o TIR, ingresa flujos de caja separados por comas.",
    highlight: "#cashFlows",
  },
  {
    text: "Para sensibilidad, ingresa un rango de tasas (ej: 2,8).",
    highlight: "#rateRange",
  },
  {
    text: "Selecciona el tipo de cálculo.",
    highlight: "#calcType",
  },
  {
    text: 'Haz clic en "Calcular" para ver los resultados.',
    highlight: ".btn-calculate",
  },
  {
    text: "El gráfico se muestra aquí. Descarga con PNG o exporta a PDF.",
    highlight: "#chartCanvas, #downloadChartBtn, #exportPdfBtn",
  },
  {
    text: "Revisa el historial de cálculos aquí.",
    highlight: ".history",
  },
];

function showTutorialStep(step) {
  const modal = document.getElementById("tutorialModal");
  const text = document.getElementById("tutorialText");
  const prevBtn = document.getElementById("prevStep");
  const nextBtn = document.getElementById("nextStep");

  if (!modal || !text || !prevBtn || !nextBtn) return;

  text.innerHTML = tutorialSteps[step].text;
  prevBtn.disabled = step === 0;
  nextBtn.disabled = step === tutorialSteps.length - 1;

  // Remove previous highlights
  document
    .querySelectorAll(".highlight")
    .forEach((el) => el.classList.remove("highlight"));

  // Add highlight to current elements
  if (tutorialSteps[step].highlight) {
    document.querySelectorAll(tutorialSteps[step].highlight).forEach((el) => {
      if (el) el.classList.add("highlight");
    });
  }

  modal.classList.add("show");
}

/* Initialize history and exchange rates */
updateHistoryList();
fetchExchangeRates();

/* Clear history */
const clearHistoryBtn = document.getElementById("clearHistory");
if (clearHistoryBtn) {
  clearHistoryBtn.addEventListener("click", () => {
    history = [];
    localStorage.setItem("calcHistory", JSON.stringify(history));
    updateHistoryList();
  });
} else {
  console.error("clearHistory button not found");
}

/* Download history */
const downloadHistoryBtn = document.getElementById("downloadHistory");
if (downloadHistoryBtn) {
  downloadHistoryBtn.addEventListener("click", downloadHistoryAsCSV);
} else {
  console.error("downloadHistory button not found");
}

/* Change theme */
const themeSelect = document.getElementById("theme");
if (themeSelect) {
  themeSelect.addEventListener("change", function (e) {
    document.body.setAttribute("data-theme", e.target.value);
    particlesJS.load("particles-js", "particles-config.json");
    const themeSound = document.getElementById("themeSound");
    if (themeSound && themeSound.readyState >= 2) {
      themeSound
        .play()
        .catch((error) => console.error("Error playing theme sound:", error));
    }
  });
} else {
  console.error("theme select not found");
}

/* Download chart as image */
const downloadChartBtn = document.getElementById("downloadChartBtn");
if (downloadChartBtn) {
  downloadChartBtn.addEventListener("click", function () {
    if (myChart) {
      const buttonParticles = document.getElementById("button-particles");
      const clickSound = document.getElementById("clickSound");
      if (clickSound && clickSound.readyState >= 2) {
        clickSound
          .play()
          .catch((error) => console.error("Error playing sound:", error));
      }
      if (buttonParticles) {
        try {
          buttonParticles.classList.add("active");
          particlesJS("button-particles", buttonParticlesConfig);
          setTimeout(() => {
            buttonParticles.classList.remove("active");
            if (window.pJSDom && Array.isArray(window.pJSDom)) {
              const buttonInstance = window.pJSDom.find(
                (p) => p.pJS.canvas.el.id === "button-particles"
              );
              if (buttonInstance) {
                buttonInstance.pJS.fn.vendors.destroypJS();
                window.pJSDom = window.pJSDom.filter(
                  (p) => p.pJS.canvas.el.id !== "button-particles"
                );
              }
            }
          }, 800);
        } catch (error) {
          console.error("Error initializing button particles:", error);
        }
      }
      const link = document.createElement("a");
      link.href = myChart.toBase64Image();
      link.download = "grafico_financiero.png";
      link.click();
    }
  });
} else {
  console.error("downloadChartBtn not found");
}

/* Export to PDF */
const exportPdfBtn = document.getElementById("exportPdfBtn");
if (exportPdfBtn) {
  exportPdfBtn.addEventListener("click", function () {
    const resultText = document.getElementById("result").innerHTML;
    const amortizationTable =
      document.getElementById("amortizationTable").innerHTML;
    const currency = document.getElementById("currency").value;
    if (resultText) {
      const clickSound = document.getElementById("clickSound");
      if (clickSound && clickSound.readyState >= 2) {
        clickSound
          .play()
          .catch((error) => console.error("Error playing sound:", error));
      }
      exportToPDF(resultText, amortizationTable, chartData, currency);
    }
  });
} else {
  console.error("exportPdfBtn not found");
}

/* Tutorial controls */
const tutorialModal = document.getElementById("tutorialModal");
const prevStepBtn = document.getElementById("prevStep");
const nextStepBtn = document.getElementById("nextStep");
const closeTutorialBtn = document.getElementById("closeTutorial");

if (tutorialModal && prevStepBtn && nextStepBtn && closeTutorialBtn) {
  prevStepBtn.addEventListener("click", () => {
    if (tutorialStep > 0) {
      tutorialStep--;
      showTutorialStep(tutorialStep);
    }
  });

  nextStepBtn.addEventListener("click", () => {
    if (tutorialStep < tutorialSteps.length - 1) {
      tutorialStep++;
      showTutorialStep(tutorialStep);
    }
  });

  closeTutorialBtn.addEventListener("click", () => {
    tutorialModal.classList.remove("show");
    document
      .querySelectorAll(".highlight")
      .forEach((el) => el.classList.remove("highlight"));
    localStorage.setItem("tutorialCompleted", "true");
  });

  // Show tutorial on first load if not completed
  if (!localStorage.getItem("tutorialCompleted")) {
    showTutorialStep(0);
  }
}

/* Handle form submission */
const calcForm = document.getElementById("calcForm");
if (calcForm) {
  calcForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const amountInput = document.getElementById("amount");
    const rateInput = document.getElementById("rate");
    const timeInput = document.getElementById("time");
    const cashFlowsInput = document.getElementById("cashFlows");
    const rateRangeInput = document.getElementById("rateRange");
    const calcTypeSelect = document.getElementById("calcType");
    const currencySelect = document.getElementById("currency");
    const resultDiv = document.getElementById("result");
    const amortizationTableDiv = document.getElementById("amortizationTable");

    if (
      !amountInput ||
      !rateInput ||
      !timeInput ||
      !cashFlowsInput ||
      !rateRangeInput ||
      !calcTypeSelect ||
      !currencySelect ||
      !resultDiv ||
      !amortizationTableDiv
    ) {
      console.error("Form elements not found");
      resultDiv.innerHTML = "Error: Form elements not found.";
      return;
    }

    const currency = currencySelect.value;
    const amount = parseFloat(amountInput.value);
    const rate = parseFloat(rateInput.value) / 100;
    const time = parseFloat(timeInput.value);
    const cashFlows = cashFlowsInput.value
      ? cashFlowsInput.value
          .split(",")
          .map((val) => parseFloat(val.trim()))
          .filter((val) => !isNaN(val))
      : [];
    const rateRange = rateRangeInput.value
      ? rateRangeInput.value
          .split(",")
          .map((val) => parseFloat(val.trim()))
          .filter((val) => !isNaN(val))
      : [];
    const calcType = calcTypeSelect.value;

    let resultText = "";
    chartData = null; // Reset chartData

    /* Play calculate sound */
    const calculateSound = document.getElementById("calculateSound");
    if (calculateSound && calculateSound.readyState >= 2) {
      calculateSound
        .play()
        .catch((error) =>
          console.error("Error playing calculate sound:", error)
        );
    }

    /* Clear amortization table */
    amortizationTableDiv.innerHTML = "";

    /* Validate inputs */
    if (
      isNaN(amount) ||
      isNaN(rate) ||
      isNaN(time) ||
      amount <= 0 ||
      rate < 0 ||
      time <= 0
    ) {
      resultText =
        "Por favor, ingrese valores válidos para monto, tasa y tiempo.";
      resultDiv.innerHTML = resultText;
    } else if (
      (calcType === "npv" ||
        calcType === "irr" ||
        calcType === "sensitivity") &&
      !validateCashFlows(cashFlows)
    ) {
      resultText =
        "Por favor, ingrese flujos de caja válidos (números separados por comas).";
      resultDiv.innerHTML = resultText;
    } else if (
      calcType === "sensitivity" &&
      (rateRange.length !== 2 || rateRange[0] >= rateRange[1])
    ) {
      resultText = "Por favor, ingrese un rango de tasas válido (ej: 2,8).";
      resultDiv.innerHTML = resultText;
    } else {
      /* Activate button particles */
      const buttonParticlesDiv = document.getElementById("button-particles");
      if (buttonParticlesDiv) {
        try {
          buttonParticlesDiv.classList.add("active");
          particlesJS("button-particles", buttonParticlesConfig);
          setTimeout(() => {
            buttonParticlesDiv.classList.remove("active");
            if (window.pJSDom && Array.isArray(window.pJSDom)) {
              const buttonInstance = window.pJSDom.find(
                (p) => p.pJS.canvas.el.id === "button-particles"
              );
              if (buttonInstance) {
                buttonInstance.pJS.fn.vendors.destroypJS();
                window.pJSDom = window.pJSDom.filter(
                  (p) => p.pJS.canvas.el.id !== "button-particles"
                );
              }
            }
          }, 800);
        } catch (error) {
          console.error("Error initializing button particles:", error);
        }
      }

      if (calcType === "simple") {
        /* Simple Interest */
        const interest = amount * rate * time;
        const total = amount + interest;
        resultText = `Interés Simple:<br>Interés: ${formatCurrency(
          convertToCurrency(interest, currency),
          currency
        )}<br>Total: ${formatCurrency(
          convertToCurrency(total, currency),
          currency
        )}`;
        chartData = {
          labels: ["Monto Principal", "Interés"],
          datasets: [
            {
              label: "Interés Simple",
              data: [amount, interest],
              backgroundColor: ["#ff00ff", "#00ffcc"],
              animation: { duration: 1000, easing: "easeOutBounce" },
            },
          ],
        };
        history.push(
          `Interés Simple: Monto=${formatCurrency(
            convertToCurrency(amount, currency),
            currency
          )}, Tasa=${(rate * 100).toFixed(
            2
          )}%, Tiempo=${time} años, Total=${formatCurrency(
            convertToCurrency(total, currency),
            currency
          )}`
        );
      } else if (calcType === "compound") {
        /* Compound Interest */
        const total = amount * Math.pow(1 + rate, time);
        const interest = total - amount;
        resultText = `Interés Compuesto:<br>Interés: ${formatCurrency(
          convertToCurrency(interest, currency),
          currency
        )}<br>Total: ${formatCurrency(
          convertToCurrency(total, currency),
          currency
        )}`;
        chartData = {
          labels: ["Monto Principal", "Interés"],
          datasets: [
            {
              label: "Interés Compuesto",
              data: [amount, interest],
              backgroundColor: ["#ff00ff", "#00ffcc"],
              animation: { duration: 1000, easing: "easeOutBounce" },
            },
          ],
        };
        history.push(
          `Interés Compuesto: Monto=${formatCurrency(
            convertToCurrency(amount, currency),
            currency
          )}, Tasa=${(rate * 100).toFixed(
            2
          )}%, Tiempo=${time} años, Total=${formatCurrency(
            convertToCurrency(total, currency),
            currency
          )}`
        );
      } else if (calcType === "amortization") {
        /* Amortization */
        const monthlyRate = rate / 12;
        const months = Math.round(time * 12);
        const monthlyPayment =
          (amount * (monthlyRate * Math.pow(1 + monthlyRate, months))) /
          (Math.pow(1 + monthlyRate, months) - 1);
        if (isNaN(monthlyPayment) || !isFinite(monthlyPayment)) {
          resultText =
            "Error en el cálculo de amortización. Verifique los valores.";
        } else {
          resultText = `Amortización:<br>Cuota Mensual: ${formatCurrency(
            convertToCurrency(monthlyPayment, currency),
            currency
          )}<br>Total Pagado: ${formatCurrency(
            convertToCurrency(monthlyPayment * months, currency),
            currency
          )}`;
          chartData = {
            labels: Array.from({ length: months }, (_, i) => `Mes ${i + 1}`),
            datasets: [
              {
                label: "Cuota Mensual",
                data: Array(months).fill(monthlyPayment),
                borderColor: "#00ffcc",
                fill: false,
                animation: { duration: 1000, easing: "easeOutBounce" },
              },
            ],
          };
          history.push(
            `Amortización: Monto=${formatCurrency(
              convertToCurrency(amount, currency),
              currency
            )}, Tasa=${(rate * 100).toFixed(
              2
            )}%, Tiempo=${time} años, Cuota Mensual=${formatCurrency(
              convertToCurrency(monthlyPayment, currency),
              currency
            )}`
          );
          /* Generate amortization table */
          amortizationTableDiv.innerHTML = generateAmortizationTable(
            amount,
            monthlyRate,
            months,
            monthlyPayment,
            currency
          );
        }
      } else if (calcType === "npv") {
        /* NPV */
        const npv = calculateNPV(rate, cashFlows);
        resultText = `VAN (Valor Actual Neto): ${formatCurrency(
          convertToCurrency(npv, currency),
          currency
        )}`;
        chartData = {
          labels: cashFlows.map((_, i) => `Período ${i}`),
          datasets: [
            {
              label: "Flujos de Caja",
              data: cashFlows,
              backgroundColor: "#00ffcc",
              animation: { duration: 1000, easing: "easeOutBounce" },
            },
          ],
        };
        history.push(
          `VAN: Flujos=[${cashFlows
            .map((f) =>
              formatCurrency(convertToCurrency(f, currency), currency)
            )
            .join(", ")}], Tasa=${(rate * 100).toFixed(
            2
          )}%, VAN=${formatCurrency(
            convertToCurrency(npv, currency),
            currency
          )}`
        );
      } else if (calcType === "irr") {
        /* IRR */
        const irr = calculateIRR(cashFlows);
        if (irr === null || isNaN(irr)) {
          resultText =
            "No se pudo calcular la TIR. Asegúrese de incluir al menos un flujo negativo y uno positivo.";
        } else {
          resultText = `TIR (Tasa Interna de Retorno): ${irr.toFixed(2)}%`;
          chartData = {
            labels: cashFlows.map((_, i) => `Período ${i}`),
            datasets: [
              {
                label: "Flujos de Caja",
                data: cashFlows,
                backgroundColor: "#00ffcc",
                animation: { duration: 1000, easing: "easeOutBounce" },
              },
            ],
          };
          history.push(
            `TIR: Flujos=[${cashFlows
              .map((f) =>
                formatCurrency(convertToCurrency(f, currency), currency)
              )
              .join(", ")}], TIR=${irr.toFixed(2)}%`
          );
        }
      } else if (calcType === "sensitivity") {
        /* Sensitivity Analysis */
        const { rates, npvs } = performSensitivityAnalysis(
          cashFlows,
          rateRange[0],
          rateRange[1]
        );
        resultText = `Análisis de Sensibilidad (VAN):<br>Tasas: [${rates.join(
          ", "
        )}]%<br>VANs: [${npvs
          .map((npv) =>
            formatCurrency(convertToCurrency(npv, currency), currency)
          )
          .join(", ")}]`;
        chartData = {
          labels: rates,
          datasets: [
            {
              label: "VAN vs Tasa",
              data: npvs,
              borderColor: "#ff00cc",
              fill: false,
              tension: 0.1,
              animation: { duration: 1000, easing: "easeOutBounce" },
            },
          ],
        };
        history.push(
          `Sensibilidad: Flujos=[${cashFlows
            .map((f) =>
              formatCurrency(convertToCurrency(f, currency), currency)
            )
            .join(", ")}], Rango=[${rateRange[0]},${
            rateRange[1]
          }]%, Resultados=[${npvs
            .map((npv) =>
              formatCurrency(convertToCurrency(npv, currency), currency)
            )
            .join(", ")}]`
        );
      }

      /* Save history */
      localStorage.setItem("calcHistory", JSON.stringify(history));
      updateHistoryList();

      /* Show result */
      resultDiv.innerHTML = resultText;
      resultDiv.style.opacity = "0";
      setTimeout(() => {
        resultDiv.style.opacity = "1";
      }, 100);

      /* Destroy previous chart */
      if (myChart) {
        myChart.destroy();
        myChart = null;
      }

      /* Create chart */
      if (chartData) {
        const canvas = document.getElementById("chartCanvas");
        if (canvas) {
          const ctx = canvas.getContext("2d");
          myChart = new Chart(ctx, {
            type:
              calcType === "amortization" || calcType === "sensitivity"
                ? "line"
                : "bar",
            data: chartData,
            options: {
              responsive: true,
              scales: {
                y: {
                  beginAtZero: true,
                  grid: { borderColor: "#ff00ff" },
                  ticks: { color: "#fff" },
                },
                x: {
                  grid: { borderColor: "#ff00ff" },
                  ticks: { color: "#fff" },
                },
              },
              plugins: {
                legend: { labels: { color: "#fff" } },
              },
            },
          });

          /* Enable download buttons */
          if (downloadChartBtn) downloadChartBtn.disabled = false;
          if (exportPdfBtn) exportPdfBtn.disabled = false;
        } else {
          console.error("chartCanvas not found");
        }
      } else {
        /* Disable download buttons */
        if (downloadChartBtn) downloadChartBtn.disabled = true;
        if (exportPdfBtn) exportPdfBtn.disabled = true;
      }
    }
  });

  /* Show/hide sensitivity input based on calcType */
  const calcTypeSelect = document.getElementById("calcType");
  if (calcTypeSelect) {
    calcTypeSelect.addEventListener("change", function () {
      const sensitivityGroup = document.querySelector(".sensitivity-group");
      if (sensitivityGroup) {
        sensitivityGroup.style.display =
          calcTypeSelect.value === "sensitivity" ? "block" : "none";
      }
    });
  }
} else {
  console.error("calcForm not found");
}

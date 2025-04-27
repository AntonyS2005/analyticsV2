import {
  readExcel,
  calcularDistribucionLineal,
  calcularDistribucionExponencial,
  calcularDistribucionLogaritmica,
  calcularFuturaYExponencial,
  calcularFuturaYLogaritmica,
} from "./correlacionBivariable.js";

// referenciar elementos
const fileInput = document.getElementById("excelFile");
const calcButton = document.getElementById("calculateButton");
const selectReg = document.getElementById("regressionSelect");
const predictX = document.getElementById("predictX");
const predictBtn = document.getElementById("predictButton");
const resultsDiv = document.getElementById("resultsArea");
const bestFitDiv = document.getElementById("bestFit");

let data = { x: [], y: [] };
let models = {};

// 1) Al cargar archivo
fileInput.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const buffer = await file.arrayBuffer();
  data = readExcel(buffer);

  calcButton.disabled = false;
  selectReg.disabled = true;
  predictBtn.disabled = true;
  predictX.disabled = true;
  resultsDiv.innerHTML = "";
  bestFitDiv.textContent = "";
});

// 2) Al hacer click en Calcular
calcButton.addEventListener("click", () => {
  const { x, y } = data;
  models.linear = calcularDistribucionLineal(x, y);
  models.exponential = calcularDistribucionExponencial(x, y);
  models.logarithmic = calcularDistribucionLogaritmica(x, y);

  // determinar mejor R
  const best = Object.entries(models).reduce(
    (prev, [key, m]) =>
      Math.abs(m.r) > Math.abs(prev.r) ? { name: key, r: m.r } : prev,
    { name: null, r: 0 }
  );
  bestFitDiv.textContent = `Mejor ajuste: ${best.name} (r = ${best.r.toFixed(
    4
  )})`;

  selectReg.disabled = false;
  selectReg.value = best.name;
  renderTable(best.name);
});

// 3) Al cambiar el select
selectReg.addEventListener("change", () => {
  renderTable(selectReg.value);
});

// 4) Renderizar la tabla de un modelo
function renderTable(type) {
  const m = models[type];
  if (!m) return;

  predictX.disabled = false;
  predictBtn.disabled = false;

  // preparar signo y valor absoluto de b (string → número → string)
  const rawB = parseFloat(m.b);
  const sign = rawB < 0 ? "-" : "+";
  const absBstr = Math.abs(rawB).toString();

  // ecuación según tipo
  let term;
  if (type === "linear") {
    term = `x`;
  } else if (type === "exponential") {
    term = `e^{(${m.b}·x)}`;
  } else {
    term = `ln(x)`;
  }

  resultsDiv.innerHTML = `
    <h2>Regresión ${type.charAt(0).toUpperCase() + type.slice(1)}</h2>
    <p>
      Ecuación:
      <code>
        y = ${m.a} ${sign} ${absBstr}·${term}
      </code>
    </p>
    <p>r = ${m.r.toFixed(4)} | n = ${m.nDatos}</p>
    <table>
      <thead>
        <tr>
          <th>i</th><th>x</th><th>y</th>
          ${
            type === "linear"
              ? `<th>dx</th><th>dy</th><th>dx²</th><th>dy²</th><th>dx·dy</th>`
              : ""
          }
          ${
            type === "exponential"
              ? `<th>ln(y)</th><th>dx</th><th>dln(y)</th>`
              : ""
          }
          ${
            type === "logarithmic"
              ? `<th>ln(x)</th><th>dln(x)</th><th>dy</th>`
              : ""
          }
        </tr>
      </thead>
      <tbody>
        ${m.x
          .map((xi, i) => {
            const yi = m.y[i];
            let extra = "";
            if (type === "linear") {
              extra = `
                <td>${m.arrayDX[i].toFixed(2)}</td>
                <td>${m.arrayDY[i].toFixed(2)}</td>
                <td>${m.arrayDXpow2[i].toFixed(2)}</td>
                <td>${m.arrayDYpow2[i].toFixed(2)}</td>
                <td>${m.arrayDXDY[i].toFixed(2)}</td>
              `;
            } else if (type === "exponential") {
              extra = `
                <td>${m.arrayLogy[i].toFixed(2)}</td>
                <td>${m.arrayDx[i].toFixed(2)}</td>
                <td>${m.arrayDlogY[i].toFixed(2)}</td>
              `;
            } else {
              extra = `
                <td>${m.arrayLogx[i].toFixed(2)}</td>
                <td>${m.arrayDlogX[i].toFixed(2)}</td>
                <td>${m.arrayDy[i].toFixed(2)}</td>
              `;
            }
            return `<tr>
              <td>${i + 1}</td>
              <td>${xi}</td>
              <td>${yi}</td>
              ${extra}
            </tr>`;
          })
          .join("")}
      </tbody>
    </table>
  `;
}

// 5) Predicción de Y futura
predictBtn.addEventListener("click", () => {
  const xVal = parseFloat(predictX.value);
  const type = selectReg.value;
  let yPred;

  if (type === "linear") {
    const aNum = parseFloat(models.linear.a);
    const bNum = parseFloat(models.linear.b);
    yPred = aNum + bNum * xVal;
  } else if (type === "exponential") {
    yPred = calcularFuturaYExponencial(
      models.exponential.a,
      models.exponential.b,
      xVal
    );
  } else {
    yPred = calcularFuturaYLogaritmica(
      models.logarithmic.a,
      models.logarithmic.b,
      xVal
    );
  }

  const yNum = parseFloat(yPred);
  alert(`Para x=${xVal}, predicción (${type}): y ≈ ${yNum.toFixed(2)}`);
});

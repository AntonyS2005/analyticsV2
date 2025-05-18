async function parseExcelFile(file) {
  const arrayBuffer = await file.arrayBuffer();
  const data = new Uint8Array(arrayBuffer);
  const workbook = XLSX.read(data, { type: "array" });
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
  return XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
}

async function extractData(jsonData, useHeaders) {
  const Y = [];
  const Xraw = [];
  let headers;

  jsonData.forEach((row) => {
    if (row.length && row[0] != null) {
      Y.push(row[0]);
      Xraw.push(row.slice(1).filter((cell) => cell != null));
    }
  });

  if (useHeaders) {
    headers = Xraw.shift();
    Y.shift();
    if (Xraw[0].length < 2) {
      alert("No se puede hacer un análisis multivariable con una sola x");
      window.location.href = "correlacionBivariable.html";
      throw new Error("Redirigiendo a análisis bivariable");
    }
  } else {
    headers = Xraw[0].map((_, i) => `x${i + 1}`);
    if (Xraw[0].length < 2) {
      alert("No se puede hacer un análisis multivariable con una sola x");
      window.location.href = "correlacionBivariable.html";
      throw new Error("Redirigiendo a análisis bivariable");
    }
  }

  return { Y, Xraw, headers };
}

async function performLinearRegression(Y, Xraw) {
  if (!Y.length || !Xraw.length || !Xraw[0].length) {
    alert("No se puede hacer un análisis multivariable con una sola x");
    window.location.href = "correlacionBivariable.html";
    throw new Error("Redirigiendo a análisis bivariable");
  }
  const n = Y.length;
  const p = Xraw[0].length + 1;
  const X = Xraw.map((row) => [1, ...row]);
  const Xt = math.transpose(X);
  const XtX = math.multiply(Xt, X);
  const XtX_inv = math.inv(XtX);
  const XtY = math.multiply(Xt, Y);
  const beta = math.multiply(XtX_inv, XtY);

  const yHat = math.multiply(X, beta);
  const residuals = math.subtract(Y, yHat);
  const s2 = math.sum(math.dotPow(residuals, 2)) / (n - p);

  const covB = math.multiply(s2, XtX_inv);
  const se = covB.map((row, i) => Math.sqrt(row[i]));

  const tStats = beta.map((b, i) => b / se[i]);
  const df = n - p;
  const pValues = tStats.map(
    (t) => 2 * (1 - jStat.studentt.cdf(Math.abs(t), df))
  );

  return { coefficients: beta, pValues };
}

document.addEventListener("DOMContentLoaded", () => {
  let Y, Xraw, headers, finalCoef, finalP;
  let signifIndices = [];

  document
    .getElementById("excelFileInput")
    .addEventListener("change", async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      try {
        const jsonData = await parseExcelFile(file);
        const useHeaders = document.getElementById("headerCheckbox").checked;
        ({ Y, Xraw, headers } = await extractData(jsonData, useHeaders));

        renderTable(
          "rawDataContainer",
          ["Y", ...headers],
          Y.map((y, i) => [y, ...Xraw[i]])
        );

        const res = await performLinearRegression(Y, Xraw);
        finalCoef = res.coefficients;
        finalP = res.pValues;

        signifIndices = headers
          .map((h, i) => (finalP[i + 1] <= 0.05 ? i : -1))
          .filter((i) => i >= 0);

        renderRegression("regressionResultsContainer", finalCoef, finalP, [
          "Intercept",
          ...headers,
        ]);

        const nonSig = headers.filter((h, i) => finalP[i + 1] > 0.05);
        if (nonSig.length) showRecalc(nonSig);
        else showPrediction(headers);
      } catch (err) {
        if (err.message !== "Redirigiendo a análisis bivariable") {
          alert(err.message);
        }
      }
    });

  document
    .getElementById("recalculateButton")
    .addEventListener("click", async () => {
      try {
        const keptNames = Array.from(
          document.querySelectorAll("#recalcVars input:checked")
        ).map((i) => i.value);

        const keptNonSig = headers
          .map((h, i) => (keptNames.includes(h) ? i : -1))
          .filter((i) => i >= 0);

        const finalIdx = [...signifIndices, ...keptNonSig].sort(
          (a, b) => a - b
        );

        const Xf = Xraw.map((r) => finalIdx.map((i) => r[i]));
        const hdrs = finalIdx.map((i) => headers[i]);

        const res = await performLinearRegression(Y, Xf);
        finalCoef = res.coefficients;
        finalP = res.pValues;

        renderRegression("regressionResultsContainer", finalCoef, finalP, [
          "Intercept",
          ...hdrs,
        ]);

        headers = hdrs;
        document.getElementById("recalculationArea").style.display = "none";
        showPrediction(headers);
      } catch (err) {
        alert(err.message);
      }
    });

  document.getElementById("predictButton").addEventListener("click", () => {
    const inputs = Array.from(
      document.querySelectorAll("#predictionInputs input")
    ).map((i) => parseFloat(i.value) || 0);
    const formula = [
      `Y = ${finalCoef[0].toFixed(4)}`,
      ...inputs.map((v, i) => `${finalCoef[i + 1].toFixed(4)}*x${i + 1}`),
    ].join(" + ");
    document.getElementById("predictionFormula").textContent = formula;
    const yPred = finalCoef.reduce(
      (sum, b, i) => sum + b * (i ? inputs[i - 1] : 1),
      0
    );
    document.getElementById(
      "predictionResult"
    ).textContent = `Y predicho: ${yPred.toFixed(4)}`;
  });

  function renderTable(elId, heads, data) {
    const c = document.getElementById(elId);
    c.innerHTML = "";
    const tbl = document.createElement("table");
    const thead = tbl.insertRow();
    heads.forEach((h) => {
      const th = document.createElement("th");
      th.textContent = h;
      thead.appendChild(th);
    });
    data.forEach((row) => {
      const r = tbl.insertRow();
      row.forEach((cel) => {
        const td = r.insertCell();
        td.textContent = cel;
      });
    });
    c.appendChild(tbl);
  }

  function renderRegression(elId, coef, pvals, heads) {
    const c = document.getElementById(elId);
    c.innerHTML = "";
    const tbl = document.createElement("table");
    const headerRow = tbl.insertRow();
    ["Variable", "Coeficiente", "p-value (%)"].forEach((t) => {
      const th = document.createElement("th");
      th.textContent = t;
      headerRow.appendChild(th);
    });
    heads.forEach((h, i) => {
      const r = tbl.insertRow();
      r.insertCell().textContent = h;
      r.insertCell().textContent = coef[i].toFixed(4);
      r.insertCell().textContent = (pvals[i] * 100).toFixed(2) + "%";
    });
    c.appendChild(tbl);
  }

  function showRecalc(vars) {
    const area = document.getElementById("recalculationArea");
    area.style.display = "block";
    const container = document.getElementById("recalcVars");
    container.innerHTML = "";
    vars.forEach((v) => {
      const lbl = document.createElement("label");
      const cb = document.createElement("input");
      cb.type = "checkbox";
      cb.checked = true;
      cb.value = v;
      lbl.appendChild(cb);
      lbl.append(` ${v}`);
      container.appendChild(lbl);
      container.appendChild(document.createElement("br"));
    });
  }

  function showPrediction(vars) {
    document.getElementById("predictionArea").style.display = "block";
    const container = document.getElementById("predictionInputs");
    container.innerHTML = "";
    vars.forEach((v) => {
      const lbl = document.createElement("label");
      lbl.textContent = `${v}: `;
      const inp = document.createElement("input");
      inp.type = "number";
      inp.step = "any";
      lbl.appendChild(inp);
      container.appendChild(lbl);
      container.appendChild(document.createElement("br"));
    });
  }
});

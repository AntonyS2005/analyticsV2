async function parseExcelFile(file) {
  const arrayBuffer = await file.arrayBuffer();
  const data = new Uint8Array(arrayBuffer);
  const workbook = XLSX.read(data, { type: "array" });
  const firstSheetName = workbook.SheetNames[0];
  const firstSheet = workbook.Sheets[firstSheetName];
  const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

  const Y = [];
  const Xraw = [];

  jsonData.forEach((row) => {
    if (row.length > 0 && row[0] != null) {
      Y.push(row[0]);
      const xRow = row.slice(1).filter((cell) => cell != null);
      Xraw.push(xRow);
    }
  });

  return { Y, Xraw };
}

async function performLinearRegression(Y, Xraw) {
  const n = Y.length;
  const k = Xraw[0].length;

  const ones = math.ones(n, 1);
  const X = math.concat(ones, Xraw);

  const Xt = math.transpose(X);
  const XtX_inv = math.inv(math.multiply(Xt, X));
  const beta = math.multiply(XtX_inv, math.multiply(Xt, Y));

  const Yhat = math.multiply(X, beta);
  const res = math.subtract(Y, Yhat);
  const SSE = math.dot(res, res);
  const df = n - (k + 1);
  const sigma2 = SSE / df;

  const covB = math.multiply(sigma2, XtX_inv);
  const stdErr = math.sqrt(math.diag(covB));

  const tStats = beta.map((b, i) => b / stdErr[i]);
  const pVals = tStats.map(
    (t) => 2 * (1 - jStat.studentt.cdf(Math.abs(t), df))
  );

  return { coefficients: beta, pValues: pVals };
}
// Global variables to store data and results accessible throughout the script
let originalY = [];
let originalXraw = [];
let originalHeaders = null; // Stores headers if useTitles is true
let finalCoefficients = []; // Coefficients from the final regression
let finalKeptIndices = []; // Original indices (1-based for X) of variables kept in the final model

document.addEventListener("DOMContentLoaded", () => {
  const excelFile = document.getElementById("excelFile");
  const useTitlesCheckbox = document.getElementById("useTitles");
  const rawDataSection = document.getElementById("rawDataSection");
  const rawDataDisplay = document.getElementById("rawDataDisplay");
  const initialResultsSection = document.getElementById(
    "initialResultsSection"
  );
  const initialResultsDisplay = document.getElementById(
    "initialResultsDisplay"
  );
  const recalculateBtn = document.getElementById("recalculateBtn");
  const finalResultsSection = document.getElementById("finalResultsSection");
  const finalResultsDisplay = document.getElementById("finalResultsDisplay");
  const formulaDisplay = document.getElementById("formulaDisplay");
  const predictionSection = document.getElementById("predictionSection");
  const predictionForm = document.getElementById("predictionForm");
  const predictBtn = document.getElementById("predictBtn");
  const predictionResult = document.getElementById("predictionResult");
  const errorMessagesDiv = document.getElementById("errorMessages");

  // Function to clear previous results
  function clearResults() {
    rawDataSection.style.display = "none";
    initialResultsSection.style.display = "none";
    recalculateBtn.style.display = "none";
    finalResultsSection.style.display = "none";
    predictionSection.style.display = "none";
    predictBtn.style.display = "none";

    rawDataDisplay.innerHTML = "";
    initialResultsDisplay.innerHTML = "";
    finalResultsDisplay.innerHTML = "";
    formulaDisplay.innerHTML = "";
    predictionForm.innerHTML = "";
    predictionResult.innerHTML = "";
    errorMessagesDiv.innerHTML = "";

    originalY = [];
    originalXraw = [];
    originalHeaders = null;
    finalCoefficients = [];
    finalKeptIndices = [];
  }

  // Event listener for file input change
  excelFile.addEventListener("change", async (event) => {
    clearResults(); // Clear previous results on new file selection
    const file = event.target.files[0];
    if (!file) {
      return;
    }

    const useTitles = useTitlesCheckbox.checked;

    try {
      // Parse the Excel file
      const parsedData = await parseExcelFile(file, useTitles);
      originalY = parsedData.Y;
      originalXraw = parsedData.Xraw;
      originalHeaders = parsedData.headers;

      if (
        originalY.length === 0 ||
        originalXraw.length === 0 ||
        originalXraw[0].length === 0
      ) {
        errorMessagesDiv.innerHTML =
          "Error: No se pudieron leer datos válidos del archivo.";
        return;
      }

      if (originalY.length !== originalXraw.length) {
        errorMessagesDiv.innerHTML =
          "Error: El número de filas en Y y X no coincide.";
        return;
      }

      // Display the raw data table
      displayDataTable(originalY, originalXraw, originalHeaders);
      rawDataSection.style.display = "block";

      // Perform initial regression
      const initialRegressionResults = await performLinearRegression(
        originalY,
        originalXraw
      );
      const initialPValues = initialRegressionResults.pValues;

      // Display initial results and variable selection checkboxes
      displayInitialResults(initialPValues, originalHeaders);
      initialResultsSection.style.display = "block";
      recalculateBtn.style.display = "block"; // Show the recalculate button
    } catch (error) {
      console.error("Error processing file:", error);
      errorMessagesDiv.innerHTML = `Error al procesar el archivo: ${error.message}`;
    }
  });

  // Event listener for recalculate button
  recalculateBtn.addEventListener("click", async () => {
    errorMessagesDiv.innerHTML = ""; // Clear previous errors

    // Determine which variables to keep based on checkboxes
    const checkboxes = initialResultsDisplay.querySelectorAll(".keep-variable");
    const variablesToKeepOriginalIndices = [0]; // Always keep the intercept (index 0)

    checkboxes.forEach((checkbox) => {
      if (checkbox.checked) {
        // checkbox.dataset.originalIndex stores the 1-based index of the X variable
        variablesToKeepOriginalIndices.push(
          parseInt(checkbox.dataset.originalIndex, 10)
        );
      }
    });

    // Filter Xraw based on selected variables
    const filteredXraw = originalXraw.map((row) => {
      const newRow = [];
      // Start from 1 because index 0 is the intercept in variablesToKeepOriginalIndices
      for (let i = 1; i < variablesToKeepOriginalIndices.length; i++) {
        const originalXIndex = variablesToKeepOriginalIndices[i] - 1; // Convert 1-based to 0-based for array access
        newRow.push(row[originalXIndex]);
      }
      return newRow;
    });

    if (filteredXraw.length === 0 || filteredXraw[0].length === 0) {
      // If only intercept is left, filteredXraw[0] will be empty.
      // Handle case where no variables are kept beyond the intercept.
      // This requires a simplified model (just the mean of Y), or display an error.
      // Let's display an error/warning for now as the regression function expects some X.
      // A more robust solution might calculate the mean of Y here.
      if (variablesToKeepOriginalIndices.length === 1) {
        // Only intercept kept
        const meanY =
          originalY.reduce((sum, val) => sum + val, 0) / originalY.length;
        finalCoefficients = [meanY];
        finalKeptIndices = [0]; // Indicate only intercept was kept

        finalResultsDisplay.innerHTML = `<h3>Modelo Simplificado (Solo Intercepto)</h3><p>Coeficiente (Media de Y): ${meanY.toFixed(
          4
        )}</p>`;
        formulaDisplay.innerHTML = `$ Y = ${meanY.toFixed(4)} $`;
        finalResultsSection.style.display = "block";
        predictionSection.style.display = "block";
        setupPredictionForm(
          finalCoefficients,
          finalKeptIndices,
          originalHeaders
        );
        predictBtn.style.display = "block";

        initialResultsSection.style.display = "none"; // Hide initial results after recalculation
        recalculateBtn.style.display = "none";
        return;
      } else {
        errorMessagesDiv.innerHTML =
          "Error: Ninguna variable predictora seleccionada para el análisis.";
        return;
      }
    }

    try {
      // Perform regression with selected variables
      const finalRegressionResults = await performLinearRegression(
        originalY,
        filteredXraw
      );
      finalCoefficients = finalRegressionResults.coefficients;

      // Store the original indices of the variables actually used (including intercept)
      // The performLinearRegression returns coefficients corresponding to [intercept, X1_kept, X2_kept, ...]
      // We need to map these back to the original X indices.
      // variablesToKeepOriginalIndices already holds [0, original_idx_1, original_idx_2, ...]
      finalKeptIndices = variablesToKeepOriginalIndices; // Store the original indices kept

      // Display final results (coefficients and formula)
      displayFinalResults(finalCoefficients, finalKeptIndices, originalHeaders);
      finalResultsSection.style.display = "block";

      // Setup the prediction form based on the variables used in the final model
      setupPredictionForm(finalCoefficients, finalKeptIndices, originalHeaders);
      predictionSection.style.display = "block";
      predictBtn.style.display = "block"; // Show the predict button

      initialResultsSection.style.display = "none"; // Hide initial results after recalculation
      recalculateBtn.style.display = "none";
    } catch (error) {
      console.error("Error during recalculation:", error);
      errorMessagesDiv.innerHTML = `Error al recalcular la regresión: ${error.message}`;
    }
  });

  // Event listener for predict button
  predictBtn.addEventListener("click", () => {
    errorMessagesDiv.innerHTML = ""; // Clear previous errors
    predictionResult.innerHTML = ""; // Clear previous prediction

    const predictionInputs =
      predictionForm.querySelectorAll(".prediction-input");
    const newXValues = {}; // Map original index -> value

    // Collect new X values from inputs
    let allInputsFilled = true;
    predictionInputs.forEach((input) => {
      const originalIndex = parseInt(input.dataset.originalIndex, 10);
      const value = parseFloat(input.value);
      if (isNaN(value)) {
        allInputsFilled = false;
        // Highlight missing input?
      }
      newXValues[originalIndex] = value;
    });

    if (!allInputsFilled) {
      errorMessagesDiv.innerHTML =
        "Por favor, introduce valores para todas las variables predictoras seleccionadas.";
      return;
    }

    // Calculate prediction
    let predictedY = finalCoefficients[0]; // Start with intercept

    // Iterate through the kept variables (skipping intercept)
    for (let i = 1; i < finalKeptIndices.length; i++) {
      const originalIndex = finalKeptIndices[i]; // Original index of the X variable (1-based)
      const coefficient = finalCoefficients[i]; // Coefficient corresponds to the position in finalCoefficients after intercept
      const newValue = newXValues[originalIndex]; // Get the input value for this variable

      if (newValue !== undefined) {
        // Should always be defined if allInputsFilled is true
        predictedY += coefficient * newValue;
      }
    }

    predictionResult.innerHTML = `<p><strong>Predicción Calculada:</strong> ${predictedY.toFixed(
      4
    )}</p>`;
  });

  // --- Refactored and New Functions ---

  /**
   * Parses an Excel file to extract Y and X data.
   * Refactored to handle optional title row.
   * @param {File} file - The Excel file to parse.
   * @param {boolean} useTitles - Whether the first row contains headers.
   * @returns {Promise<{Y: number[], Xraw: number[][], headers: string[]|null}>} - Parsed data.
   */
  async function parseExcelFile(file, useTitles) {
    const arrayBuffer = await file.arrayBuffer();
    const data = new Uint8Array(arrayBuffer);
    const workbook = XLSX.read(data, { type: "array" });
    const firstSheetName = workbook.SheetNames[0];
    const firstSheet = workbook.Sheets[firstSheetName];

    // Use header: 1 to get data as array of arrays
    const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

    let headers = null;
    let dataRows = jsonData;

    if (useTitles && jsonData.length > 0) {
      // First row is headers. Y header is ignored, X headers are slice(1)
      // Filter out null or empty headers
      headers = jsonData[0]
        .slice(1)
        .map((h) => (h === null || h === undefined ? "" : String(h).trim()))
        .filter((h) => h !== "");
      dataRows = jsonData.slice(1); // Data starts from the second row
    } else {
      // Generate default headers if not using titles or no titles found
      if (dataRows.length > 0 && dataRows[0].length > 1) {
        headers = Array.from(
          { length: dataRows[0].length - 1 },
          (_, i) => `X${i + 1}`
        );
      } else {
        headers = []; // No X variables
      }
    }

    const Y = [];
    const Xraw = [];

    dataRows.forEach((row) => {
      // Ensure the row has data and the first cell (Y) is not null/empty
      if (row.length > 0 && row[0] != null && String(row[0]).trim() !== "") {
        const yValue = parseFloat(row[0]);
        if (!isNaN(yValue)) {
          Y.push(yValue);
          // Extract X values from the rest of the row, filter nulls, parse as float
          const xRow = row
            .slice(1)
            .map((cell) =>
              cell != null && String(cell).trim() !== ""
                ? parseFloat(cell)
                : NaN
            )
            .filter((value) => !isNaN(value)); // Keep only valid numbers

          // Ensure all X rows have the same number of columns after filtering
          // This simple implementation assumes consistent number of X variables per row
          // A more robust version might pad with NaNs or handle missing data differently
          if (
            xRow.length > 0 &&
            (Xraw.length === 0 || xRow.length === Xraw[0].length)
          ) {
            Xraw.push(xRow);
          } else if (Xraw.length > 0 && xRow.length !== Xraw[0].length) {
            console.warn(
              `Skipping row ${
                Y.length + 1
              } due to inconsistent number of X variables.`
            );
            Y.pop(); // Remove the Y we just added
          } else if (xRow.length === 0 && headers.length > 0) {
            console.warn(
              `Skipping row ${
                Y.length + 1
              } as it contains no X variables but headers exist.`
            );
            Y.pop(); // Remove the Y we just added
          }
        } else {
          console.warn(`Skipping row due to invalid Y value: ${row[0]}`);
        }
      }
    });

    // After filtering rows, ensure Y and Xraw have the same length
    // If rows were skipped, their Y values were already popped.
    // Now, if there are rows left, make sure Xraw has the correct dimensions.
    // This is somewhat handled by the check inside the loop, but an extra check is good.
    if (Y.length !== Xraw.length && Y.length > 0) {
      console.error(
        "Mismatch between Y and Xraw length after parsing and filtering."
      );
      // Depending on desired behavior, might clear Y/Xraw or throw error
      throw new Error(
        "Error interno: inconsistencia de datos después de la lectura."
      );
    }
    if (
      Y.length > 0 &&
      Xraw.length > 0 &&
      headers.length !== Xraw[0].length &&
      useTitles
    ) {
      console.warn(
        "Mismatch between number of headers and number of X columns."
      );
      // Decide how to handle - maybe truncate headers or generate new ones
      headers = Array.from({ length: Xraw[0].length }, (_, i) =>
        useTitles && headers[i] ? headers[i] : `X${i + 1}`
      );
    }

    return { Y, Xraw, headers };
  }

  /**
   * Performs multiple linear regression.
   * Uses math.js for matrix operations and jStat for p-values.
   * @param {number[]} Y - The dependent variable vector.
   * @param {number[][]} Xraw - The independent variables matrix (without the column of ones).
   * @returns {Promise<{coefficients: number[], pValues: number[]}>} - Regression results.
   */
  async function performLinearRegression(Y, Xraw) {
    // Ensure libraries are loaded before attempting to use them
    if (typeof math === "undefined" || typeof jStat === "undefined") {
      throw new Error("Libraries (Math.js or jStat) not loaded.");
    }

    const n = Y.length; // Number of observations
    // If Xraw is empty (only intercept model), k will be 0. math.concat handles this.
    const k = Xraw.length > 0 ? Xraw[0].length : 0; // Number of independent variables

    // Create the design matrix X by adding a column of ones for the intercept
    const ones = math.ones(n, 1);
    let X;
    if (k > 0) {
      X = math.concat(ones, Xraw);
    } else {
      // Case: only intercept model
      X = ones;
    }

    // Calculate regression coefficients: beta = (X'X)^-1 X'Y
    const Xt = math.transpose(X);
    const XtX = math.multiply(Xt, X);

    let XtX_inv;
    try {
      XtX_inv = math.inv(XtX);
    } catch (e) {
      console.error("Error calculating (X'X)^-1:", e);
      throw new Error(
        "No se pudo calcular la inversa de (X'X). Puede haber problemas de multicolinealidad o datos insuficientes."
      );
    }

    const beta = math.multiply(XtX_inv, math.multiply(Xt, Y));

    // Calculate predicted values: Yhat = X * beta
    const Yhat = math.multiply(X, beta);

    // Calculate residuals: res = Y - Yhat
    const res = math.subtract(Y, Yhat);

    // Calculate Sum of Squared Errors (SSE): SSE = res' * res
    const SSE = math.dot(res, res);

    // Degrees of freedom: n - (k + 1) (n - number of coefficients)
    const df = n - beta.length; // beta.length is k+1

    if (df <= 0) {
      throw new Error(
        "Grados de libertad insuficientes para el cálculo de la regresión."
      );
    }

    // Estimate of error variance: sigma^2 = SSE / df
    const sigma2 = SSE / df;

    // Covariance matrix of coefficients: Cov(beta) = sigma^2 * (X'X)^-1
    const covB = math.multiply(sigma2, XtX_inv);

    // Standard errors of coefficients: sqrt(diag(Cov(beta)))
    const stdErr = math.sqrt(math.diag(covB));

    // Handle potential division by zero if stdErr is very close to zero
    const tStats = beta.map((b, i) =>
      stdErr[i] < 1e-10
        ? b > 0
          ? Infinity
          : b < 0
          ? -Infinity
          : 0
        : b / stdErr[i]
    );

    // Calculate p-values using the t-distribution CDF
    // For a two-tailed test, p-value = 2 * P(T > |tStat|)
    const pVals = tStats.map((t) => {
      if (t === Infinity) return 0; // Highly significant
      if (t === -Infinity) return 0; // Highly significant
      if (t === 0) return 1; // Not significant

      // Handle potential errors in jStat CDF
      try {
        // Ensure args are numbers and df > 0
        if (
          typeof Math.abs(t) !== "number" ||
          typeof df !== "number" ||
          df <= 0
        ) {
          console.error(
            "Invalid arguments for jStat.studentt.cdf:",
            Math.abs(t),
            df
          );
          return NaN; // Indicate calculation failed
        }
        const cdfValue = jStat.studentt.cdf(Math.abs(t), df);
        return 2 * (1 - cdfValue);
      } catch (e) {
        console.error("Error calculating jStat.studentt.cdf:", e);
        return NaN; // Indicate calculation failed
      }
    });

    return {
      coefficients: beta._data ? beta._data : [beta],
      pValues: pVals._data ? pVals._data : [pVals],
    }; // Return plain arrays
  }

  /**
   * Displays the raw data in an HTML table.
   * @param {number[]} Y - The Y data.
   * @param {number[][]} Xraw - The X raw data.
   * @param {string[]|null} headers - The headers for X, or null.
   */
  function displayDataTable(Y, Xraw, headers) {
    let tableHTML = "<table><thead><tr><th>Y</th>";
    const numX = Xraw.length > 0 ? Xraw[0].length : 0;

    if (headers && headers.length === numX) {
      headers.forEach((header) => {
        tableHTML += `<th>${header}</th>`;
      });
    } else {
      for (let i = 0; i < numX; i++) {
        tableHTML += `<th>X${i + 1}</th>`;
      }
    }
    tableHTML += "</tr></thead><tbody>";

    for (let i = 0; i < Y.length; i++) {
      tableHTML += `<tr><td>${Y[i].toFixed(4)}</td>`;
      if (Xraw[i]) {
        Xraw[i].forEach((xVal) => {
          tableHTML += `<td>${xVal.toFixed(4)}</td>`;
        });
      }
      tableHTML += "</tr>";
    }

    tableHTML += "</tbody></table>";
    rawDataDisplay.innerHTML = tableHTML;
  }

  /**
   * Displays the initial regression p-values and checkboxes for variable selection.
   * @param {number[]} pValues - The p-values from the initial regression (includes intercept).
   * @param {string[]|null} headers - The headers for X, or null.
   */
  function displayInitialResults(pValues, headers) {
    let resultsHTML =
      "<table><thead><tr><th>Variable</th><th>p-valor</th><th>Incluir</th></tr></thead><tbody>";

    // Intercept (index 0 in pValues)
    const interceptPValue = pValues[0];
    resultsHTML += `<tr><td>Intercepto</td><td>${interceptPValue.toFixed(
      4
    )}</td><td></td></tr>`; // No checkbox for intercept

    // X variables (index 1 onwards in pValues)
    const numX = pValues.length - 1;
    for (let i = 0; i < numX; i++) {
      const originalXIndex = i + 1; // 1-based index for the original X variable
      const variableName =
        headers && headers[i] ? headers[i] : `X${originalXIndex}`;
      const pValue = pValues[originalXIndex];
      const includeCheckbox =
        pValue > 0.05
          ? `<input type="checkbox" class="keep-variable" data-original-index="${originalXIndex}" checked> <small>(p > 0.05, considera quitar)</small>`
          : `<input type="checkbox" class="keep-variable" data-original-index="${originalXIndex}" checked>`; // Keep by default

      resultsHTML += `<tr><td>${variableName}</td><td>${pValue.toFixed(
        4
      )}</td><td>${includeCheckbox}</td></tr>`;
    }

    resultsHTML += "</tbody></table>";
    initialResultsDisplay.innerHTML = resultsHTML;
  }

  /**
   * Displays the final regression coefficients and the formula.
   * @param {number[]} coefficients - The coefficients from the final regression (includes intercept).
   * @param {number[]} keptIndices - The original 1-based indices of X variables kept (includes 0 for intercept).
   * @param {string[]|null} headers - The original headers for X, or null.
   */
  function displayFinalResults(coefficients, keptIndices, headers) {
    let resultsHTML =
      "<h3>Coeficientes Estimados</h3><table><thead><tr><th>Variable</th><th>Coeficiente</th></tr></thead><tbody>";

    // Intercept
    resultsHTML += `<tr><td>Intercepto</td><td>${coefficients[0].toFixed(
      4
    )}</td></tr>`;

    // X variables
    // keptIndices includes 0 for intercept at index 0
    // Coefficients[1] corresponds to the variable at keptIndices[1], coefficients[2] to keptIndices[2], etc.
    for (let i = 1; i < keptIndices.length; i++) {
      const originalXIndex = keptIndices[i]; // Original 1-based index
      const coefficient = coefficients[i]; // Coefficient from the final model
      const variableName =
        headers && headers[originalXIndex - 1]
          ? headers[originalXIndex - 1]
          : `X${originalXIndex}`;
      resultsHTML += `<tr><td>${variableName}</td><td>${coefficient.toFixed(
        4
      )}</td></tr>`;
    }

    resultsHTML += "</tbody></table>";
    finalResultsDisplay.innerHTML = resultsHTML;

    // Display the formula
    let formula = `$ Y = ${coefficients[0].toFixed(4)} `; // Start with intercept

    for (let i = 1; i < keptIndices.length; i++) {
      const originalXIndex = keptIndices[i]; // Original 1-based index
      const coefficient = coefficients[i]; // Coefficient from the final model

      // Get the generic variable name for the formula display (x1, x2, etc.)
      const genericVariableName = `x${originalXIndex}`;

      const sign = coefficient >= 0 ? "+" : "-";
      formula += ` ${sign} ${Math.abs(coefficient).toFixed(
        4
      )} ${genericVariableName} `;
    }
    formula = formula.trim(); // Clean up trailing space
    formula += " $"; // Close LaTeX math mode

    formulaDisplay.innerHTML = `<h3>Fórmula de Regresión Final</h3><p>${formula}</p>`;
  }

  /**
   * Sets up the input form for making predictions based on the final model.
   * @param {number[]} coefficients - The coefficients from the final regression (includes intercept).
   * @param {number[]} keptIndices - The original 1-based indices of X variables kept (includes 0 for intercept).
   * @param {string[]|null} headers - The original headers for X, or null.
   */
  function setupPredictionForm(coefficients, keptIndices, headers) {
    let formHTML = "";

    // Create input fields only for the variables kept in the final model (skipping intercept)
    for (let i = 1; i < keptIndices.length; i++) {
      const originalXIndex = keptIndices[i]; // Original 1-based index
      const variableName =
        headers && headers[originalXIndex - 1]
          ? headers[originalXIndex - 1]
          : `X${originalXIndex}`;

      formHTML += `
                  <div class="prediction-input-group">
                      <label for="predict_x${originalXIndex}">${variableName}:</label>
                      <input type="number" step="any" id="predict_x${originalXIndex}" class="prediction-input" data-original-index="${originalXIndex}">
                  </div>
              `;
    }

    predictionForm.innerHTML = formHTML;
  }
});

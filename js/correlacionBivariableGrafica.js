import {
  calcularDistribucionLineal,
  calcularDistribucionExponencial,
  calcularDistribucionLogaritmica,
} from "./correlacionBivariable.js";

let chartInstance;

function graficarDispercion(titulo, puntos, linea = null) {
  const ctx = document.getElementById("GraficaCanvas").getContext("2d");

  if (chartInstance) {
    chartInstance.destroy();
  }

  const datasets = [
    {
      label: "Datos",
      data: puntos,
      backgroundColor: "rgba(61, 249, 71, 0.6)",
      borderColor: "rgb(25, 182, 1)",
      showLine: false,
      pointRadius: 5,
    },
  ];

  if (linea) {
    datasets.push({
      label: "Ajuste",
      data: linea,
      borderColor: "rgba(63, 160, 7, 0.79)",
      borderWidth: 2,
      fill: false,
      showLine: true,
      pointRadius: 0,
    });
  }

  chartInstance = new Chart(ctx, {
    type: "scatter",
    data: {
      datasets: datasets,
    },
    options: {
      responsive: true,
      scales: {
        x: {
          title: { display: true, text: "x" },
          type: 'linear',
          position: 'bottom'
        },
        y: {
          title: { display: true, text: "y" },
          type: 'linear',
        },
      },
      plugins: {
        title: {
          display: true,
          text: `Gráfica de dispersión - ${titulo}`,
        },
        legend: {
          display: true,
        },
      },
    },
  });
}

export function graficarLineal(x, y) {
  const modelo = calcularDistribucionLineal(x, y);
  const puntos = x.map((xi, i) => ({ x: xi, y: y[i] }));

  const minX = Math.min(...x);
  const maxX = Math.max(...x);

  const linePoints = [];
  const numberOfLinePoints = 100;
  for (let i = 0; i < numberOfLinePoints; i++) {
    const xi = minX + (i / (numberOfLinePoints - 1)) * (maxX - minX);
    linePoints.push({
      x: xi,
      y: modelo.a + modelo.b * xi,
    });
  }

  graficarDispercion("Lineal", puntos, linePoints);
}

export function graficarExponencial(x, y) {
  const modelo = calcularDistribucionExponencial(x, y);
  const puntos = x.map((xi, i) => ({ x: xi, y: y[i] }));

  const minX = Math.min(...x);
  const maxX = Math.max(...x);

  const linePoints = [];
  const numberOfLinePoints = 100;
  for (let i = 0; i < numberOfLinePoints; i++) {
    const xi = minX + (i / (numberOfLinePoints - 1)) * (maxX - minX);
    linePoints.push({
      x: xi,
      y: modelo.a * Math.exp(modelo.b * xi),
    });
  }

  graficarDispercion("Exponencial", puntos, linePoints);
}

export function graficarLogaritmica(x, y) {
  const modelo = calcularDistribucionLogaritmica(x, y);
  const puntos = x.map((xi, i) => ({ x: xi, y: y[i] }));

  const minX = Math.min(...x);
  const maxX = Math.max(...x);

  const linePoints = [];
  const numberOfLinePoints = 100;
  for (let i = 0; i < numberOfLinePoints; i++) {
    const xi = minX + (i / (numberOfLinePoints - 1)) * (maxX - minX);
    if (xi > 0) {
      linePoints.push({
        x: xi,
        y: modelo.a + modelo.b * Math.log(xi),
      });
    }
  }

  graficarDispercion("Logarítmica", puntos, linePoints);
}

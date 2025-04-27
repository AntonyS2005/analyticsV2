function calcularPromedio(data) {
  const suma = data.reduce((acc, val) => acc + val, 0);
  return suma / data.length;
}
function calcularSx(sumDXpow2, n) {
  return Math.sqrt(sumDXpow2 / n);
}
function calcularSy(sumDYpow2, n) {
  return Math.sqrt(sumDYpow2 / n);
}
function calcularSXY(sumDxDy, n) {
  return sumDxDy / n;
}
function calcularR(SXY, SX, SY) {
  return SXY / (SX * SY);
}
function calcularB(SXY, SX) {
  return (SXY / SX ** 2).toFixed(2);
}

function calcularA(promY, B, promX) {
  return (promY - B * promX).toFixed(2);
}

function calcularTotales(Data) {
  return Data.reduce((acumulador, valorActual) => {
    return acumulador + valorActual;
  }, 0);
}
export function readExcel(buffer) {
  const workbook = XLSX.read(buffer, { type: "array" });
  const firstSheetName = workbook.SheetNames[0];
  const sheet = XLSX.utils.sheet_to_json(workbook.Sheets[firstSheetName], {
    header: 1,
  });

  let x = [];
  let y = [];

  for (let col = 0; col < sheet[0].length; col++) {
    const numericValues = sheet
      .map((row) => row[col])
      .filter((cell) => typeof cell === "number");
    if (numericValues.length > 0) {
      if (x.length === 0) {
        x = numericValues;
      } else if (y.length === 0) {
        y = numericValues;
        break;
      }
    }
  }

  return { x, y };
}

export function calcularDistribucionLineal(x, y) {
  let arrayDX = [];
  let arrayDY = [];
  let arrayDXpow2 = [];
  let arrayDYpow2 = [];
  let arrayDXDY = [];

  const xMedia = calcularPromedio(x);
  const yMedia = calcularPromedio(y);
  const nDatos = x.length;

  for (let i = 0; i < nDatos; i++) {
    const dx = x[i] - xMedia;
    const dy = y[i] - yMedia;
    arrayDX.push(dx);
    arrayDY.push(dy);
    arrayDXpow2.push(dx ** 2);
    arrayDYpow2.push(dy ** 2);
    arrayDXDY.push(dx * dy);
  }

  const totalX = calcularTotales(x);
  const totalY = calcularTotales(y);
  const totalDXpow2 = calcularTotales(arrayDXpow2);
  const totalDYpow2 = calcularTotales(arrayDYpow2);
  const totalDXDY = calcularTotales(arrayDXDY);

  const sx = calcularSx(totalDXpow2, nDatos);
  const sy = calcularSy(totalDYpow2, nDatos);
  const sxy = calcularSXY(totalDXDY, nDatos);

  const r = calcularR(sxy, sx, sy);
  const b = calcularB(sxy, sx);
  const a = calcularA(yMedia, b, xMedia);
  const ecuacionRegresion = `${Number(a).toFixed(2)} ${
    b < 0 ? "-" : "+"
  } ${Math.abs(b).toFixed(2)}x`;

  return {
    x,
    y,
    xMedia,
    yMedia,
    nDatos,
    arrayDX,
    arrayDY,
    arrayDXpow2,
    arrayDYpow2,
    arrayDXDY,
    totalX,
    totalY,
    totalDXpow2,
    totalDYpow2,
    totalDXDY,
    sx,
    sy,
    sxy,
    r,
    b,
    a,
    ecuacionRegresion,
  };
}

function calProYlineal(a, b, y) {
  return a + b * y;
}

export function calcularDistribucionExponencial(x, y) {
  let arrayLogy = [];
  let arrayDx = [];
  let arrayDlogY = [];
  let arrayDxPow2 = [];
  let arrayDlogYpow2 = [];
  let arrayDxDlogY = [];
  const nDatos = x.length;
  const xMedia = calcularPromedio(x);
  const yMedia = calcularPromedio(y);
  for (let i = 0; i < nDatos; i++) {
    arrayLogy.push(Math.log(y[i]));
    arrayDx.push(x[i] - xMedia);
    arrayDlogY.push(arrayLogy[i] - yMedia);
    arrayDxPow2.push(arrayDx[i] ** 2);
    arrayDlogYpow2.push(arrayDlogY[i] ** 2);
    arrayDxDlogY.push(arrayDx[i] * arrayDlogY[i]);
  }
  const totalDx = calcularTotales(arrayDx);
  const totalDlogY = calcularTotales(arrayDlogY);
  const totalDxPow2 = calcularTotales(arrayDxPow2);
  const totalDlogYpow2 = calcularTotales(arrayDlogYpow2);
  const totalDxDlogY = calcularTotales(arrayDxDlogY);
  const sx = calcularSx(totalDxPow2, nDatos);
  const sy = calcularSy(totalDlogYpow2, nDatos);
  const sxy = calcularSXY(totalDxDlogY, nDatos);
  const r = calcularR(sxy, sx, sy);
  const b = calcularB(sxy, sx);
  const a = calcularA(yMedia, b, xMedia);
  const ecuacionRegresion = `${Number(a).toFixed(2)} ${b < 0 ? "-" : "+"} ${Math.abs(
    b
  ).toFixed(2)}ln(x)`;
  return {
    x,
    y,
    xMedia,
    yMedia,
    nDatos,
    arrayLogy,
    arrayDx,
    arrayDlogY,
    arrayDxPow2,
    arrayDlogYpow2,
    arrayDxDlogY,
    totalDx,
    totalDlogY,
    totalDxPow2,
    totalDlogYpow2,
    totalDxDlogY,
    sx,
    sy,
    sxy,
    r,
    b,
    a,
    ecuacionRegresion,
  };
}
export function calcularFuturaYExponencial(a, b, x) {
  const resultadoExponencial = Math.exp(a) * Math.exp(b * x);
  const resultadoRedondeado = Math.round(resultadoExponencial);
  return resultadoRedondeado;
}

export function calcularDistribucionLogaritmica(x, y) {
  let arrayLogx = [];
  let arrayDy = [];
  let arrayDlogX = [];
  let arrayLogxPow2 = [];
  let arrayDyPow2 = [];
  let arrayDlogXy = [];

  const nDatos = x.length;
  const yMedia = calcularPromedio(y);

  for (let i = 0; i < nDatos; i++) {
    arrayLogx.push(Math.log(x[i]));
  }

  const xMedia = calcularPromedio(arrayDlogX);

  for (let i = 0; i < nDatos; i++) {
    arrayDy.push(y[i] - yMedia);
    arrayDlogX.push(arrayLogx[i] - xMedia);
    arrayLogxPow2.push(arrayLogx[i] ** 2);
    arrayDyPow2.push(arrayDy[i] ** 2);
    arrayDlogXy.push(arrayDlogX[i] * arrayDy[i]);
  }

  const totalLogx = calcularTotales(arrayLogx);
  const totalDy = calcularTotales(arrayDy);
  const totalLogxPow2 = calcularTotales(arrayLogxPow2);
  const totalDyPow2 = calcularTotales(arrayDyPow2);
  const totalDlogXy = calcularTotales(arrayDlogXy);

  const sx = calcularSx(totalLogxPow2, nDatos);
  const sy = calcularSy(totalDyPow2, nDatos);
  const sxy = calcularSXY(totalDlogXy, nDatos);

  const r = calcularR(sxy, sx, sy);
  const b = calcularB(sxy, sx);
  const a = calcularA(yMedia, b, xMedia);

  const ecuacionRegresion = `${Number(a).toFixed(2)} ${b < 0 ? "-" : "+"} ${Math.abs(
    b
  ).toFixed(2)}ln(x)`;

  return {
    x,
    y,
    xMedia,
    yMedia,
    nDatos,
    arrayLogx,
    arrayDy,
    arrayDlogX,
    arrayLogxPow2,
    arrayDyPow2,
    arrayDlogXy,
    totalLogx,
    totalDy,
    totalLogxPow2,
    totalDyPow2,
    totalDlogXy,
    sx,
    sy,
    sxy,
    r,
    b,
    a,
    ecuacionRegresion,
  };
}

export function calcularFuturaYLogaritmica(a, b, x) {
  const resultadoLogaritmico = a + b * Math.log(x);
  return resultadoLogaritmico.toFixed(2);
}

let arrayX = [];
let arrayY = [];
let arrayLogX = [];

function calcularLog(data) {
  const logData = data.map((value) => Math.log(value));
  return logData;
}
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
  const ecuacionRegresion = `${a.toFixed(2)} ${b < 0 ? "-" : "+"} ${Math.abs(
    b
  ).toFixed(2)}x`;

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


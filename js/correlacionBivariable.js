let arrayX = [];
let arrayY = [];
let arrayLogX = [];
let arrayDX = [];
let arrayDY = [];
let arrayDXpow2 = [];
let arrayDYpow2 = [];
let arrayDXDY = [];

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

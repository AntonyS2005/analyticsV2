document.getElementById("minimo").addEventListener("change", function () {
  document.getElementById("minimoValor").style.display = this.checked
    ? "inline"
    : "none";
});

document.getElementById("maximo").addEventListener("change", function () {
  document.getElementById("maximoValor").style.display = this.checked
    ? "inline"
    : "none";
});

function generarNormal(media, desviacion) {
  let u = Math.random();
  let v = Math.random();
  let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return num * desviacion + media;
}

function generarExcel() {
  const tamaño = parseInt(document.getElementById("tamaño").value);
  const media = parseFloat(document.getElementById("media").value);
  const desviacion = parseFloat(document.getElementById("desviacion").value);
  const negativos = document.getElementById("negativos").checked;
  const minimo = document.getElementById("minimo").checked;
  const maximo = document.getElementById("maximo").checked;
  const minimoValor = minimo
    ? parseFloat(document.getElementById("minimoValor").value)
    : -Infinity;
  const maximoValor = maximo
    ? parseFloat(document.getElementById("maximoValor").value)
    : Infinity;
  const cantidadDecimales = Math.max(
    0,
    parseInt(document.getElementById("cantidadDecimales").value)
  );

  const datos = [[""]]; // Primera fila vacía

  for (let i = 0; i < tamaño; i++) {
    let valor;
    for (let intento = 0; intento < 1000; intento++) {
      valor = generarNormal(media, desviacion);
      if (!negativos) valor = Math.abs(valor);

      if (cantidadDecimales === 0) {
        valor = Math.round(valor);
      } else {
        valor = parseFloat(valor.toFixed(cantidadDecimales));
      }

      if (valor >= minimoValor && valor <= maximoValor) {
        break;
      }
    }
    datos.push([valor]);
  }

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(datos);
  XLSX.utils.book_append_sheet(wb, ws, "Datos");
  XLSX.writeFile(wb, "datos.xlsx");
}

// Agregar la librería xlsx.js
const script = document.createElement("script");
script.src =
  "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
document.head.appendChild(script);

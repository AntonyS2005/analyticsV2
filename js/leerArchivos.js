const ExcelJS = require("exceljs");

// Función para verificar si un valor es un número
function esNumero(num) {
    return num !== null && !isNaN(parseFloat(num)) && isFinite(num);
}

// Función para leer y procesar datos de Excel
async function leerDatos(rutaArchivo, nombreHoja) {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(rutaArchivo);
    
    const hoja = workbook.getWorksheet(nombreHoja);
    if (!hoja) {
        console.log(`No se encontró la hoja: ${nombreHoja}`);
        return [];
    }

    let datos = [];
    let terFila = false;
    let nFila = 0;
    const maxFilas = hoja.rowCount;
    const maxColumnas = hoja.columnCount;

    while (!terFila) {
        if (nFila >= maxFilas) break;
        let terColumna = false;
        let nColumnas = 0;

        while (!terColumna) {
            if (nColumnas >= maxColumnas) break;

            let celda = hoja.getRow(nFila + 1).getCell(nColumnas + 1).value;
            if (esNumero(celda)) {
                datos.push(parseFloat(celda));
            }

            let datoSiguiente = hoja.getRow(nFila + 1).getCell(nColumnas + 2).value;
            if (nColumnas + 1 >= maxColumnas || !esNumero(datoSiguiente)) {
                terColumna = true;
            }
            nColumnas++;
        }

        let datoSiguienteFila = hoja.getRow(nFila + 2).getCell(nColumnas + 1).value;
        if (nFila + 1 >= maxFilas || !esNumero(datoSiguienteFila)) {
            terFila = true;
        }
        nFila++;
    }

    datos.sort((a, b) => a - b);
    return datos;
}

// Llamada a la función
leerDatos("./js/ej.xlsx", "intervalos").then(datos => console.log("Datos ordenados:", datos));

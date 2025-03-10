const ExcelJS = require("exceljs");

// Función para verificar si un valor es un número
function esNumero(num) {
    return num !== null && !isNaN(parseFloat(num)) && isFinite(num);
}

// Función para leer y procesar la tabla desde un buffer
async function leerDatos(bufferArchivo, nombreHoja) {
    const workbook = new ExcelJS.Workbook();
    console.log("Cargando archivo desde buffer...");
    await workbook.xlsx.load(bufferArchivo);
    console.log("Archivo cargado correctamente");

    const hoja = workbook.getWorksheet(nombreHoja);
    if (!hoja) {
        console.log(`No se encontró la hoja: ${nombreHoja}`);
        return [];
    }

    let datos = [];
    let nFila = 0;
    let terFila = false;
    
    // Determinar el tamaño real de la tabla
    let maxFilas = hoja.rowCount;
    let maxColumnas = hoja.columnCount; 
    console.log(`Filas en la hoja: ${maxFilas}, Columnas: ${maxColumnas}`);

    while (!terFila) {
        if (nFila >= maxFilas) break;
        let fila = hoja.getRow(nFila + 1);
        let nColumnas = 0;
        let terColumna = false;

        while (!terColumna) {
            if (nColumnas >= maxColumnas) break;
            let celda = fila.getCell(nColumnas + 1).value;
            console.log(`Leyendo celda [${nFila + 1}, ${nColumnas + 1}] con valor: ${celda}`);

            if (esNumero(celda)) {
                datos.push(parseFloat(celda));
            }

            let siguienteCelda = fila.getCell(nColumnas + 2).value;
            if (!esNumero(siguienteCelda) || nColumnas + 1 >= maxColumnas) {
                terColumna = true;
            }
            
            nColumnas++;
        }

        let siguienteFila = hoja.getRow(nFila + 2);
        if (!esNumero(siguienteFila.getCell(1).value) || nFila + 1 >= maxFilas) {
            terFila = true;
        }

        nFila++;
    }

    console.log("Datos procesados antes de ordenar:", datos);
    datos.sort((a, b) => a - b);
    console.log("Datos ordenados:", datos);
    return datos;
}

module.exports = { leerDatos };
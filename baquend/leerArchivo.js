//funcion que lee el excel

const ExcelJS = require("exceljs");

// Función para verificar si un valor es un número
function esNumero(num) {
    return num !== null && !isNaN(parseFloat(num)) && isFinite(num);
}

// Función para leer y procesar la tabla de manera dinámica
export async function leerDatos(rutaArchivo, nombreHoja) {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(rutaArchivo);
    
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
    let maxColumnas = hoja.columnCount;  // ✅ CORREGIDO

    while (!terFila) {
        if (nFila >= maxFilas) break;
        let fila = hoja.getRow(nFila + 1); // ExcelJS usa 1-based index
        let nColumnas = 0;
        let terColumna = false;

        while (!terColumna) {
            if (nColumnas >= maxColumnas) break;
            let celda = fila.getCell(nColumnas + 1).value;

            if (esNumero(celda)) {
                datos.push(parseFloat(celda));
            }

            // Verificar si la siguiente celda en la misma fila ya no es un número
            let siguienteCelda = fila.getCell(nColumnas + 2).value;
            if (!esNumero(siguienteCelda) || nColumnas + 1 >= maxColumnas) {
                terColumna = true;
            }
            
            nColumnas++;
        }

        // Verificar si la primera celda de la siguiente fila no es un número para terminar
        let siguienteFila = hoja.getRow(nFila + 2);
        if (!esNumero(siguienteFila.getCell(1).value) || nFila + 1 >= maxFilas) {
            terFila = true;
        }

        nFila++;
    }

    datos.sort((a, b) => a - b); // Ordenar los datos en orden ascendente
    return datos;
}


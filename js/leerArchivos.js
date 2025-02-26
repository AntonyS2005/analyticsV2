const ExcelJS = require('exceljs');

function esNumero(num) {
    return !isNaN(parseFloat(num)) && isFinite(num);
}

async function leerDatos(ubi) {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(ubi);
    
    let datos = [];
    
    workbook.eachSheet((worksheet) => {
        worksheet.eachRow((row) => {
            row.eachCell((cell) => {
                if (esNumero(cell.value)) {
                    datos.push(parseFloat(cell.value));
                }
            });
        });
    });

    datos.sort((a, b) => a - b);
    return datos;
}

// Ejemplo de uso
leerDatos('archivo.xlsx').then(datos => console.log(datos)).catch(err => console.error(err));









//funcion que lee el excel

const ExcelJS = require("exceljs");

// Función para verificar si un valor es un número
function esNumero(num) {
    return num !== null && !isNaN(parseFloat(num)) && isFinite(num);
}

// Función para leer y procesar la tabla de manera dinámica
async function leerDatos(rutaArchivo, nombreHoja) {
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




//tabla por intervalos





// Función auxiliar para redondear a "decimales" dígitos
function round(value, decimals) {
    return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
  }
  
  // Función de condición: verifica si x está entre li y ls (inclusive)
  function condicion(x, li, ls) {
    return x >= li && x <= ls;
  }
  
  function generarTablaPorIntervalos(dato) {
    let min_val = Math.min(...dato);
    let max_val = Math.max(...dato);
    let n = dato.length;
    let rango = max_val - min_val;
  
    // Cálculo del número de intervalos
    let ni = 1 + 3.322 * Math.log10(n);
    ni = round(ni, 2);
    let i = Math.round(rango / ni); // Tamaño del intervalo
  
    // Declaración de arreglos para guardar los resultados
    let li = [];
    let ls = [];
    let xi = [];
    let frecuencia = [];
    let fr = [];
    let fa = [];
    let faPor = [];
    let fd = [];
    let fdPor = [];
    let fPorXi = [];
    let d = [];
  
    let faDato = 0;
    let fdVar = n;
  
    // Construcción de los límites inferiores (li) y superiores (ls) de cada intervalo
    let x = min_val;
    while (x < max_val) {
      li.push(x);
      ls.push(x + i - 1);
      x += i;
    }
  
    let canIntervalos = li.length;
  
    // Cálculos para cada intervalo
    for (let indice = 0; indice < canIntervalos; indice++) {
      let promedio = (li[indice] + ls[indice]) / 2;
      xi.push(promedio);
  
      // Filtramos los datos que cumplen la condición para el intervalo actual
      let freVar = dato.filter(x => condicion(x, li[indice], ls[indice])).length;
      frecuencia.push(freVar);
  
      let xFR = round((freVar * 100) / n, 2);
      fr.push(xFR);
  
      faDato += freVar;
      fa.push(faDato);
      faPor.push(round((faDato * 100) / n, 2));
  
      fd.push(fdVar);
      fdPor.push(round((fdVar * 100) / n, 2));
      fdVar -= freVar;
  
      fPorXi.push(round(freVar * promedio, 2));
    }
  
    // Cálculo de la media aritmética ponderada
    let sumFPorXi = fPorXi.reduce((acc, val) => acc + val, 0);
    let mediaArit = round(sumFPorXi / n, 2);
  
    // Declaración de arreglos para las desviaciones y potencias
    let fPorAbsD = [];
    let fPorDD = [];
    let fPorDDD = [];
    let fPorDDDD = [];
  
    let maxFre = 0;
    let indMaxFre = 0;
    let posicionMediana = n / 2;
    let mediana = 0;
    let serchMediana = true;
  
    // Cálculos de desviaciones, moda y mediana
    for (let indice = 0; indice < canIntervalos; indice++) {
      let dVar = round(xi[indice] - mediaArit, 2);
      d.push(dVar);
      fPorAbsD.push(round(frecuencia[indice] * Math.abs(dVar), 2));
      fPorDD.push(round(frecuencia[indice] * Math.pow(dVar, 2), 2));
      fPorDDD.push(round(frecuencia[indice] * Math.pow(dVar, 3), 2));
      fPorDDDD.push(round(frecuencia[indice] * Math.pow(dVar, 4), 2));
  
      // Moda: guardamos el índice del intervalo con mayor frecuencia
      if (frecuencia[indice] > maxFre) {
        indMaxFre = indice;
        maxFre = frecuencia[indice];
      }
  
      // Mediana: se busca el primer intervalo donde la frecuencia acumulada es mayor o igual a n/2
      if (serchMediana && posicionMediana <= fa[indice]) {
        let prevFa = (indice > 0 ? fa[indice - 1] : 0);
        mediana = round(li[indice] + ((posicionMediana - prevFa) / frecuencia[indice]) * i, 2);
        serchMediana = false;
      }
    }
  
    // Cálculo de la moda
    let delta1Moda = frecuencia[indMaxFre] - (indMaxFre > 0 ? frecuencia[indMaxFre - 1] : 0);
    let delta2Moda = frecuencia[indMaxFre] - (indMaxFre < frecuencia.length - 1 ? frecuencia[indMaxFre + 1] : 0);
    let moda = round(li[indMaxFre] + ((delta1Moda / (delta1Moda + delta2Moda)) * i), 2);
  
    // Cálculo de la desviación media y estándar
    let sumFPorAbsD = fPorAbsD.reduce((acc, val) => acc + val, 0);
    let desviacionMed = round(sumFPorAbsD / n, 2);
  
    let sumFPorDD = fPorDD.reduce((acc, val) => acc + val, 0);
    let desviacionEst = round(Math.sqrt(sumFPorDD / n), 2);
  
    // Cálculo de asimetría (sk) y curtosis (k)
    let sumFPorDDD = fPorDDD.reduce((acc, val) => acc + val, 0);
    let sk = round(sumFPorDDD / (n * Math.pow(desviacionEst, 3)), 2);
  
    let sumFPorDDDD = fPorDDDD.reduce((acc, val) => acc + val, 0);
    let k = round(sumFPorDDDD / (n * Math.pow(desviacionEst, 4)), 2);
  
    return {
      valor: xi,
      li: li,
      ls: ls,
      xi: xi,
      frecuencia: frecuencia,
      fr: fr,
      fa: fa,
      faPor: faPor,
      fd: fd,
      fdPor: fdPor,
      fPorXi: fPorXi,
      d: d,
      fPorAbsD: fPorAbsD,
      fPorDD: fPorDD,
      fPorDDD: fPorDDD,
      fPorDDDD: fPorDDDD,
      moda: moda,
      mediana: mediana,
      mediaArit: mediaArit,
      desviacionMed: desviacionMed,
      desviacionEst: desviacionEst,
      sk: sk,
      k: k
    };
  }
  

	


//tabla sencila






function listas(datos) {
    // Contar frecuencias (simulando Counter de Python)
    let frecuencias = {};
    for (let valor of datos) {
      frecuencias[valor] = (frecuencias[valor] || 0) + 1;
    }
    let n = datos.length;
    
    // Valores únicos ordenados
    let valores = Object.keys(frecuencias).map(Number).sort((a, b) => a - b);
  
    // Declaración de arreglos para almacenar resultados
    let frecuencia_abs = [];
    let frecuencia_rel = [];
    let frecuencia_acum = [];
    let frecuencia_acum_rel = [];
    let frecuencia_desc = [];
    let frecuencia_desc_rel = [];
    let frecuencia_abs_x = [];
    let deltas = [];
    let frecuencia_abs_delta = [];
    let frecuencia_abs_delta_abs = [];
    let frecuencia_abs_delta_cuadrado = [];
    let frecuencia_abs_delta_cubo = [];
    let frecuencia_abs_delta_cuarta = [];
  
    let fa_acum = 0;
    let fd_acum = n;
    // Media ponderada: suma(valor * frecuencia) / n
    let media = valores.reduce((acc, valor) => acc + valor * frecuencias[valor], 0) / n;
  
    // Cálculos por cada valor único
    for (let valor of valores) {
      let f = frecuencias[valor];
      let delta = valor - media;
      let abs_delta = Math.abs(delta);
      let delta_cuadrado = delta * delta;
      let delta_cubo = delta * delta * delta;
      let delta_cuarta = Math.pow(delta, 4);
  
      fa_acum += f;
      let fr = (f / n) * 100;
      let fr_acum_rel = (fa_acum / n) * 100;
      fd_acum -= f;
      let fd_rel = (fd_acum / n) * 100;
  
      frecuencia_abs.push(f);
      frecuencia_rel.push(fr);
      frecuencia_acum.push(fa_acum);
      frecuencia_acum_rel.push(fr_acum_rel);
      frecuencia_desc.push(fd_acum);
      frecuencia_desc_rel.push(fd_rel);
      frecuencia_abs_x.push(f * valor);
      deltas.push(delta);
      frecuencia_abs_delta.push(f * delta);
      frecuencia_abs_delta_abs.push(f * abs_delta);
      frecuencia_abs_delta_cuadrado.push(f * delta_cuadrado);
      frecuencia_abs_delta_cubo.push(f * delta_cubo);
      frecuencia_abs_delta_cuarta.push(f * delta_cuarta);
    }
  
    // Sumas totales de cada arreglo
    let total_f = frecuencia_abs.reduce((acc, val) => acc + val, 0);
    let total_f_rel = frecuencia_rel.reduce((acc, val) => acc + val, 0);
    let total_abs_delta = frecuencia_abs_delta_abs.reduce((acc, val) => acc + val, 0);
    let total_delta = frecuencia_abs_delta.reduce((acc, val) => acc + val, 0);
    let total_delta_cuadrado = frecuencia_abs_delta_cuadrado.reduce((acc, val) => acc + val, 0);
    let total_delta_cubo = frecuencia_abs_delta_cubo.reduce((acc, val) => acc + val, 0);
    let total_delta_cuarta = frecuencia_abs_delta_cuarta.reduce((acc, val) => acc + val, 0);
  
    // Cálculos usando datos completos
    let valor_minimo = Math.min(...datos);
    let valor_maximo = Math.max(...datos);
    let rango = valor_maximo - valor_minimo;
    // Recalcular media con todos los datos (debe coincidir)
    media = datos.reduce((acc, val) => acc + val, 0) / n;
    let mediana = calcularMediana(datos);
  
    // Moda: todos los valores que tengan la frecuencia máxima
    let maxCount = Math.max(...Object.values(frecuencias));
    let moda = [];
    for (let key in frecuencias) {
      if (frecuencias[key] === maxCount) {
        moda.push(Number(key));
      }
    }
  
    // Varianza (poblacional: ddof=0) y desviación estándar
    let varianza = total_delta_cuadrado / n;
    let desviacion_estandar = Math.sqrt(varianza);
  
    // Curtosis (exceso): (m4 / std^4) - 3
    let curtosis = (total_delta_cuarta / n) / Math.pow(desviacion_estandar, 4) - 3;
  
    // Asimetría (skewness). Para obtener el estimador insesgado se aplica un factor de corrección si n > 2
    let g1 = (total_delta_cubo / n) / Math.pow(desviacion_estandar, 3);
    let asimetria = g1;
    if (n > 2) {
      asimetria = Math.sqrt(n * (n - 1)) / (n - 2) * g1;
    }
  
    // Error típico (Standard Error of the Mean)
    let error_tipico = desviacion_estandar / Math.sqrt(n);
    let suma = datos.reduce((acc, val) => acc + val, 0);
    let cuenta = n;
  
    return {
      valores: valores,
      frecuencia_abs: frecuencia_abs,
      frecuencia_rel: frecuencia_rel,
      frecuencia_acum: frecuencia_acum,
      frecuencia_acum_rel: frecuencia_acum_rel,
      frecuencia_desc: frecuencia_desc,
      frecuencia_desc_rel: frecuencia_desc_rel,
      frecuencia_abs_x: frecuencia_abs_x,
      deltas: deltas,
      frecuencia_abs_delta: frecuencia_abs_delta,
      frecuencia_abs_delta_abs: frecuencia_abs_delta_abs,
      frecuencia_abs_delta_cuadrado: frecuencia_abs_delta_cuadrado,
      frecuencia_abs_delta_cubo: frecuencia_abs_delta_cubo,
      frecuencia_abs_delta_cuarta: frecuencia_abs_delta_cuarta,
      total_f: total_f,
      total_f_rel: total_f_rel,
      total_abs_delta: total_abs_delta,
      total_delta: total_delta,
      total_delta_cuadrado: total_delta_cuadrado,
      total_delta_cubo: total_delta_cubo,
      total_delta_cuarta: total_delta_cuarta,
      valor_minimo: valor_minimo,
      valor_maximo: valor_maximo,
      rango: rango,
      media: media,
      mediana: mediana,
      moda: moda,
      varianza: varianza,
      desviacion_estandar: desviacion_estandar,
      curtosis: curtosis,
      asimetria: asimetria,
      error_tipico: error_tipico,
      suma: suma,
      cuenta: cuenta
    };
  }
  
  // Función auxiliar para calcular la mediana de un arreglo numérico
  function calcularMediana(arr) {
    let sorted = arr.slice().sort((a, b) => a - b);
    let mid = Math.floor(sorted.length / 2);
    if (sorted.length % 2 === 0) {
      return (sorted[mid - 1] + sorted[mid]) / 2;
    } else {
      return sorted[mid];
    }
  }
  
  // Ejemplo de uso:
  let datos = [10, 20, 20, 30, 40, 50, 50, 50, 60, 70];
  console.log(listas(datos));
  
	
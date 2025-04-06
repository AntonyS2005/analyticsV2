let btnCalc = document.getElementById("btnCalc");
btnCalc.addEventListener("click", () => {
  procesarArchivo();
});

function esNumero(num) {
  return !isNaN(parseFloat(num)) && isFinite(num);
}

function leerDatos(archivo, nombreHoja, callback) {
  const reader = new FileReader();
  reader.onload = function (event) {
    const data = new Uint8Array(event.target.result);
    const workbook = XLSX.read(data, { type: "array" });
    const sheet = workbook.Sheets[nombreHoja];

    if (!sheet) {
      alert("La hoja especificada no existe.");
      return;
    }

    const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    let datos = [];

    for (let fila of jsonData) {
      for (let celda of fila) {
        if (esNumero(celda)) {
          datos.push(parseFloat(celda));
        }
      }
    }

    datos.sort((a, b) => a - b);
    callback(datos);
  };
  reader.readAsArrayBuffer(archivo);
}

async function procesarArchivo() {
  const archivoInput = document.getElementById("archivoExcel");
  const archivo = archivoInput.files[0];
  const hoja = document.getElementById("txtSheet").value;

  if (archivo) {
    try {
      leerDatos(archivo, hoja, (datos) => {
        console.log("Datos leídos:", datos); // Acceder al array de datos
        llamarAnalisis(datos); // Pasar el array a llamarAnalisis
      });
    } catch (error) {
      console.error("Error al procesar el archivo:", error);
    }
  } else {
    console.error("No se seleccionó un archivo.");
  }
}

function llamarAnalisis(datos) {
  const contenedor = document.getElementById("divTabla");
  contenedor.innerHTML = "";
  const tablaDatos = document.getElementById("divDatos");
  tablaDatos.innerHTML = "";
  let opcion = document.getElementById("tipo");
  let valor = opcion.value;
  switch (valor) {
    case "int":
      generarTablaPorIntervalos(datos);
      break;
    case "sen":
      generarTablaSimple(datos);
      break;
    default:
      break;
  }
}

// Función auxiliar para redondear a "decimales" dígitos
function round(value, decimals) {
  return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

// Función de condición: verifica si x está entre li y ls (inclusive)
function condicion(x, li, ls) {
  return x >= li && x <= ls;
}

function generarTablaPorIntervalos(dato) {
  let min_val = dato[0];
  let max_val = dato[dato.length - 1];
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
    let freVar = dato.filter((x) =>
      condicion(x, li[indice], ls[indice])
    ).length;
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
      let prevFa = indice > 0 ? fa[indice - 1] : 0;
      mediana = round(
        li[indice] + ((posicionMediana - prevFa) / frecuencia[indice]) * i,
        2
      );
      serchMediana = false;
    }
  }

  // Cálculo de la moda
  let delta1Moda =
    frecuencia[indMaxFre] - (indMaxFre > 0 ? frecuencia[indMaxFre - 1] : 0);
  let delta2Moda =
    frecuencia[indMaxFre] -
    (indMaxFre < frecuencia.length - 1 ? frecuencia[indMaxFre + 1] : 0);
  let moda = round(
    li[indMaxFre] + (delta1Moda / (delta1Moda + delta2Moda)) * i,
    2
  );

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

  // --- Creación y agregado de la tabla de intervalos ---
  const contenedor = document.getElementById("divTabla");
  const tabla = document.createElement("table");
  tabla.setAttribute("border", "1"); // Agregar borde a la tabla
  const encabezado = document.createElement("tr");
  const cabeceras = [
    "LI",
    "LS",
    "XI",
    "F",
    "Fr%",
    "Fa",
    "Fa%",
    "fd",
    "fd%",
    "F*Xi",
    "d",
    "f*|d|",
    "F*D^2",
    "F*D^3",
    "F*D^4",
  ];
  cabeceras.forEach((titulo) => {
    let th = document.createElement("th");
    th.textContent = titulo;
    encabezado.appendChild(th);
  });
  tabla.appendChild(encabezado);

  // Usar un bucle para crear las filas y columnas
  for (let i = 0; i < li.length; i++) {
    const fila = document.createElement("tr");

    let celda = document.createElement("td");
    celda.textContent = li[i];
    fila.appendChild(celda);

    celda = document.createElement("td");
    celda.textContent = ls[i];
    fila.appendChild(celda);

    celda = document.createElement("td");
    celda.textContent = xi[i];
    fila.appendChild(celda);

    celda = document.createElement("td");
    celda.textContent = frecuencia[i];
    fila.appendChild(celda);

    celda = document.createElement("td");
    celda.textContent = fr[i];
    fila.appendChild(celda);

    celda = document.createElement("td");
    celda.textContent = fa[i];
    fila.appendChild(celda);

    celda = document.createElement("td");
    celda.textContent = faPor[i];
    fila.appendChild(celda);

    celda = document.createElement("td");
    celda.textContent = fd[i];
    fila.appendChild(celda);

    celda = document.createElement("td");
    celda.textContent = fdPor[i];
    fila.appendChild(celda);

    celda = document.createElement("td");
    celda.textContent = fPorXi[i];
    fila.appendChild(celda);

    celda = document.createElement("td");
    celda.textContent = d[i];
    fila.appendChild(celda);

    celda = document.createElement("td");
    celda.textContent = fPorAbsD[i];
    fila.appendChild(celda);

    celda = document.createElement("td");
    celda.textContent = fPorDD[i];
    fila.appendChild(celda);

    celda = document.createElement("td");
    celda.textContent = fPorDDD[i];
    fila.appendChild(celda);

    celda = document.createElement("td");
    celda.textContent = fPorDDDD[i];
    fila.appendChild(celda);

    tabla.appendChild(fila);
  }

  contenedor.appendChild(tabla);

  let divDatos = document.getElementById("divDatos");
  const encabezadosDatos = [
    "Moda",
    "Mediana",
    "Media Aritmética",
    "Desviación Media",
    "Desviación Estándar",
    "Skewness (SK)",
    "Kurtosis (K)",
  ];
  const datosResumen = [
    moda,
    mediana,
    mediaArit,
    desviacionMed,
    desviacionEst,
    sk,
    k,
  ];

  let tabla2 = document.createElement("table");
  const encabezadoFila = tabla2.insertRow();
  encabezadosDatos.forEach((encabezado) => {
    const th = document.createElement("th");
    th.textContent = encabezado;
    encabezadoFila.appendChild(th);
  });
  const datosFila = tabla2.insertRow();
  datosResumen.forEach((dato) => {
    const td = document.createElement("td");
    td.textContent = dato;
    datosFila.appendChild(td);
  });
  tabla2.setAttribute("border", "1");
  const tablaDatos = document.getElementById("divDatos");
  tablaDatos.appendChild(tabla2);

  // --- Cálculo de medidas de posición: Cuartiles, Deciles y Percentiles ---
  // Se calculan de acuerdo a la lógica del código Python
  let cuartiles = [];
  let deciles = [];
  let percentiles = [];

  // Cálculo de cuartiles
  for (let j = 0; j < 4; j++) {
    let posMedPos = n * ((j + 1) / 4);
    for (let y = 0; y < canIntervalos; y++) {
      if (posMedPos <= fa[y]) {
        let prevFa = y > 0 ? fa[y - 1] : 0;
        let cuartil = li[y] + ((posMedPos - prevFa) / frecuencia[y]) * i;
        cuartil = round(cuartil, 2);
        cuartiles.push(cuartil);
        break;
      }
    }
  }

  // Cálculo de deciles
  for (let j = 0; j < 10; j++) {
    let posMedPos = n * ((j + 1) / 10);
    for (let y = 0; y < canIntervalos; y++) {
      if (posMedPos <= fa[y]) {
        let prevFa = y > 0 ? fa[y - 1] : 0;
        let decil = li[y] + ((posMedPos - prevFa) / frecuencia[y]) * i;
        decil = round(decil, 2);
        deciles.push(decil);
        break;
      }
    }
  }

  // Cálculo de percentiles
  for (let j = 0; j < 100; j++) {
    let posMedPos = n * ((j + 1) / 100);
    for (let y = 0; y < canIntervalos; y++) {
      if (posMedPos <= fa[y]) {
        let prevFa = y > 0 ? fa[y - 1] : 0;
        let percentil = li[y] + ((posMedPos - prevFa) / frecuencia[y]) * i;
        percentil = round(percentil, 2);
        percentiles.push(percentil);
        break;
      }
    }
  }

  // Asignar las medidas de posición a variables globales para su uso posterior
  window.cuartiles = cuartiles;
  window.deciles = deciles;
  window.percentiles = percentiles;
}

// Se asume que la función leerDatos está definida en otro lado, por ejemplo al cargar datos desde un archivo.
// Ejemplo de llamada:
// generarTablaPorIntervalos(leerDatos("prueba.xlsx"));

// --- Listener para el botón que consulta la medida de posición ---
document
  .getElementById("btnCalcularMedida")
  .addEventListener("click", function () {
    const tipo = document.getElementById("tipoMedida").value; // 'cuartil', 'decil' o 'percentil'
    let indiceIngresado = parseInt(
      document.getElementById("indiceMedida").value,
      10
    );
    if (isNaN(indiceIngresado) || indiceIngresado < 1) {
      document.getElementById("resultadoMedida").textContent =
        "Por favor ingresa un número válido (mayor o igual a 1).";
      return;
    }
    const indice = indiceIngresado - 1;
    let medida = null;
    if (tipo === "cuartil") {
      if (window.cuartiles && window.cuartiles.length > indice) {
        medida = window.cuartiles[indice];
      }
    } else if (tipo === "decil") {
      if (window.deciles && window.deciles.length > indice) {
        medida = window.deciles[indice];
      }
    } else if (tipo === "percentil") {
      if (window.percentiles && window.percentiles.length > indice) {
        medida = window.percentiles[indice];
      }
    }
    if (medida !== null) {
      document.getElementById(
        "resultadoMedida"
      ).textContent = `La medida solicitada es: ${medida}`;
    } else {
      document.getElementById("resultadoMedida").textContent =
        "El número ingresado excede la cantidad de medidas disponibles para el tipo seleccionado.";
    }
  });

//tabla sencila
/***************************************************
 * Funciones auxiliares
 ***************************************************/

/**
 * Redondea un valor con la precisión especificada (decimales).
 */
function redondear(value, decimals) {
  return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

/**
 * Calcula la mediana de un arreglo numérico.
 */
function calcularMediana(arreglo) {
  let ordenado = arreglo.slice().sort((a, b) => a - b);
  let mitad = Math.floor(ordenado.length / 2);
  if (ordenado.length % 2 === 0) {
    return (ordenado[mitad - 1] + ordenado[mitad]) / 2;
  } else {
    return ordenado[mitad];
  }
}

/***************************************************
 * Análisis de datos simples (sin intervalos)
 ***************************************************/

/**
 * Analiza los datos, calculando frecuencias, media, mediana, moda,
 * asimetría, curtosis, etc. También calcula cuartiles, deciles y percentiles.
 * @param {number[]} datos - Arreglo con los datos numéricos.
 * @returns {object} - Objeto con todas las propiedades estadísticas calculadas.
 */
function analizarDatosSimples(datos) {
  // 1) Cálculo de frecuencias absolutas
  let conteo = {};
  for (let valor of datos) {
    conteo[valor] = (conteo[valor] || 0) + 1;
  }

  // 2) Valores únicos ordenados
  let valoresUnicos = Object.keys(conteo)
    .map(Number)
    .sort((a, b) => a - b);
  let n = datos.length; // total de datos

  // 3) Media (ponderada por frecuencia)
  let sumaTotal = datos.reduce((acc, val) => acc + val, 0);
  let media = sumaTotal / n;

  // Arreglos para las columnas de la tabla
  let fAbs = []; // Frecuencia absoluta
  let fRel = []; // Frecuencia relativa (%)
  let fAcum = []; // Frecuencia acumulada
  let fAcumRel = []; // Frecuencia acumulada (%)
  let fDesc = []; // Frecuencia descendente
  let fDescRel = []; // Frecuencia descendente (%)
  let fAbsPorX = []; // f * x
  let deltas = []; // (x - media)
  let fPorDelta = []; // f * (x - media)
  let fPorAbsDelta = []; // f * |x - media|
  let fPorDelta2 = []; // f * (x - media)^2
  let fPorDelta3 = []; // f * (x - media)^3
  let fPorDelta4 = []; // f * (x - media)^4

  // Variables auxiliares para acumular
  let faAcum = 0; // Frecuencia acumulada
  let fdAcum = n; // Frecuencia descendente acumulada

  // 4) Llenar las columnas para cada valor único
  for (let valor of valoresUnicos) {
    let f = conteo[valor];
    faAcum += f;

    let fr = (f / n) * 100; // Frecuencia relativa en %
    let frAcum = (faAcum / n) * 100; // Frecuencia acumulada en %

    let fdRel = (fdAcum / n) * 100; // Frecuencia descendente en %

    // Cálculo de deltas y potencias
    let delta = valor - media;
    let absDelta = Math.abs(delta);

    fAbs.push(f);
    fRel.push(fr);
    fAcum.push(faAcum);
    fAcumRel.push(frAcum);
    fDesc.push(fdAcum);
    fDescRel.push(fdRel);
    fAbsPorX.push(f * valor);

    deltas.push(delta);
    fPorDelta.push(f * delta);
    fPorAbsDelta.push(f * absDelta);
    fPorDelta2.push(f * delta * delta);
    fPorDelta3.push(f * delta * delta * delta);
    fPorDelta4.push(f * Math.pow(delta, 4));
    fdAcum -= f;
  }

  // 5) Sumas totales de cada columna
  let total_f = fAbs.reduce((acc, val) => acc + val, 0);
  let total_fRel = fRel.reduce((acc, val) => acc + val, 0);
  let total_absDelta = fPorAbsDelta.reduce((acc, val) => acc + val, 0);
  let total_delta = fPorDelta.reduce((acc, val) => acc + val, 0);
  let total_delta2 = fPorDelta2.reduce((acc, val) => acc + val, 0);
  let total_delta3 = fPorDelta3.reduce((acc, val) => acc + val, 0);
  let total_delta4 = fPorDelta4.reduce((acc, val) => acc + val, 0);

  // 6) Mediana
  let mediana = calcularMediana(datos);

  // 7) Moda (puede haber más de una)
  let maxCount = Math.max(...Object.values(conteo));
  let moda = [];
  for (let key in conteo) {
    if (conteo[key] === maxCount) {
      moda.push(Number(key));
    }
  }

  // 8) Varianza (poblacional) y desviación estándar
  let varianza = total_delta2 / n;
  let desviacionEstandar = Math.sqrt(varianza);

  // 9) Curtosis y asimetría (Skewness)
  //    Curtosis = (m4 / σ^4) - 3 (exceso de curtosis)
  let curtosis = total_delta4 / n / Math.pow(desviacionEstandar, 4) - 3;

  // Asimetría (Fisher) - si queremos un estimador insesgado, aplicamos factor
  let g1 = total_delta3 / n / Math.pow(desviacionEstandar, 3);
  let asimetria = g1;
  if (n > 2) {
    asimetria = (Math.sqrt(n * (n - 1)) / (n - 2)) * g1;
  }

  // 10) Error típico (Standard Error of Mean)
  let errorTipico = desviacionEstandar / Math.sqrt(n);

  // 11) Cálculo de cuartiles, deciles y percentiles
  //    Para datos no agrupados, los calculamos ordenando el array y localizando la posición
  let datosOrdenados = datos.slice().sort((a, b) => a - b);

  function obtenerValorPorPorcentaje(porcentaje) {
    // posición en el array (método lineal):
    let posicion = (porcentaje / 100) * (datosOrdenados.length - 1);
    let piso = Math.floor(posicion);
    let techo = Math.ceil(posicion);
    if (piso === techo) {
      return datosOrdenados[piso];
    } else {
      // interpolación lineal
      let dif = posicion - piso;
      return (
        datosOrdenados[piso] +
        dif * (datosOrdenados[techo] - datosOrdenados[piso])
      );
    }
  }

  // Cuartiles
  let cuartiles = [];
  for (let j = 1; j <= 4; j++) {
    let p = j * 25; // 25%, 50%, 75%, 100%
    cuartiles.push(redondear(obtenerValorPorPorcentaje(p), 2));
  }

  // Deciles
  let deciles = [];
  for (let j = 1; j <= 10; j++) {
    let p = j * 10; // 10%, 20%, ... 100%
    deciles.push(redondear(obtenerValorPorPorcentaje(p), 2));
  }

  // Percentiles
  let percentiles = [];
  for (let j = 1; j <= 100; j++) {
    percentiles.push(redondear(obtenerValorPorPorcentaje(j), 2));
  }

  // 12) Retornamos un objeto con todos los resultados
  return {
    // Datos base
    valoresUnicos,
    fAbs,
    fRel,
    fAcum,
    fAcumRel,
    fDesc,
    fDescRel,
    fAbsPorX,
    deltas,
    fPorDelta,
    fPorAbsDelta,
    fPorDelta2,
    fPorDelta3,
    fPorDelta4,

    // Sumas
    total_f,
    total_fRel,
    total_absDelta,
    total_delta,
    total_delta2,
    total_delta3,
    total_delta4,

    // Medidas principales
    n,
    sumaTotal,
    media,
    mediana,
    moda,
    varianza,
    desviacionEstandar,
    curtosis,
    asimetria,
    errorTipico,

    // Medidas de posición
    cuartiles,
    deciles,
    percentiles,
  };
}

/***************************************************
 * Creación de tablas en el DOM
 ***************************************************/

function generarTablaSimple(datos) {
  const resultado = analizarDatosSimples(datos);

  // Guardamos los valores en variables globales para el otro botón
  window.cuartiles = resultado.cuartiles;
  window.deciles = resultado.deciles;
  window.percentiles = resultado.percentiles;

  // Referencia al contenedor y limpieza
  let contenedor = document.getElementById("divTabla");
  contenedor.innerHTML = "";

  // Crear la tabla principal de frecuencias
  const tabla = document.createElement("table");
  tabla.border = "1";

  // Encabezados de columna
  const encabezados = [
    "x",
    "f",
    "fr%",
    "Fa",
    "Fa%",
    "Fd",
    "Fd%",
    "f*x",
    "d",
    "f*d",
    "f*|d|",
    "f*d^2",
    "f*d^3",
    "f*d^4",
  ];
  const filaEncabezado = document.createElement("tr");
  encabezados.forEach((enc) => {
    let th = document.createElement("th");
    th.textContent = enc;
    filaEncabezado.appendChild(th);
  });
  tabla.appendChild(filaEncabezado);

  // Filas de la tabla principal
  for (let i = 0; i < resultado.valoresUnicos.length; i++) {
    const fila = document.createElement("tr");
    const celdas = [
      resultado.valoresUnicos[i],
      resultado.fAbs[i],
      redondear(resultado.fRel[i], 2),
      resultado.fAcum[i],
      redondear(resultado.fAcumRel[i], 2),
      resultado.fDesc[i],
      redondear(resultado.fDescRel[i], 2),
      redondear(resultado.fAbsPorX[i], 2),
      redondear(resultado.deltas[i], 2),
      redondear(resultado.fPorDelta[i], 2),
      redondear(resultado.fPorAbsDelta[i], 2),
      redondear(resultado.fPorDelta2[i], 2),
      redondear(resultado.fPorDelta3[i], 2),
      redondear(resultado.fPorDelta4[i], 2),
    ];
    celdas.forEach((celdaVal) => {
      let td = document.createElement("td");
      td.textContent = celdaVal;
      fila.appendChild(td);
    });
    tabla.appendChild(fila);
  }

  // Agregar la tabla al contenedor
  contenedor.appendChild(tabla);

  contenedor = document.getElementById("divDatos");
  // 4) Tabla de medidas de resumen (media, mediana, moda, etc.)
  const tablaResumen = document.createElement("table");
  tablaResumen.border = "1";
  const filaEncResumen = tablaResumen.insertRow();
  const filaDatosResumen = tablaResumen.insertRow();

  // Encabezados y valores
  const encabezadosResumen = [
    "n",
    "Mínimo",
    "Máximo",
    "Media",
    "Mediana",
    "Moda",
    "Varianza",
    "Desv.Est.",
    "Asimetría",
    "Curtosis",
    "Error Típico",
  ];
  // Calculamos mínimo y máximo de los datos
  const min = Math.min(...datos);
  const max = Math.max(...datos);

  // La moda la mostramos como string (puede ser más de una)
  const modaStr = resultado.moda.join(", ");

  const valoresResumen = [
    resultado.n,
    min,
    max,
    redondear(resultado.media, 2),
    redondear(resultado.mediana, 2),
    modaStr,
    redondear(resultado.varianza, 2),
    redondear(resultado.desviacionEstandar, 2),
    redondear(resultado.asimetria, 2),
    redondear(resultado.curtosis, 2),
    redondear(resultado.errorTipico, 2),
  ];

  // Crear celdas
  for (let enc of encabezadosResumen) {
    let th = document.createElement("th");
    th.textContent = enc;
    filaEncResumen.appendChild(th);
  }
  for (let val of valoresResumen) {
    let td = document.createElement("td");
    td.textContent = val;
    filaDatosResumen.appendChild(td);
  }

  contenedor.appendChild(document.createElement("br")); // separador
  contenedor.appendChild(tablaResumen);
}

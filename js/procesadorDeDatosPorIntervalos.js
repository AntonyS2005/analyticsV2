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
  
  // Ejemplo de uso:
  let dato = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
  console.log(generarTablaPorIntervalos(dato));
  
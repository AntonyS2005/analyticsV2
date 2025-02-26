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

let tamanoX = 600, tamanoy = 400, colorResultados = '#0ed700', colorNoResultados = '#076800';

function factorial(n) {
    if (n === 0 || n === 1) {
        return 1;
    }
    let result = 1;
    for (let i = 2; i <= n; i++) {
        result *= i;
    }
    return result;
}

function combSinRep(n, r) {
    return factorial(n) / (factorial(r) * factorial(n - r));
}

function distriBinomial(num_exitos, ensayos, prob_exito, acumulado) {
    const combinat = combSinRep(ensayos, num_exitos);
    const pk = Math.pow(prob_exito, num_exitos);
    const qN_K = Math.pow(1 - prob_exito, ensayos - num_exitos);
    let resul = pk * combinat * qN_K;
    num_exitos = num_exitos - 1;
    if (acumulado && num_exitos >= 0) {
        return resul + distriBinomial(num_exitos, ensayos, prob_exito, acumulado);
    } else {
        return resul;
    }
}

function distriPoison(x, media, acumulado) {
    const uK = Math.pow(media, x);
    const expMenU = Math.pow(Math.E, -media);
    const factK = factorial(x);
    let resul = (uK * expMenU) / factK;
    x -= 1;
    if (acumulado && x >= 0) {
        return resul + distriPoison(x, media, acumulado);
    } else {
        return resul;
    }
}

function distriNormal(x, mu, sigma, acumulado) {
    if (sigma <= 0) {
        throw new Error("La desviación estándar debe ser mayor que cero.");
    }
    
    const densidad = (1 / (sigma * Math.sqrt(2 * Math.PI))) * Math.exp(-((x - mu) ** 2) / (2 * sigma ** 2));
    
    if (acumulado) {
        const z = (x - mu) / (sigma * Math.sqrt(2));
        const cdf = 0.5 * (1 + erf(z));
        return cdf;
    } else {
        return densidad;
    }
}

function distriNormalInv(probabilidad, media, desviacion) {
    return jStat.normal.inv(probabilidad, media, desviacion);
}

function erf(x) {
    const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741;
    const a4 = -1.453152027, a5 = 1.061405429;
    const p = 0.3275911;
    const sign = x < 0 ? -1 : 1;
    x = Math.abs(x);
    const t = 1.0 / (1.0 + p * x);
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
    return sign * y;
}

document.getElementById('distribucion').addEventListener('change', function() {
    const distribucion = this.value;
    document.getElementById('binomial-params').style.display = distribucion === 'binomial' ? 'block' : 'none';
    document.getElementById('poisson-params').style.display = distribucion === 'poisson' ? 'block' : 'none';
    document.getElementById('normal-params').style.display = distribucion === 'normal' ? 'block' : 'none';
});

function graficar() {
    const distribucion = document.getElementById('distribucion').value;
    let xValues, yValues, resultadoFinal, resultadoIndice;

    if (distribucion === 'binomial') {
        const ensayos = parseInt(document.getElementById('ensayos').value);
        const exito = parseFloat(document.getElementById('exito').value);
        const exitos = parseInt(document.getElementById('exitos').value);
        const acumulado = document.getElementById('acumulado-binomial').checked;

        xValues = Array.from({ length: ensayos + 1 }, (_, i) => i);
        yValues = xValues.map(k => distriBinomial(k, ensayos, exito, acumulado));

        resultadoFinal = distriBinomial(exitos, ensayos, exito, acumulado);
        resultadoIndice = exitos;
    } else if (distribucion === 'poisson') {
        const media = parseFloat(document.getElementById('media').value);
        const x = parseInt(document.getElementById('x').value);
        const acumulado = document.getElementById('acumulado-poisson').checked;

        xValues = Array.from({ length: 20 }, (_, i) => i);
        yValues = xValues.map(k => distriPoison(k, media, acumulado));

        resultadoFinal = distriPoison(x, media, acumulado);
        resultadoIndice = x;
    } else if (distribucion === 'normal') {
        const mu = parseFloat(document.getElementById('media-normal').value);
        const sigma = parseFloat(document.getElementById('desviacion').value);
        const x = parseFloat(document.getElementById('x-normal').value);
        const acumulado = document.getElementById('acumulado-normal').checked;

        const numPuntos = 100;
        xValues = Array.from({ length: numPuntos }, (_, i) => mu - 3 * sigma + (i * (6 * sigma) / (numPuntos - 1)));
        yValues = xValues.map(k => distriNormal(k, mu, sigma, acumulado));

        resultadoFinal = distriNormal(x, mu, sigma, acumulado);
        resultadoIndice = x;

        // Convertir la curva normal en barras para simular el comportamiento de binomial y poisson
        const anchoBarra = xValues[1] - xValues[0];
        const xBarra = xValues.map(valor => valor - anchoBarra / 2);

        const trace = {
            x: xBarra,
            y: yValues,
            type: 'bar',
            marker: {
                color: xBarra.map(x => (x + anchoBarra/2 >= resultadoIndice - anchoBarra/2 && x + anchoBarra/2 < resultadoIndice + anchoBarra/2 ? colorResultados : colorNoResultados)),
                line: {
                    width: 1,
                    color: 'black'
                }
            },
            width: anchoBarra
        };

        const layout = {
            title: `Distribución ${distribucion.charAt(0).toUpperCase() + distribucion.slice(1)}`,
            xaxis: { title: 'Valores' },
            yaxis: { title: 'Probabilidad/Densidad' },
            width: tamanoX,
            height: tamanoy
        };

        Plotly.newPlot('grafica', [trace], layout, { displayModeBar: false });
        let lblRespuesta = document.getElementById("lblRespuesta");
        lblRespuesta.innerHTML = "La respuesta es: " + resultadoFinal.toFixed(6);
        return;
    }

    let lblRespuesta = document.getElementById("lblRespuesta");
    lblRespuesta.innerHTML = "La respuesta es: " + resultadoFinal.toFixed(6);

    const trace = {
        x: xValues,
        y: yValues,
        type: 'bar',
        marker: {
            color: xValues.map(x => (x === resultadoIndice ? colorResultados : colorNoResultados)),
            line: {
                width: 1,
                color: 'black'
            }
        }
    };

    const layout = {
        title: `Distribución ${distribucion.charAt(0).toUpperCase() + distribucion.slice(1)}`,
        xaxis: { title: 'Valores' },
        yaxis: { title: 'Probabilidad' },
        width: tamanoX,
        height: tamanoy
    };

    Plotly.newPlot('grafica', [trace], layout, { displayModeBar: false });
}
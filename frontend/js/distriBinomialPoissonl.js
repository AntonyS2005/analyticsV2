let tamanoX = 400, tamanoy = 400,colorResultados ='#00bb2d',colorNoResultados = 'gray';

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
        let lblRespuesta = document.getElementById("lblRespuesta");
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
        let lblRespuesta = document.getElementById("lblRespuesta");
        return resul;
    }
}

document.getElementById('distribucion').addEventListener('change', function() {
    const distribucion = this.value;
    document.getElementById('binomial-params').style.display = distribucion === 'binomial' ? 'block' : 'none';
    document.getElementById('poisson-params').style.display = distribucion === 'poisson' ? 'block' : 'none';
});

function graficar() {
    const distribucion = document.getElementById('distribucion').value;
    let xValues, yValues;
    let resultadoFinal, resultadoIndice; // Variables para mostrar el resultado correcto

    if (distribucion === 'binomial') {
        const ensayos = parseInt(document.getElementById('ensayos').value);
        const exito = parseFloat(document.getElementById('exito').value);
        const exitos = parseInt(document.getElementById('exitos').value);
        const acumulado = document.getElementById('acumulado-binomial').checked;

        xValues = Array.from({ length: ensayos + 1 }, (_, i) => i);
        yValues = xValues.map(k => distriBinomial(k, ensayos, exito, acumulado));

        resultadoFinal = distriBinomial(exitos, ensayos, exito, acumulado); // Valor de la probabilidad
        resultadoIndice = exitos; // Índice del resultado a resaltar

    } else if (distribucion === 'poisson') {
        const media = parseFloat(document.getElementById('media').value);
        const x = parseInt(document.getElementById('x').value);
        const acumulado = document.getElementById('acumulado-poisson').checked;

        xValues = Array.from({ length: 20 }, (_, i) => i);
        yValues = xValues.map(k => distriPoison(k, media, acumulado));

        resultadoFinal = distriPoison(x, media, acumulado); // Valor de la probabilidad
        resultadoIndice = x; // Índice del resultado a resaltar
    }

    // Actualiza el <p> con la respuesta final después de calcular todo
    let lblRespuesta = document.getElementById("lblRespuesta");
    lblRespuesta.innerHTML = "La respuesta es: " + resultadoFinal.toFixed(6);

    // Configura la gráfica con colores que resalten el resultado
    const trace = {
        x: xValues,
        y: yValues,
        type: 'bar',
        marker: {
            color: xValues.map(x => (x === resultadoIndice ? colorResultados : colorNoResultados)), // Resalta la barra correspondiente
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
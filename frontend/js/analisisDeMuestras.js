async function getDatos() {
    const archivoInput = document.getElementById("archivoExcel");
    const archivo = archivoInput.files[0];
    const hoja = document.getElementById("txtSheet").value;

    if (!archivo) {
        console.error("No se seleccionó un archivo.");
        return null;
    }

    const formData = new FormData();
    formData.append("archivo", archivo);
    formData.append("nombre_hoja", hoja);

    try {
        const respuesta = await fetch("http://127.0.0.1:8000/procesar_excel/", {
            method: "POST",
            body: formData,
        });

        if (!respuesta.ok) {
            throw new Error(`HTTP error! status: ${respuesta.status}`);
        }

        const datos = await respuesta.json();
        return datos.datos;
    } catch (error) {
        console.error("Error al procesar el archivo:", error);
        return null;
    }
}

async function calcular() {
    const tipoAnalisis = document.getElementById("tipoAnalisis").value;
    const datos = await getDatos();

    if (!datos) return;

    if (tipoAnalisis === "proporcion") {
        const num = parseFloat(document.getElementById("txtNum").value);
        const [mayor, menor, mayorIgual, menorIgual, igual, total] = calcularProporcion(datos, num);

        document.getElementById("mayor").textContent = mayor;
        document.getElementById("menor").textContent = menor;
        document.getElementById("mayorIgual").textContent = mayorIgual;
        document.getElementById("menorIgual").textContent = menorIgual;
        document.getElementById("igual").textContent = igual;
        document.getElementById("total").textContent = total;

        document.getElementById("resultadosProporcion").style.display = "table";
        document.getElementById("resultadosMedia").style.display = "none";
    } else {
        const { media, desviacion } = calcularMediaDesviacion(datos);

        document.getElementById("media").textContent = media.toFixed(3);
        document.getElementById("desviacion").textContent = desviacion.toFixed(3);

        document.getElementById("resultadosMedia").style.display = "table";
        document.getElementById("resultadosProporcion").style.display = "none";
    }
}

function calcularProporcion(datos, num) {
    let mayor = 0, menor = 0, menorIgual = 0, mayorIgual = 0, igual = 0, total = datos.length;

    for (const dato of datos) {
        if (dato === num) {
            menorIgual++;
            mayorIgual++;
            igual++;
        } else if (dato < num) {
            menor++;
            menorIgual++;
        } else {
            mayor++;
            mayorIgual++;
        }
    }

    return [mayor, menor, mayorIgual, menorIgual, igual, total];
}

function calcularMediaDesviacion(datos) {
    const media = datos.reduce((a, b) => a + b, 0) / datos.length;
    const varianza = datos.reduce((a, b) => a + Math.pow(b - media, 2), 0) / datos.length;
    const desviacion = Math.sqrt(varianza);

    return { media, desviacion };
}

document.getElementById("tipoAnalisis").addEventListener("change", function () {
    const tipoAnalisis = this.value;
    document.getElementById("proporcionInputs").style.display = tipoAnalisis === "proporcion" ? "block" : "none";
});

document.getElementById("archivoExcel").addEventListener("change", () => {
    resetearResultados();
});

document.getElementById("tipoAnalisis").addEventListener("change", () => {
    resetearResultados();
});

function resetearResultados() {
    document.getElementById("resultadosProporcion").style.display = "none";
    document.getElementById("resultadosMedia").style.display = "none";
}
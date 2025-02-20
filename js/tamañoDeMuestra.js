document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("formMuestra");
    const tipoDeMuestra = document.getElementById("tipoDeMuestra");
    const camposMuestra = document.getElementById("camposMuestra");
    const divRespuesta = document.getElementById("divRespuesta");

    const inputsConfig = {
        proSinPo: ["varNC", "Nivel de confianza", "varP", "Probabilidad de éxito", "varD", "Precisión"],
        proConPo: ["varNC", "Nivel de confianza", "varN", "Tamaño de población", "varP", "Probabilidad de éxito", "varD", "Precisión"],
        medSinPo: ["varNC", "Nivel de confianza", "varS", "Desviación estándar", "varD", "Precisión"],
        medConPo: ["varNC", "Nivel de confianza", "varN", "Tamaño de población", "varS", "Desviación estándar", "varD", "Precisión"]
    };

    function crearInput(id, labelText) {
        let label = document.createElement("label");
        label.textContent = labelText;
        label.setAttribute("for", id);

        let input = document.createElement("input");
        input.type = "text";
        input.id = id;
        input.required = true;

        let div = document.createElement("div");
        div.appendChild(label);
        div.appendChild(document.createElement("br"));
        div.appendChild(input);
        div.appendChild(document.createElement("br"));

        return div;
    }

    function crearRespuesta(texto) {
        let p = document.createElement("p");
        p.textContent = texto;
        return p;
    }

    tipoDeMuestra.addEventListener("change", function () {
        let opcion = this.value;
        camposMuestra.innerHTML = "";

        if (inputsConfig[opcion]) {
            for (let i = 0; i < inputsConfig[opcion].length; i += 2) {
                let inputDiv = crearInput(inputsConfig[opcion][i], inputsConfig[opcion][i + 1]);
                camposMuestra.appendChild(inputDiv);
            }
        }
    });

    form.addEventListener("submit", function (event) {
        event.preventDefault();

        let opcion = tipoDeMuestra.value;
        let nc = parseFloat(document.getElementById("varNC")?.value) || 0;
        let n = parseFloat(document.getElementById("varN")?.value) || 0;
        let p = parseFloat(document.getElementById("varP")?.value) || 0;
        let d = parseFloat(document.getElementById("varD")?.value) || 0;
        let s = parseFloat(document.getElementById("varS")?.value) || 0;

        let resultado = calcEstProConN(nc, n, p, d, s, opcion);

        if (resultado) {
            divRespuesta.innerHTML = "";
            Object.entries(resultado).forEach(([key, value]) => {
                divRespuesta.appendChild(crearRespuesta(`${key}: ${value}`));
            });
        }
    });

    function calcEstProConN(nc, n, p, d, s, opcion) {
        let ns, za, q, result;
        switch (opcion) {
            case "proConPo":
                if (nc <= 0 || p <= 0 || d <= 0 || n <= 0) return null;
                ns = 100 - nc;
                za = calZa(nc, ns);
                q = 100 - p;
                result = (n * Math.pow(za, 2) * p * q) / (Math.pow(d, 2) * (n - 1) + Math.pow(za, 2) * p * q);
                return { ns, za, q, result: Math.ceil(result) };
            case "proSinPo":
                if (nc <= 0 || p <= 0 || d <= 0) return null;
                ns = 100 - nc;
                za = calZa(nc, ns);
                q = 100 - p;
                result = (Math.pow(za, 2) * p * q) / Math.pow(d, 2);
                return { ns, za, q, result: Math.ceil(result) };
            case "medSinPo":
                if (nc <= 0 || s <= 0 || d <= 0) return null;
                ns = 100 - nc;
                za = calZa(nc, ns);
                result = (Math.pow(za, 2) * Math.pow(s, 2)) / Math.pow(d, 2);
                return { ns, za, result: Math.ceil(result) };
            case "medConPo":
                if (nc <= 0 || s <= 0 || d <= 0 || n <= 0) return null;
                ns = 100 - nc;
                za = calZa(nc, ns);
                result = (n * Math.pow(za, 2) * Math.pow(s, 2)) / (Math.pow(d, 2) * (n - 1) + Math.pow(za, 2) * Math.pow(s, 2));
                return { ns, za, result: Math.ceil(result) };
            default:
                throw new Error("Seleccione una opción válida");
        }
    }
});

function calZa(nc, ns) {
    return invNormEstand((nc + ns / 2) / 100).toFixed(3);
}

function invNormEstand(x) {
    if (x <= 0 || x >= 1) throw new Error("x debe estar entre 0 y 1");
    return Math.sqrt(2) * erfinv(2 * x - 1);
}

function erfinv(y) {
    let a = 0.147;
    let ln1y2 = Math.log(1 - y * y);
    let part1 = (2 / (Math.PI * a)) + (ln1y2 / 2);
    let part2 = ln1y2 / a;
    return Math.sign(y) * Math.sqrt(Math.sqrt(part1 * part1 - part2) - part1);
}
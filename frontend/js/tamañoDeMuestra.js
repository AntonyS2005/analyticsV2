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
        divRespuesta.innerHTML = "";
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

function invNormEstand(p) {
    if (p <= 0 || p >= 1) {
      throw new Error("p debe estar en el intervalo (0,1)");
    }
  
    // Coeficientes para las aproximaciones racionales
    const a1 = -39.6968302866538,
          a2 = 220.946098424521,
          a3 = -275.928510446969,
          a4 = 138.357751867269,
          a5 = -30.6647980661472,
          a6 = 2.50662827745924;
  
    const b1 = -54.4760987982241,
          b2 = 161.585836858041,
          b3 = -155.698979859887,
          b4 = 66.8013118877197,
          b5 = -13.2806815528857;
  
    const c1 = -0.00778489400243029,
          c2 = -0.322396458041136,
          c3 = -2.40075827716184,
          c4 = -2.54973253934373,
          c5 = 4.37466414146497,
          c6 = 2.93816398269878;
  
    const d1 = 0.00778469570904146,
          d2 = 0.32246712907004,
          d3 = 2.445134137143,
          d4 = 3.75440866190742;
  
    // Puntos de quiebre
    const plow = 0.02425,
          phigh = 1 - plow;
    
    let q, r, result;
    
    if (p < plow) {
      // Aproximación para la cola inferior
      q = Math.sqrt(-2 * Math.log(p));
      result = (((((c1 * q + c2) * q + c3) * q + c4) * q + c5) * q + c6) /
               ((((d1 * q + d2) * q + d3) * q + d4) * q + 1);
    } else if (p <= phigh) {
      // Aproximación para la región central
      q = p - 0.5;
      r = q * q;
      result = (((((a1 * r + a2) * r + a3) * r + a4) * r + a5) * r + a6) * q /
               (((((b1 * r + b2) * r + b3) * r + b4) * r + b5) * r + 1);
    } else {
      // Aproximación para la cola superior
      q = Math.sqrt(-2 * Math.log(1 - p));
      result = -(((((c1 * q + c2) * q + c3) * q + c4) * q + c5) * q + c6) /
                ((((d1 * q + d2) * q + d3) * q + d4) * q + 1);
    }
    
    return result;
  }
  
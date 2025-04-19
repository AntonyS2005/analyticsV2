import {
  calcularConVarianzasConocidas,
  calcularSinVarianzasConocidas,
  pruebaProporcion,
  pruebaDiferenciaProporciones,
} from "./difMedia.js";

const select = document.getElementById("tipoPrueba");
const inputsContainer = document.getElementById("inputs");
const respuestasContainer = document.getElementById("respuestas");

const configs = {
  conVarianzas: [
    { id: "tamanoMuestra1", placeholder: "Tamaño de la muestra 1" },
    { id: "tamanoMuestra2", placeholder: "Tamaño de la muestra 2" },
    { id: "mediaMuestra1", placeholder: "Media muestral 1" },
    { id: "mediaMuestra2", placeholder: "Media muestral 2" },
    { id: "desviacionEstandar1", placeholder: "Desviación muestral 1" },
    { id: "desviacionEstandar2", placeholder: "Desviación muestral 2" },
    { id: "nivelConfianza", placeholder: "Nivel de confianza (%)" },
  ],
  sinVarianzas: [
    { id: "tamanoMuestra1", placeholder: "Tamaño de la muestra 1" },
    { id: "tamanoMuestra2", placeholder: "Tamaño de la muestra 2" },
    { id: "mediaMuestra1", placeholder: "Media muestral 1" },
    { id: "mediaMuestra2", placeholder: "Media muestral 2" },
    {
      id: "cuasiDesviacionEstandar1",
      placeholder: "Cuasi-desviación muestral 1",
    },
    {
      id: "cuasiDesviacionEstandar2",
      placeholder: "Cuasi-desviación muestral 2",
    },
    { id: "nivelConfianza", placeholder: "Nivel de confianza (%)" },
  ],
  proporcion: [
    { id: "proPobHip", placeholder: "Proporción poblacional hipotética p" },
    { id: "tamanoMuestra", placeholder: "Tamaño de la muestra" },
    { id: "numeroExitos", placeholder: "Número de éxitos" },
    { id: "nivelConfianza", placeholder: "Nivel de confianza (%)" },
  ],
  diferenciaProporciones: [
    { id: "tamanoMuestra1", placeholder: "Tamaño de la muestra 1" },
    { id: "tamanoMuestra2", placeholder: "Tamaño de la muestra 2" },
    { id: "numeroExitos1", placeholder: "Número de éxitos 1" },
    { id: "numeroExitos2", placeholder: "Número de éxitos 2" },
    { id: "nivelConfianza", placeholder: "Nivel de confianza (%)" },
  ],
};

const labelMap = {
  z: "Valor Z crítico",
  t: "Valor t crítico",
  limiteInferior: "Límite inferior",
  limiteSuperior: "Límite superior",
  estadisticoZ: "Estadístico Z",
  estadisticoT: "Estadístico t",
  zC: "Z calculado",
  estadistico: "Estadístico prueba",
};

const createInput = ({ id, placeholder }) => {
  const input = document.createElement("input");
  input.type = "number";
  input.id = id;
  input.name = id;
  input.placeholder = placeholder;
  input.required = true;
  input.classList.add("input-field");
  return input;
};

const clearChildren = (container) => {
  while (container.firstChild) container.removeChild(container.firstChild);
};

const renderInputs = (type) => {
  clearChildren(inputsContainer);
  clearChildren(respuestasContainer);

  if (!configs[type]) return;

  configs[type].forEach((cfg) => inputsContainer.append(createInput(cfg)));

  const btn = document.createElement("button");
  btn.textContent = "Calcular";
  btn.type = "button";
  btn.classList.add("btn");
  btn.addEventListener("click", () => handleCalculate(type));

  inputsContainer.append(btn);
};

const readValues = (ids) =>
  ids.map((id) => {
    const el = document.getElementById(id);
    return el ? Number(el.value) : undefined;
  });

const renderResult = (result) => {
  clearChildren(respuestasContainer);
  Object.entries(result).forEach(([key, value]) => {
    const p = document.createElement("p");
    const label = labelMap[key] || key;
    p.textContent = `${label}: ${Number(value).toFixed(3)}`;
    respuestasContainer.append(p);
  });
};

const handleCalculate = (type) => {
  let result;
  switch (type) {
    case "conVarianzas": {
      const [n1, n2, m1, m2, sd1, sd2, nc] = readValues(
        configs.conVarianzas.map((c) => c.id)
      );
      result = calcularConVarianzasConocidas(n1, n2, m1, m2, sd1, sd2, nc);
      break;
    }
    case "sinVarianzas": {
      const [n1, n2, m1, m2, qs1, qs2, nc] = readValues(
        configs.sinVarianzas.map((c) => c.id)
      );
      result = calcularSinVarianzasConocidas(n1, n2, m1, m2, qs1, qs2, nc);
      break;
    }
    case "proporcion": {
      const [p, n, x, nc] = readValues(configs.proporcion.map((c) => c.id));
      result = pruebaProporcion(p, n, x, nc);
      break;
    }
    case "diferenciaProporciones": {
      const [n1, n2, x1, x2, nc] = readValues(
        configs.diferenciaProporciones.map((c) => c.id)
      );
      result = pruebaDiferenciaProporciones(n1, n2, x1, x2, nc);
      break;
    }
    default:
      return;
  }
  renderResult(result);
};

select.addEventListener("change", (e) => renderInputs(e.target.value));

// Inicializar sin inputs
clearChildren(inputsContainer);
clearChildren(respuestasContainer);

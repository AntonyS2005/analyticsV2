import { medConDes, medSinDesDisT, medSinDes } from "./hipMedia.js";

const selectOpcion = document.querySelector("#selectOpcion");

const contenedorInputs = document.querySelector("#contenedorInputs");
const contenedorResultados = document.querySelector("#contenedorResultados");
const limpiarPantalla = () => {
  contenedorInputs.innerHTML = ""; // Limpiar el contenedor de inputs
  contenedorResultados.innerHTML = ""; // Limpiar el contenedor de resultados
};
const botonCalcular = (tipo) => {
  // Evita duplicar botones si ya existe uno
  const existente = document.querySelector("#resultados button");
  if (existente) existente.remove();

  const button = document.createElement("button");
  button.textContent = "Calcular";
  button.type = "button";

  button.addEventListener("click", () => {
    calc(tipo);
    console.log("Cálculo ejecutado");
  });

  function calc(tipo) {
    switch (tipo) {
      case "medCuaT":
        const medMuesT = parseFloat(document.querySelector("#medMues").value);
        const cuasiDesvT = parseFloat(
          document.querySelector("#cuasiDesv").value
        );
        const medPobT = parseFloat(document.querySelector("#medPob").value);
        const tamMuestraT = parseFloat(
          document.querySelector("#tamMuestra").value
        );
        const nivelSignificanciaT = parseFloat(
          document.querySelector("#nivelSignificancia").value
        );
        const resultadoT = medSinDesDisT(
          medMuesT,
          cuasiDesvT,
          medPobT,
          tamMuestraT,
          nivelSignificanciaT
        );
        const dataT = [
          {
            eP: resultadoT.eP.toFixed(2),
            xC: resultadoT.xC.toFixed(2),
            t: resultadoT.t.toFixed(2),
          },
        ];
        const tableT = createTable(dataT);
        contenedorResultados.appendChild(tableT);
        break;

      case "medDesv":
        const medMuesD = parseFloat(document.querySelector("#medMues").value);
        const desvD = parseFloat(document.querySelector("#desv").value);
        const medPobD = parseFloat(document.querySelector("#medPob").value);
        const tamMuestraD = parseFloat(
          document.querySelector("#tamMuestra").value
        );
        const nivelSignificanciaD = parseFloat(
          document.querySelector("#nivelSignificancia").value
        );
        const resultadoD = medConDes(
          medMuesD,
          desvD,
          medPobD,
          tamMuestraD,
          nivelSignificanciaD
        );
        const dataD = [
          {
            eP: resultadoD.eP.toFixed(2),
            xC: resultadoD.xC.toFixed(2),
            z: resultadoD.z.toFixed(2),
          },
        ];
        const tableD = createTable(dataD);
        contenedorResultados.appendChild(tableD);
        break;
      case "medCua":
        const medMues = parseFloat(document.querySelector("#medMues").value);
        const cuasiDesv = parseFloat(
          document.querySelector("#cuasiDesv").value
        );
        const medPob = parseFloat(document.querySelector("#medPob").value);
        const tamMuestra = parseFloat(
          document.querySelector("#tamMuestra").value
        );
        const nivelSignificancia = parseFloat(
          document.querySelector("#nivelSignificancia").value
        );
        const resultado = medSinDes(
          medMues,
          cuasiDesv,
          medPob,
          tamMuestra,
          nivelSignificancia
        );
        const data = [
          {
            eP: resultado.eP.toFixed(2),
            xC: resultado.xC.toFixed(2),
            z: resultado.z.toFixed(2),
          },
        ];
        const table = createTable(data);

        contenedorResultados.appendChild(table);
        break;
      default:
        limpiarPantalla;
        break;
    }
  }

  document.querySelector("#contenedorInputs").appendChild(button);
};

selectOpcion.addEventListener("change", function () {
  limpiarPantalla();
  const selectedOption = selectOpcion.value;
  switch (selectedOption) {
    case "medCuaT":
      for (let i = 0; i < inputsSinDesviacionT.name.length; i++) {
        const input = createInputs(
          inputsSinDesviacionT.name[i],
          inputsSinDesviacionT.id[i],
          inputsSinDesviacionT.placeholder[i]
        );
        contenedorInputs.appendChild(input);
      }
      botonCalcular(selectOpcion.value);
      break;
    case "medDesv":
      for (let i = 0; i < inputsConDesviacion.name.length; i++) {
        const input = createInputs(
          inputsConDesviacion.name[i],
          inputsConDesviacion.id[i],
          inputsConDesviacion.placeholder[i]
        );
        contenedorInputs.appendChild(input);
      }
      botonCalcular(selectOpcion.value);
      break;
    case "medCua":
      for (let i = 0; i < inputsSinDesviacion.name.length; i++) {
        const input = createInputs(
          inputsSinDesviacion.name[i],
          inputsSinDesviacion.id[i],
          inputsSinDesviacion.placeholder[i]
        );
        contenedorInputs.appendChild(input);
      }
      botonCalcular(selectOpcion.value);
      break;
    default:
      break;
  }
});

const inputsConDesviacion = {
  name: [
    "Media muestral",
    "Desviación muestral",
    "Media poblacional",
    "Tamaño de la muestra",
    "Nivel de significancia",
  ],
  id: ["medMues", "desv", "medPob", "tamMuestra", "nivelSignificancia"],
  placeholder: [
    "Media muestral",
    "Desviación muestral",
    "Media poblacional",
    "Tamaño de la muestra",
    "Nivel de significancia",
  ],
};
const inputsSinDesviacionT = {
  name: [
    "Media muestral",
    "Cuasi-desviación muestral",
    "Media poblacional",
    "Tamaño de la muestra",
    "Nivel de significancia",
  ],
  id: ["medMues", "cuasiDesv", "medPob", "tamMuestra", "nivelSignificancia"],
  placeholder: [
    "Media muestral",
    "Cuasi-desviación muestral",
    "Media poblacional",
    "Tamaño de la muestra",
    "Nivel de significancia",
  ],
};

const inputsSinDesviacion = {
  name: [
    "Media muestral",
    "Cuasi-desviación muestral",
    "Media poblacional",
    "Tamaño de la muestra",
    "Nivel de significancia",
  ],
  id: ["medMues", "cuasiDesv", "medPob", "tamMuestra", "nivelSignificancia"],
  placeholder: [
    "Media muestral",
    "Cuasi-desviación muestral",
    "Media poblacional",
    "Tamaño de la muestra",
    "Nivel de significancia",
  ],
};
const createInputs = (name, id, placeholder) => {
  const input = document.createElement("input");
  input.type = "text";
  input.name = name;
  input.id = id;
  input.placeholder = placeholder;

  return input;
};

const createTable = (data) => {
  const table = document.createElement("table");
  const thead = document.createElement("thead");
  const tbody = document.createElement("tbody");

  // Crear encabezados de la tabla
  const headerRow = document.createElement("tr");
  Object.keys(data[0]).forEach((key) => {
    const th = document.createElement("th");
    th.textContent = key;
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);

  // Crear filas de la tabla
  data.forEach((item) => {
    const row = document.createElement("tr");
    Object.values(item).forEach((value) => {
      const td = document.createElement("td");
      td.textContent = value;
      row.appendChild(td);
    });
    tbody.appendChild(row);
  });

  table.appendChild(thead);
  table.appendChild(tbody);

  return table;
};

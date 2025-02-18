document.getElementById("tipoDeMuestra").addEventListener("change", function(event) {
  event.preventDefault(); // Evita recarga de la página
  
  let opcion = this.value;
  let camposMuestra = document.getElementById("camposMuestra");
  camposMuestra.innerHTML = ""; // Limpiar campos anteriores

  const crearInput = (id, placeholder) => {
      let input = document.createElement("input");
      input.type = "text";
      input.id = id;
      input.placeholder = placeholder;
      return input;
  };

  const agregarElemento = (elemento) => {
      camposMuestra.appendChild(document.createElement("br"));
      camposMuestra.appendChild(elemento);
  };

  let inputsConfig = {
      "proSinPo": ["varNC", "Nivel de confianza", "varP", "Probabilidad de éxito", "varD", "Precisión"],
      "proConPo": ["varNC", "Nivel de confianza", "varN", "Tamaño de población", "varP", "Probabilidad de éxito", "varD", "Precisión"],
      "medSinPo": ["varNC", "Nivel de confianza", "varN", "Tamaño de población", "varS", "Desviación estándar", "varD", "Precisión"],
      "medConPo": ["varNC", "Nivel de confianza", "varN", "Tamaño de población", "varS", "Desviación estándar", "varD", "Precisión"]
  };

  if (inputsConfig[opcion]) {
      for (let i = 0; i < inputsConfig[opcion].length; i += 2) {
          agregarElemento(crearInput(inputsConfig[opcion][i], inputsConfig[opcion][i + 1]));
      }
  }

  document.getElementById("btnCalc").addEventListener("click", function(event) {
      event.preventDefault(); // Evita recarga de la página
      
      let nc = document.getElementById("varNC")?.value || "";
      let n = document.getElementById("varN")?.value || "";
      let p = document.getElementById("varP")?.value || "";
      let d = document.getElementById("varD")?.value || "";
      let s = document.getElementById("varS")?.value || "";
      
      console.log("Valores obtenidos:", { nc, n, p, d, s, opcion });
      
      calcEstProConN(nc, n, p, d, s, opcion);
  });
});

function calcEstProConN(nc, n, p, d, s, opcion) {
  console.log("Ejecutando calcEstProConN con:", { nc, n, p, d, s, opcion });
  
  switch (opcion) {
      case "proConPo":
          let ns = 100 - nc;
          let za = math.invNorm((nc + (ns / 2)));
          let q = 100 - p;
          let result = (n * za ** 2 * p * q) / (d ** 2 * (n - 1) + za ** 2 * p * q);
          result = Math.ceil(result);
          console.log("Resultado calculado:", result);
          return [ns, za, q, s, result];
      case "proSinPo":
      case "medSinPo":
      case "medConPo":
          console.log("Caso aún no implementado");
          break;
  }
}

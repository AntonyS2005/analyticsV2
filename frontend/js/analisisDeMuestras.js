async function analisis(datos, num) {
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

async function getDatos() {
  const archivoInput = document.getElementById("archivoExcel");
  const archivo = archivoInput.files[0];
  const hoja = document.getElementById("txtSheet").value;

  if (archivo) {
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
  } else {
      console.error("No se seleccionó un archivo.");
      return null;
  }
}

async function calcular() {
  const num = parseFloat(document.getElementById("txtNum").value);
  const datos = await getDatos();

  if (datos) {
      const [mayor, menor, mayorIgual, menorIgual, igual, total] = await analisis(datos, num);


      document.getElementById("mayor").textContent = mayor;
      document.getElementById("menor").textContent = menor;
      document.getElementById("mayorIgual").textContent = mayorIgual;
      document.getElementById("menorIgual").textContent = menorIgual;
      document.getElementById("igual").textContent = igual;
      document.getElementById("total").textContent = total; 
  }
}
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
    
    const tipoCalculoSelect = document.getElementById("tipoCalculo");
    const inputsDiv = document.getElementById("inputs");
    const resultadoDiv = document.getElementById("resultado");
    
    tipoCalculoSelect.addEventListener("change", generarInputs);
    
    function generarInputs() {
      const tipoCalculo = tipoCalculoSelect.value;
      inputsDiv.innerHTML = "";
    
      switch (tipoCalculo) {
        case "mediaConocida":
          inputsDiv.innerHTML = `
            <label>Media muestral (x̄): <input type="number" id="mediaMuestral"></label><br>
            <label>Desviación estándar poblacional (σ): <input type="number" id="desviacionPoblacional"></label><br>
            <label>Tamaño de la muestra (n): <input type="number" id="tamanoMuestra"></label><br>
            <label>Nivel de confianza (%): <input type="number" id="nivelConfianza"></label>
          `;
          break;
        case "mediaDesconocida":
          inputsDiv.innerHTML = `
            <label>Media muestral (x̄): <input type="number" id="mediaMuestral"></label><br>
            <label>Desviación estándar muestral (s): <input type="number" id="desviacionMuestral"></label><br>
            <label>Tamaño de la muestra (n): <input type="number" id="tamanoMuestra"></label><br>
            <label>Nivel de confianza (%): <input type="number" id="nivelConfianza"></label>
          `;
          break;
        case "muestraPequena":
          inputsDiv.innerHTML = `
            <label>Media muestral (x̄): <input type="number" id="mediaMuestral"></label><br>
            <label>Desviación estándar muestral (s): <input type="number" id="desviacionMuestral"></label><br>
            <label>Tamaño de la muestra (n): <input type="number" id="tamanoMuestra"></label><br>
            <label>Nivel de confianza (%): <input type="number" id="nivelConfianza"></label>
          `;
          break;
          case "proporcion":
            inputsDiv.innerHTML = `
              <label>Cantidad de éxitos: <input type="number" id="cantidadExitos"></label><br>
              <label>Total de encuestados: <input type="number" id="totalEncuestados"></label><br>
              <label>Nivel de confianza (%): <input type="number" id="nivelConfianza"></label>
            `;
            break;
      }
      resultadoDiv.textContent = "";
    }
    
    function calcular() {
      const tipoCalculo = tipoCalculoSelect.value;
      let resultado = "";
    
      switch (tipoCalculo) {
        case "mediaConocida":
          const mediaMuestralConocida = parseFloat(document.getElementById("mediaMuestral").value);
          const desviacionPoblacional = parseFloat(document.getElementById("desviacionPoblacional").value);
          const tamanoMuestraConocida = parseInt(document.getElementById("tamanoMuestra").value);
          const nivelConfianzaConocida = parseFloat(document.getElementById("nivelConfianza").value);
          const zConocida = calZa(nivelConfianzaConocida, 100 - nivelConfianzaConocida);
          const margenErrorConocida = zConocida * (desviacionPoblacional / Math.sqrt(tamanoMuestraConocida));
          resultado = `Intervalo de confianza: (${(mediaMuestralConocida - margenErrorConocida).toFixed(3)}, ${(mediaMuestralConocida + margenErrorConocida).toFixed(3)})`;
          break;
        case "mediaDesconocida":
          const mediaMuestralDesconocida = parseFloat(document.getElementById("mediaMuestral").value);
          const desviacionMuestralDesconocida = parseFloat(document.getElementById("desviacionMuestral").value);
          const tamanoMuestraDesconocida = parseInt(document.getElementById("tamanoMuestra").value);
          const nivelConfianzaDesconocida = parseFloat(document.getElementById("nivelConfianza").value);
          const zDesconocida = calZa(nivelConfianzaDesconocida, 100 - nivelConfianzaDesconocida);
          const margenErrorDesconocida = zDesconocida * (desviacionMuestralDesconocida / Math.sqrt(tamanoMuestraDesconocida));
          resultado = `Intervalo de confianza: (${(mediaMuestralDesconocida - margenErrorDesconocida).toFixed(3)}, ${(mediaMuestralDesconocida + margenErrorDesconocida).toFixed(3)})`;
          break;
          case "muestraPequena":
            const mediaMuestralPequena = parseFloat(document.getElementById("mediaMuestral").value);
            const desviacionMuestralPequena = parseFloat(document.getElementById("desviacionMuestral").value);
            const tamanoMuestraPequena = parseInt(document.getElementById("tamanoMuestra").value);
            const nivelConfianzaPequena = parseFloat(document.getElementById("nivelConfianza").value);
            const tPequena = obtenerValorT(nivelConfianzaPequena);

          const margenErrorPequena = tPequena * (desviacionMuestralPequena / Math.sqrt(tamanoMuestraPequena));
          resultado = `Intervalo de confianza: (${(mediaMuestralPequena - margenErrorPequena).toFixed(3)}, ${(mediaMuestralPequena + margenErrorPequena).toFixed(3)})`;
  break;
  case "proporcion":
    const cantidadExitos = parseFloat(document.getElementById("cantidadExitos").value);
    const totalEncuestados = parseInt(document.getElementById("totalEncuestados").value);
    const nivelConfianzaProporcion = parseFloat(document.getElementById("nivelConfianza").value);
  
    const proporcionMuestral = cantidadExitos / totalEncuestados;
  
    const zProporcion = calZa(nivelConfianzaProporcion, 100 - nivelConfianzaProporcion);
    const margenErrorProporcion = zProporcion * Math.sqrt((proporcionMuestral * (1 - proporcionMuestral)) / totalEncuestados);
    resultado = `Intervalo de confianza: (${(proporcionMuestral - margenErrorProporcion).toFixed(3)}, ${(proporcionMuestral + margenErrorProporcion).toFixed(3)})`;
    break;
      }
    
      resultadoDiv.textContent = resultado;
    }

    function obtenerValorT(nivelConfianza) {
      const probabilidad = nivelConfianza / 100 + (1 - nivelConfianza / 100) / 2;
      return invNormEstand(probabilidad); 
    }
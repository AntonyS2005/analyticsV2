function factorial(n) {
  if (n === 0 || n === 1) return 1;
  let result = 1;
  for (let i = 2; i <= n; i++) {
    result *= i;
  }
  return result;
}

function combSinRep(n, r) {
  return factorial(n) / (factorial(r) * factorial(n - r));
}

function combConRep(n, r) {
  return factorial(n + r - 1) / (factorial(r) * factorial(n - 1));
}

function perSinRep(n, r) {
  return factorial(n) / factorial(n - r);
}

function perConRep(n, r) {
  return Math.pow(n, r);
}

function perSinRepAll(n) {
  return factorial(n);
}

function perCir(n) {
  return factorial(n - 1);
}

function calcular() {
  let n = parseInt(document.getElementById("n").value);
  let r = document.getElementById("r").value;
  let resultado = "<table border='1'><tr><th>Cálculo</th><th>Resultado</th></tr>";

  if (!isNaN(n) && n > 0) {
    resultado += `<tr><td>Permutación sin repetición (n!)</td><td>${perSinRepAll(n)}</td></tr>`;
    resultado += `<tr><td>Permutación circular</td><td>${perCir(n)}</td></tr>`;

    if (r !== "") {
      r = parseInt(r);
      if (!isNaN(r) && r > 0 && r <= n) {
        resultado += `<tr><td>Permutación sin repetición (nPr)</td><td>${perSinRep(n, r)}</td></tr>`;
        resultado += `<tr><td>Permutación con repetición (n^r)</td><td>${perConRep(n, r)}</td></tr>`;
        resultado += `<tr><td>Combinación sin repetición (nCr)</td><td>${combSinRep(n, r)}</td></tr>`;
        resultado += `<tr><td>Combinación con repetición</td><td>${combConRep(n, r)}</td></tr>`;
      } else {
        resultado += `<tr><td colspan='2' style='color:red;'>r debe ser un número entre 1 y n.</td></tr>`;
      }
    }
  } else {
    resultado = "<span style='color:red;'>Por favor, ingrese un valor válido para n.</span>";
  }

  resultado += "</table>";
  document.getElementById("resultado").innerHTML = resultado;
}
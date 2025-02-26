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

// Ejemplo de uso
console.log(combSinRep(4, 2));
console.log(combConRep(4, 2));
console.log(perSinRep(4, 2));
console.log(perConRep(4, 2));
console.log(perSinRepAll(4));
console.log(perCir(4));

import { combSinRep } from './analiComb';

function distriBinomial(numExitos, ensayos, probExito, acumulado) {
    let combinat = combSinRep(ensayos, numExitos);
    let pk = Math.pow(probExito, numExitos);
    let qN_K = Math.pow(1 - probExito, ensayos - numExitos);
    let resul = pk * combinat * qN_K;
    numExitos -= 1;
    
    if (acumulado && numExitos >= 0) {
        return resul + distriBinomial(numExitos, ensayos, probExito, acumulado);
    } else {
        return resul;
    }
}

function distriPoisson(x, media, acumulado) {
    let uK = Math.pow(media, x);
    let expMenU = Math.exp(-media);
    let factK = factorial(x);
    let resul = (uK * expMenU) / factK;
    x -= 1;
    
    if (acumulado && x >= 0) {
        return resul + distriPoisson(x, media, acumulado);
    } else {
        return resul;
    }
}

// Ejemplo de uso
let disB = distriPoisson(4, 7, true);
disB = Math.round(disB * 100, 2);

console.log(disB);
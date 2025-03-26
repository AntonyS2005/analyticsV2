
document.addEventListener("DOMContentLoaded", function () {
    const nav = document.querySelector(".menu");
    
    const menuItems = [
        { href: "analisisDeMuestra.html", icon: "fas fa-chart-line", text: "Analisis De Muestra" },
        { href: "intervalosDeConfianza.html", icon: "fas fa-chart-line", text: "Intervalo de Confianza" },
        { href: "tamañoDeMuestra.html", icon: "fas fa-tachometer-alt", text: "Tamaño de Muestra" },
        { href: "calc_permutaciones.html", icon: "fas fa-chart-area", text: "Permutaciones" },
        { href: "distribuciones.html", icon: "fas fa-chart-bar", text: "Distribuciones" },
        { href: "analisisEstadistico.html", icon: "fas fa-table", text: "Análisis Estadístico" }
    ];

    
    
    const initialContent = nav.querySelector("div").outerHTML;
    nav.innerHTML = "";
    
    nav.innerHTML = initialContent;
    
    menuItems.forEach(item => {
        const a = document.createElement("a");
        a.href = item.href;
        a.classList.add("a");
        
        const icon = document.createElement("i");
        icon.className = item.icon;
        
        const text = document.createElement("p");
        text.textContent = item.text;
        
        a.appendChild(icon);
        a.appendChild(text);
        nav.appendChild(a);
    });

    const menuText = document.createElement("p");
    menuText.textContent = "_____________________";

    const menuText2 = document.createElement("p")
    menuText2.textContent = "Menu Arata";
    const br1 = document.createElement("br")
    const br2 = document.createElement("br")
    const br5 = document.createElement("br")
    const br6 = document.createElement("br")
    const br7 = document.createElement("br")
    nav.appendChild(br1);
    nav.appendChild(br2);
    nav.appendChild(br5);
    nav.appendChild(menuText);
    nav.appendChild(menuText2);
    nav.appendChild(br6);
    nav.appendChild(br7);

});
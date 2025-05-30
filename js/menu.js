document.addEventListener("DOMContentLoaded", function () {
  const nav = document.querySelector(".menu");

  if (!nav) {
    console.error("No se encontró el elemento con clase .menu");
    return;
  }

  const menuAnilisisEstadistico = [
    { text: "regresar" },
    {
      href: "analisisDeMuestra.html",
      icon: "fas fa-chart-line",
      text: "Analisis De Muestra",
    },
    {
      href: "tamañoDeMuestra.html",
      icon: "fas fa-tachometer-alt",
      text: "Tamaño de Muestra",
    },
    {
      href: "analisisEstadistico.html",
      icon: "fas fa-table",
      text: "Análisis Estadístico",
    },
  ];

  const correlacion = [
    { text: "regresar" },
    {
      href: "correlacionBivariable.html",
      icon: "fas fa-chart-area",
      text: "Bivariable",
    },
    {
      href: "correlacionMulti.html",
      icon: "fas fa-chart-area",
      text: "Multivariable",
    },
  ];

  const probabilidadDistribuciones = [
    { text: "regresar" },
    {
      href: "calc_permutaciones.html",
      icon: "fas fa-chart-area",
      text: "Permutaciones",
    },
    {
      href: "distribuciones.html",
      icon: "fas fa-chart-bar",
      text: "Distribuciones",
    },
  ];

  const MenuInferencias = [
    { text: "regresar" },
    {
      href: "intervalosDeConfianza.html",
      icon: "fas fa-chart-line",
      text: "Intervalo de Confianza",
    },
    {
      href: "hipMedia.html",
      icon: "fas fa-chart-area",
      text: "Hipotesis de Media",
    },
    {
      href: "difMedia.html",
      icon: "fas fa-chart-area",
      text: "Hipotesis de Diferencia de Medias",
    },
  ];

  const MenuUtilidades = [
    { text: "regresar" },
    {
      href: "generarExcel.html",
      icon: "fas fa-table",
      text: "generar excel",
    },
    {
      href: "ayuda.html",
      icon: "fa-question-circle",
      text: "Ayuda",
    },
  ];

  const menuItems = [
    {
      icon: "fas fa-chart-area",
      text: "Analisis Estadistico",
    },
    {
      icon: "fas fa-chart-area",
      text: "Correlacion",
    },
    {
      icon: "fas fa-chart-area",
      text: "Inferencia Estadistica",
    },
    {
      icon: "fas fa-chart-area",
      text: "Probabilidades y Distribuciones",
    },
    {
      icon: "fas fa-chart-area",
      text: "utilidades",
    },
  ];

  const menus = {
    "Analisis Estadistico": menuAnilisisEstadistico,
    "Correlacion": correlacion,
    "Inferencia Estadistica": MenuInferencias,
    "Probabilidades y Distribuciones": probabilidadDistribuciones,
    "utilidades": MenuUtilidades,
  };

  const initialContent = nav.querySelector("div")?.outerHTML || "";
  
  function cargarMenu(menu) {
    nav.innerHTML = "";
    if (initialContent) nav.innerHTML = initialContent;

    menu.forEach((item) => {
      const a = document.createElement("a");
      a.classList.add("a");

      const icon = document.createElement("i");
      icon.className = item.icon || "fas fa-chevron-left";

      const text = document.createElement("p");
      text.textContent = item.text;

      a.appendChild(icon);
      a.appendChild(text);

      if (item.text === "regresar") {
        a.addEventListener("click", () => cargarMenu(menuItems));
      } else if (item.href) {
        a.href = item.href;
      } else if (menus[item.text]) {
        a.addEventListener("click", () => cargarMenu(menus[item.text]));
      }

      nav.appendChild(a);
    });

    const themeContainer = document.createElement("div");
    themeContainer.style.marginTop = "auto";
    themeContainer.style.padding = "20px";
    themeContainer.style.textAlign = "center";

    const label = document.createElement("label");
    label.textContent = "Tema Claro";
    label.style.display = "block";
    label.style.marginBottom = "10px";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.style.transform = "scale(1.2)";

    function aplicarTema(theme) {
      if (theme === "light") {
        document.body.classList.add("tema-claro");
        checkbox.checked = true;
      } else {
        document.body.classList.remove("tema-claro");
        checkbox.checked = false;
      }
      localStorage.setItem("theme", theme);
    }

    let savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      aplicarTema(savedTheme);
    } else {
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        aplicarTema("dark");
      } else {
        aplicarTema("light");
      }
    }

    checkbox.addEventListener("change", function () {
      aplicarTema(checkbox.checked ? "light" : "dark");
    });

    themeContainer.appendChild(label);
    themeContainer.appendChild(checkbox);
    nav.appendChild(themeContainer);

    const menuText = document.createElement("p");
    menuText.textContent = "_____________________";
    const menuText2 = document.createElement("p");
    menuText2.textContent = "Menu Arata";

    const punto = document.createElement("p");
    punto.textContent = ".";
    const b1 = document.createElement("br");
    const b2 = document.createElement("br");
    const b3 = document.createElement("br");

    nav.appendChild(menuText);
    nav.appendChild(menuText2);
    nav.appendChild(b1);
    nav.appendChild(b2);
    nav.appendChild(b3);
    nav.appendChild(punto);
  }

  cargarMenu(menuItems);
});
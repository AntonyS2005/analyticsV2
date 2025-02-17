tipoDeMuestra = document.getElementById("tipoDeMuestra");

tipoDeMuestra.addEventListener("change",function(){
  let opcion = this.value;
  switch(opcion){
    case "proSinPo": 
    //cracion de campos necesarios
      let inputNC = document.createElement("input");

      inputNC.type = "text";
      inputNC.id = "varNC"; // Asigna un ID único
      inputNC.placeholder = "Nivel de cofianza";
      document.getElementById("camposMuestra").appendChild(document.createElement("br"));
      document.getElementById("camposMuestra").appendChild(inputNC);
      document.getElementById("camposMuestra").appendChild(document.createElement("br")); 
      
      let inputN = document.createElement("input");
  
      inputN.type = "text";
      inputN.id = "varN"; // Asigna un ID único
      inputN.placeholder = "tamaño de poblacion";
      document.getElementById("camposMuestra").appendChild(document.createElement("br"));
      document.getElementById("camposMuestra").appendChild(inputN);
      document.getElementById("camposMuestra").appendChild(document.createElement("br"));

      let inputP = document.createElement("input");
  
      inputP.type = "text";
      inputP.id = "varP"; // Asigna un ID único
      inputP.placeholder = "probabilidad de exito";
      document.getElementById("camposMuestra").appendChild(document.createElement("br"));
      document.getElementById("camposMuestra").appendChild(inputP);
      document.getElementById("camposMuestra").appendChild(document.createElement("br"));

      let inputd = document.createElement("input");
  
      inputD.type = "text";
      inputD.id = "varN"; // Asigna un ID único
      inputD.placeholder = "precision";
      document.getElementById("camposMuestra").appendChild(document.createElement("br"));
      document.getElementById("camposMuestra").appendChild(inputD);
      document.getElementById("camposMuestra").appendChild(document.createElement("br"));
    
    
    break;
    case "proConPo": 
    
    break;  
    case "medSinPo": 
    
    break;  
    case "medConPo": 
    
    break;
  }
});

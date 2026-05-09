// script.js

// =====================================
// DEBUG POSIÇÃO
// =====================================

elementos.canvasBase.addEventListener("click", e => {

  const rect =
    elementos.canvasBase.getBoundingClientRect();

  const x =
    (e.clientX - rect.left) /
    rect.width;

  const y =
    (e.clientY - rect.top) /
    rect.height;

  console.log(
    `x:${x.toFixed(3)} y:${y.toFixed(3)}`
  );
});

// =====================================
// CONFIG
// =====================================

const CONFIG = {

  imagemBase:"./img/pessoa.png",

  pincelCor:"#000",

  pincelTamanho:3,

  borrachaTamanho:12
};

// =====================================
// ESTADO
// =====================================

const estado = {

  modo:"pintar",

  desenhando:false,

  ultimoX:0,

  ultimoY:0,

  imagem:null
};

// =====================================
// POSIÇÕES DOS CAMPOS
// RESPONSIVO REAL
// =====================================

const areasTexto = [

  // =========================
  // ESQUERDA
  // =========================

  { tipo:"D", x:0.105, y:0.325 },
  { tipo:"I", x:0.105, y:0.355 },

  { tipo:"D", x:0.105, y:0.470 },
  { tipo:"I", x:0.105, y:0.500 },

  { tipo:"D", x:0.105, y:0.615 },
  { tipo:"I", x:0.105, y:0.645 },

  { tipo:"D", x:0.105, y:0.760 },
  { tipo:"I", x:0.105, y:0.790 },

  // =========================
  // CENTRO
  // =========================

  { tipo:"D", x:0.455, y:0.325 },
  { tipo:"I", x:0.455, y:0.355 },

  { tipo:"D", x:0.455, y:0.470 },
  { tipo:"I", x:0.455, y:0.500 },

  { tipo:"D", x:0.455, y:0.615 },
  { tipo:"I", x:0.455, y:0.645 },

  { tipo:"D", x:0.455, y:0.760 },
  { tipo:"I", x:0.455, y:0.790 },

  // =========================
  // DIREITA
  // =========================

  { tipo:"D", x:0.805, y:0.325 },
  { tipo:"I", x:0.805, y:0.355 },

  { tipo:"D", x:0.805, y:0.470 },
  { tipo:"I", x:0.805, y:0.500 },

  { tipo:"D", x:0.805, y:0.615 },
  { tipo:"I", x:0.805, y:0.645 },

  { tipo:"D", x:0.805, y:0.760 },
  { tipo:"I", x:0.805, y:0.790 }

];

// =====================================
// ELEMENTOS
// =====================================

const elementos = {

  canvasBase:
    document.getElementById("canvasBase"),

  canvasPaint:
    document.getElementById("canvasPaint"),

  formulario:
    document.getElementById("formulario"),

  nomePaciente:
    document.getElementById("nomePaciente"),

  container:
    document.getElementById("mapaContainer")
};

// =====================================
// CONTEXTOS
// =====================================

const ctxBase =
  elementos.canvasBase.getContext("2d");

const ctxPaint =
  elementos.canvasPaint.getContext("2d");

// =====================================
// INIT
// =====================================

window.addEventListener(
  "load",
  iniciarSistema
);

window.addEventListener(
  "resize",
  recriarInterface
);

// =====================================
// SISTEMA
// =====================================

async function iniciarSistema(){

  await carregarImagem();

  configurarEventos();

  carregarLocalStorage();

  elementos.nomePaciente.addEventListener(
    "input",
    salvarLocalStorage
  );
}

async function recriarInterface(){

  const desenhoAtual =
    elementos.canvasPaint.toDataURL();

  limparCampos();

  await carregarImagem();

  restaurarDesenho(
    desenhoAtual
  );

  carregarLocalStorage();
}

// =====================================
// IMAGEM
// =====================================

function carregarImagem(){

  return new Promise(resolve=>{

    estado.imagem = new Image();

    estado.imagem.src =
      CONFIG.imagemBase;

    estado.imagem.onload = ()=>{

      configurarCanvas();

      desenharImagem();

      criarCampos();

      resolve();
    };
  });
}

// =====================================
// CANVAS
// =====================================

function configurarCanvas(){

  const proporcao =
    estado.imagem.height /
    estado.imagem.width;

  const largura =
    elementos.container.clientWidth;

  const altura =
    largura * proporcao;

  [
    elementos.canvasBase,
    elementos.canvasPaint
  ].forEach(canvas=>{

    canvas.width = largura;

    canvas.height = altura;
  });

  elementos.container.style.height =
    altura + "px";
}

function desenharImagem(){

  ctxBase.clearRect(
    0,
    0,
    elementos.canvasBase.width,
    elementos.canvasBase.height
  );

  ctxBase.drawImage(
    estado.imagem,
    0,
    0,
    elementos.canvasBase.width,
    elementos.canvasBase.height
  );
}

// =====================================
// EVENTOS
// =====================================

function configurarEventos(){

  const canvas =
    elementos.canvasPaint;

  canvas.addEventListener(
    "mousedown",
    iniciarDesenho
  );

  canvas.addEventListener(
    "mousemove",
    desenhar
  );

  window.addEventListener(
    "mouseup",
    pararDesenho
  );

  canvas.addEventListener(
    "touchstart",
    iniciarDesenho,
    { passive:false }
  );

  canvas.addEventListener(
    "touchmove",
    desenharTouch,
    { passive:false }
  );

  window.addEventListener(
    "touchend",
    pararDesenho
  );
}

// =====================================
// DESENHO
// =====================================

function iniciarDesenho(e){

  estado.desenhando = true;

  const pos =
    obterPosicao(e);

  estado.ultimoX = pos.x;

  estado.ultimoY = pos.y;
}

function pararDesenho(){

  estado.desenhando = false;

  salvarLocalStorage();
}

function desenharTouch(e){

  e.preventDefault();

  desenhar(e);
}

function desenhar(e){

  if(!estado.desenhando) return;

  const pos =
    obterPosicao(e);

  if(estado.modo === "pintar"){

    ctxPaint.strokeStyle =
      CONFIG.pincelCor;

    ctxPaint.lineWidth =
      CONFIG.pincelTamanho;

    ctxPaint.lineCap =
      "round";

    ctxPaint.beginPath();

    ctxPaint.moveTo(
      estado.ultimoX,
      estado.ultimoY
    );

    ctxPaint.lineTo(
      pos.x,
      pos.y
    );

    ctxPaint.stroke();

  }else{

    ctxPaint.save();

    ctxPaint.globalCompositeOperation =
      "destination-out";

    ctxPaint.beginPath();

    ctxPaint.arc(
      pos.x,
      pos.y,
      CONFIG.borrachaTamanho,
      0,
      Math.PI * 2
    );

    ctxPaint.fill();

    ctxPaint.restore();
  }

  estado.ultimoX = pos.x;
  estado.ultimoY = pos.y;
}

// =====================================
// POSIÇÃO
// =====================================

function obterPosicao(e){

  const rect =
    elementos.canvasPaint.getBoundingClientRect();

  let clientX;
  let clientY;

  if(e.touches){

    clientX =
      e.touches[0].clientX;

    clientY =
      e.touches[0].clientY;

  }else{

    clientX = e.clientX;
    clientY = e.clientY;
  }

  return {

    x:
      (
        clientX - rect.left
      ) *
      (
        elementos.canvasPaint.width /
        rect.width
      ),

    y:
      (
        clientY - rect.top
      ) *
      (
        elementos.canvasPaint.height /
        rect.height
      )
  };
}

// =====================================
// CAMPOS
// =====================================

function criarCampos(){

  limparCampos();

  areasTexto.forEach(area=>{

    let campo;

    // =========================
    // DATA
    // =========================

    if(area.tipo === "D"){

      campo =
        document.createElement("input");

      campo.type = "date";

      campo.classList.add(
        "campoMapa",
        "campoData"
      );
    }

    // =========================
    // INTENSIDADE
    // =========================

    if(area.tipo === "I"){

      campo =
        document.createElement("select");

      campo.classList.add(
        "campoMapa",
        "campoIntensidade"
      );

      for(let i=0;i<=10;i++){

        const opt =
          document.createElement("option");

        opt.value = i;

        opt.textContent = i;

        campo.appendChild(opt);
      }
    }

    // =========================
    // POSICIONAMENTO RESPONSIVO
    // =========================

    campo.style.left =
      (
        area.x *
        elementos.canvasBase.width
      ) + "px";

    campo.style.top =
      (
        area.y *
        elementos.canvasBase.height
      ) + "px";

    campo.addEventListener(
      "input",
      salvarLocalStorage
    );

    campo.addEventListener(
      "change",
      salvarLocalStorage
    );

    elementos.formulario.appendChild(
      campo
    );
  });
}

function limparCampos(){

  elementos.formulario.innerHTML = "";
}

// =====================================
// MODOS
// =====================================

function definirModo(modo){

  estado.modo = modo;
}

// =====================================
// LIMPAR
// =====================================

function limparTudo(){

  ctxPaint.clearRect(
    0,
    0,
    elementos.canvasPaint.width,
    elementos.canvasPaint.height
  );

  localStorage.removeItem(
    "mapaDorDados"
  );

  elementos.nomePaciente.value =
    "";

  document
    .querySelectorAll(".campoMapa")
    .forEach(campo=>{

      if(campo.tagName === "SELECT"){

        campo.selectedIndex = 0;

      }else{

        campo.value = "";
      }
    });
}

// =====================================
// STORAGE
// =====================================

function salvarLocalStorage(){

  const campos =
    [
      ...document.querySelectorAll(".campoMapa")
    ];

  const dados = {

    nomePaciente:
      elementos.nomePaciente.value,

    campos:
      campos.map(c=>c.value),

    desenho:
      elementos.canvasPaint.toDataURL()
  };

  localStorage.setItem(
    "mapaDorDados",
    JSON.stringify(dados)
  );
}

function carregarLocalStorage(){

  const dadosSalvos =
    localStorage.getItem(
      "mapaDorDados"
    );

  if(!dadosSalvos) return;

  const dados =
    JSON.parse(dadosSalvos);

  elementos.nomePaciente.value =
    dados.nomePaciente || "";

  const campos =
    [
      ...document.querySelectorAll(".campoMapa")
    ];

  campos.forEach((campo,index)=>{

    if(dados.campos){

      campo.value =
        dados.campos[index];
    }
  });

  if(dados.desenho){

    const img = new Image();

    img.onload = ()=>{

      ctxPaint.drawImage(
        img,
        0,
        0,
        elementos.canvasPaint.width,
        elementos.canvasPaint.height
      );
    };

    img.src = dados.desenho;
  }
}

// =====================================
// PDF
// =====================================

async function salvarPDF(){

  const { jsPDF } =
    window.jspdf;

  const pdf =
    new jsPDF(
      "p",
      "mm",
      "a4"
    );

  const captura =
    await html2canvas(
      elementos.container,
      {
        scale:4,
        useCORS:true
      }
    );

  const larguraPDF = 190;

  const alturaPDF =
    (
      captura.height *
      larguraPDF
    ) /
    captura.width;

  pdf.text(
    `Mapa da Dor - ${
      elementos.nomePaciente.value || ""
    }`,
    10,
    10
  );

  pdf.addImage(
    captura.toDataURL("image/png"),
    "PNG",
    10,
    20,
    larguraPDF,
    alturaPDF
  );

  pdf.save(
    "mapa-da-dor.pdf"
  );
}

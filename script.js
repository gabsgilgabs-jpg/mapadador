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
// POSIÇÕES EXATAS
// LOGO APÓS O "D:" E "I:"
// =====================================

const areasTexto = [

  // =====================================
  // ESQUERDA 1
  // =====================================

  {
    tipo:"D",
    x:0.055,
    y:0.08
  },

  {
    tipo:"I",
    x:0.055,
    y:0.115
  },

  // =====================================
  // ESQUERDA 2
  // =====================================

  {
    tipo:"D",
    x:0.055,
    y:0.255
  },

  {
    tipo:"I",
    x:0.055,
    y:0.29
  },

  // =====================================
  // ESQUERDA 3
  // =====================================

  {
    tipo:"D",
    x:0.055,
    y:0.43
  },

  {
    tipo:"I",
    x:0.055,
    y:0.465
  },

  // =====================================
  // ESQUERDA 4
  // =====================================

  {
    tipo:"D",
    x:0.055,
    y:0.605
  },

  {
    tipo:"I",
    x:0.055,
    y:0.64
  },

  // =====================================
  // CENTRO 1
  // =====================================

  {
    tipo:"D",
    x:0.405,
    y:0.08
  },

  {
    tipo:"I",
    x:0.405,
    y:0.115
  },

  // =====================================
  // CENTRO 2
  // =====================================

  {
    tipo:"D",
    x:0.405,
    y:0.255
  },

  {
    tipo:"I",
    x:0.405,
    y:0.29
  },

  // =====================================
  // CENTRO 3
  // =====================================

  {
    tipo:"D",
    x:0.405,
    y:0.43
  },

  {
    tipo:"I",
    x:0.405,
    y:0.465
  },

  // =====================================
  // CENTRO 4
  // =====================================

  {
    tipo:"D",
    x:0.405,
    y:0.605
  },

  {
    tipo:"I",
    x:0.405,
    y:0.64
  },

  // =====================================
  // DIREITA 1
  // =====================================

  {
    tipo:"D",
    x:0.765,
    y:0.08
  },

  {
    tipo:"I",
    x:0.845,
    y:0.115
  },

  // =====================================
  // DIREITA 2
  // =====================================

  {
    tipo:"D",
    x:0.765,
    y:0.255
  },

  {
    tipo:"I",
    x:0.845,
    y:0.29
  },

  // =====================================
  // DIREITA 3
  // =====================================

  {
    tipo:"D",
    x:0.765,
    y:0.43
  },

  {
    tipo:"I",
    x:0.845,
    y:0.465
  },

  // =====================================
  // DIREITA 4
  // =====================================

  {
    tipo:"D",
    x:0.765,
    y:0.605
  },

  {
    tipo:"I",
    x:0.845,
    y:0.64
  }

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

    pintar(
      pos.x,
      pos.y
    );

  }else{

    apagar(
      pos.x,
      pos.y
    );
  }

  estado.ultimoX = pos.x;

  estado.ultimoY = pos.y;
}

// =====================================
// PINTAR
// =====================================

function pintar(x,y){

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

  ctxPaint.lineTo(x,y);

  ctxPaint.stroke();
}

// =====================================
// APAGAR
// =====================================

function apagar(x,y){

  ctxPaint.save();

  ctxPaint.globalCompositeOperation =
    "destination-out";

  ctxPaint.beginPath();

  ctxPaint.arc(
    x,
    y,
    CONFIG.borrachaTamanho,
    0,
    Math.PI * 2
  );

  ctxPaint.fill();

  ctxPaint.restore();
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

    // DATA

    if(area.tipo === "D"){

      campo =
        document.createElement("input");

      campo.type = "date";

      campo.classList.add(
        "campoMapa",
        "campoData"
      );
    }

    // INTENSIDADE

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

    campo.style.left =
      (area.x * 100) + "%";

    campo.style.top =
      (area.y * 100) + "%";

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

function limparCanvas(){

  ctxPaint.clearRect(
    0,
    0,
    elementos.canvasPaint.width,
    elementos.canvasPaint.height
  );
}

function limparTudo(){

  limparCanvas();

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

function restaurarDesenho(base64){

  if(!base64) return;

  const img =
    new Image();

  img.onload = ()=>{

    ctxPaint.drawImage(
      img,
      0,
      0,
      elementos.canvasPaint.width,
      elementos.canvasPaint.height
    );
  };

  img.src = base64;
}

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
      elementos.canvasPaint.toDataURL(),

    modo:
      estado.modo
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

  restaurarDesenho(
    dados.desenho
  );
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

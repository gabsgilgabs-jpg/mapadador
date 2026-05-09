// =====================================
// CONFIGURAÇÕES
// =====================================

const CONFIG = {

  larguraMaxima:595,

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
// CAMPOS
// =====================================

const areasTexto = [

  { tipo:"D", x:0.08, y:0.18, w:0.12, h:0.05 },
  { tipo:"I", x:0.22, y:0.18, w:0.10, h:0.05 },

  { tipo:"D", x:0.08, y:0.33, w:0.12, h:0.05 },
  { tipo:"I", x:0.22, y:0.33, w:0.10, h:0.05 },

  { tipo:"D", x:0.08, y:0.48, w:0.12, h:0.05 },
  { tipo:"I", x:0.22, y:0.48, w:0.10, h:0.05 },

  { tipo:"D", x:0.65, y:0.18, w:0.12, h:0.05 },
  { tipo:"I", x:0.79, y:0.18, w:0.10, h:0.05 },

  { tipo:"D", x:0.65, y:0.33, w:0.12, h:0.05 },
  { tipo:"I", x:0.79, y:0.33, w:0.10, h:0.05 },

  { tipo:"D", x:0.65, y:0.48, w:0.12, h:0.05 },
  { tipo:"I", x:0.79, y:0.48, w:0.10, h:0.05 }
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
// INICIAR
// =====================================

window.addEventListener(
  "load",
  iniciarSistema
);

window.addEventListener(
  "resize",
  recriarInterface
);

window.addEventListener(
  "orientationchange",
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

  limparCampos();

  await carregarImagem();

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

    canvas.style.width =
      largura + "px";

    canvas.style.height =
      altura + "px";

    canvas.style.touchAction = "none";
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

  canvas.addEventListener(
    "mouseup",
    pararDesenho
  );

  canvas.addEventListener(
    "mouseleave",
    pararDesenho
  );

  canvas.addEventListener(
    "touchstart",
    iniciarDesenho
  );

  canvas.addEventListener(
    "touchmove",
    desenharTouch
  );

  canvas.addEventListener(
    "touchend",
    pararDesenho
  );
}

// =====================================
// DESENHO
// =====================================

function iniciarDesenho(e){

  estado.desenhando = true;

  const pos = obterPosicao(e);

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

  const pos = obterPosicao(e);

  if(
    estaSobreCampo(
      pos.x,
      pos.y
    )
  ) return;

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

  if(
    e.touches &&
    e.touches.length > 0
  ){

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

function estaSobreCampo(x,y){

  return areasTexto.some(area=>{

    const ax =
      area.x *
      elementos.canvasBase.width;

    const ay =
      area.y *
      elementos.canvasBase.height;

    const aw =
      area.w *
      elementos.canvasBase.width;

    const ah =
      area.h *
      elementos.canvasBase.height;

    return (
      x >= ax &&
      x <= ax + aw &&
      y >= ay &&
      y <= ay + ah
    );
  });
}

function criarCampos(){

  limparCampos();

  areasTexto.forEach(area=>{

    let campo;

    if(area.tipo === "D"){

      campo =
        document.createElement("input");

      campo.type = "text";

      campo.placeholder =
        "dd/mm/aaaa";

    }else{

      campo =
        document.createElement("select");

      for(let i=0;i<=10;i++){

        const opt =
          document.createElement("option");

        opt.value = i;

        opt.text = i;

        campo.appendChild(opt);
      }
    }

    campo.classList.add("campoMapa");

    campo.style.left =
      (area.x * 100) + "%";

    campo.style.top =
      (area.y * 100) + "%";

    campo.style.width =
      (area.w * 100) + "%";

    campo.style.height =
      (area.h * 100) + "%";

    campo.addEventListener(
      "input",
      salvarLocalStorage
    );

    campo.addEventListener(
      "change",
      salvarLocalStorage
    );

    elementos.formulario.appendChild(campo);
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

  salvarLocalStorage();
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
// LOCAL STORAGE
// =====================================

function salvarLocalStorage(){

  const campos =
    [
      ...document.querySelectorAll(".campoMapa")
    ];

  const dadosCampos =
    campos.map(c=>c.value);

  const dados = {

    nomePaciente:
      elementos.nomePaciente.value,

    campos:
      dadosCampos,

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

    if(
      dados.campos &&
      dados.campos[index] !== undefined
    ){

      campo.value =
        dados.campos[index];
    }
  });

  if(dados.desenho){

    const img = new Image();

    img.onload = ()=>{

      ctxPaint.clearRect(
        0,
        0,
        elementos.canvasPaint.width,
        elementos.canvasPaint.height
      );

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

  if(dados.modo){

    estado.modo =
      dados.modo;
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

  pdf.setFontSize(16);

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

// =====================================
// AUTOSAVE
// =====================================

setInterval(
  salvarLocalStorage,
  5000
);

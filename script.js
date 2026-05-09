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
// POSIÇÕES
// =====================================

const areasTexto = [

  { tipo:"D", x:0.12, y:0.30 },
  { tipo:"I", x:0.12, y:0.35 },

  { tipo:"D", x:0.12, y:0.45 },
  { tipo:"I", x:0.12, y:0.50 },

  { tipo:"D", x:0.12, y:0.60 },
  { tipo:"I", x:0.12, y:0.65 },

  { tipo:"D", x:0.12, y:0.75 },
  { tipo:"I", x:0.12, y:0.80 },

  { tipo:"D", x:0.47, y:0.30 },
  { tipo:"I", x:0.47, y:0.35 },

  { tipo:"D", x:0.47, y:0.45 },
  { tipo:"I", x:0.47, y:0.50 },

  { tipo:"D", x:0.47, y:0.60 },
  { tipo:"I", x:0.47, y:0.65 },

  { tipo:"D", x:0.47, y:0.75 },
  { tipo:"I", x:0.47, y:0.80 },

  { tipo:"D", x:0.82, y:0.30 },
  { tipo:"I", x:0.82, y:0.35 },

  { tipo:"D", x:0.82, y:0.45 },
  { tipo:"I", x:0.82, y:0.50 },

  { tipo:"D", x:0.82, y:0.60 },
  { tipo:"I", x:0.82, y:0.65 },

  { tipo:"D", x:0.82, y:0.75 },
  { tipo:"I", x:0.82, y:0.80 }

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

  carregarPosicoes();

  await carregarImagem();

  configurarEventos();

  carregarLocalStorage();
}

// =====================================
// RECRIAR
// =====================================

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

  if(
    e.target.classList.contains(
      "campoMapa"
    )
  ) return;

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

  areasTexto.forEach((area,index)=>{

    let campo;

    if(area.tipo === "D"){

      campo =
        document.createElement("input");

      campo.type = "date";

      campo.classList.add(
        "campoMapa",
        "campoData"
      );
    }

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

    tornarArrastavel(
      campo,
      area,
      index
    );

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
// DRAG
// =====================================

function tornarArrastavel(
  elemento,
  area
){

  let arrastando = false;

  elemento.addEventListener(
    "mousedown",
    iniciar
  );

  elemento.addEventListener(
    "touchstart",
    iniciar,
    { passive:false }
  );

  function iniciar(e){

    arrastando = true;

    e.preventDefault();

    window.addEventListener(
      "mousemove",
      mover
    );

    window.addEventListener(
      "touchmove",
      mover,
      { passive:false }
    );

    window.addEventListener(
      "mouseup",
      parar
    );

    window.addEventListener(
      "touchend",
      parar
    );
  }

  function mover(e){

    if(!arrastando) return;

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

    const rect =
      elementos.container.getBoundingClientRect();

    const x =
      (clientX - rect.left) /
      rect.width;

    const y =
      (clientY - rect.top) /
      rect.height;

    area.x = x;
    area.y = y;

    elemento.style.left =
      (x * 100) + "%";

    elemento.style.top =
      (y * 100) + "%";

    salvarPosicoes();
  }

  function parar(){

    arrastando = false;
  }
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

    restaurarDesenho(
      dados.desenho
    );
  }
}

// =====================================
// POSIÇÕES
// =====================================

function salvarPosicoes(){

  localStorage.setItem(
    "mapaDorPosicoes",
    JSON.stringify(areasTexto)
  );
}

function carregarPosicoes(){

  const dados =
    localStorage.getItem(
      "mapaDorPosicoes"
    );

  if(!dados) return;

  const posicoes =
    JSON.parse(dados);

  posicoes.forEach((p,i)=>{

    areasTexto[i].x = p.x;
    areasTexto[i].y = p.y;
  });
}

// =====================================
// RESTAURAR
// =====================================

function restaurarDesenho(base64){

  if(!base64) return;

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

  img.src = base64;
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
        scale:4
      }
    );

  const larguraPDF = 190;

  const alturaPDF =
    (
      captura.height *
      larguraPDF
    ) /
    captura.width;

  pdf.addImage(
    captura.toDataURL("image/png"),
    "PNG",
    10,
    10,
    larguraPDF,
    alturaPDF
  );

  pdf.save(
    "mapa-da-dor.pdf"
  );
}

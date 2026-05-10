const areasTexto = [

  { tipo:"D", x:0.12, y:0.30 },
  { tipo:"I", x:0.069, y:0.329 },

  { tipo:"D", x:0.112, y:0.405 },
  { tipo:"I", x:0.060, y:0.434 },

  { tipo:"D", x:0.125, y:0.642 },
  { tipo:"I", x:0.075, y:0.672 },

  { tipo:"D", x:0.125, y:0.770 },
  { tipo:"I", x:0.075, y:0.797 },

  { tipo:"D", x:0.47, y:0.30 },
  { tipo:"I", x:0.422, y:0.329 },

  { tipo:"D", x:0.468, y:0.436 },
  { tipo:"I", x:0.418, y:0.466 },

  { tipo:"D", x:0.486, y:0.554 },
  { tipo:"I", x:0.436, y:0.581 },

  { tipo:"D", x:0.440, y:0.656 },
  { tipo:"I", x:0.390, y:0.684 },

  { tipo:"D", x:0.868, y:0.291 },
  { tipo:"I", x:0.818, y:0.322 },

  { tipo:"D", x:0.880, y:0.394 },
  { tipo:"I", x:0.836, y:0.425 },

  { tipo:"D", x:0.858, y:0.563 },
  { tipo:"I", x:0.808, y:0.595 },

  { tipo:"D", x:0.852, y:0.693 },
  { tipo:"I", x:0.802, y:0.722 }

];

const canvasBase =
  document.getElementById("canvasBase");

const canvasPaint =
  document.getElementById("canvasPaint");

const formulario =
  document.getElementById("formulario");

const container =
  document.getElementById("mapaContainer");

const ctxBase =
  canvasBase.getContext("2d");

const ctxPaint =
  canvasPaint.getContext("2d");

let desenhando = false;

let ultimoX = 0;
let ultimoY = 0;

let modo = "pintar";

let zoom = 1;

const imagem = new Image();

imagem.src = "./img/pessoa.png";

imagem.onload = ()=>{

  configurarCanvas();

  criarCampos();

  definirModo("pintar");
};

function configurarCanvas(){

  const proporcao =
    imagem.height /
    imagem.width;

  const largura = 700;

  const altura =
    largura * proporcao;

  container.style.height =
    altura + "px";

  canvasBase.width = largura;
  canvasBase.height = altura;

  canvasPaint.width = largura;
  canvasPaint.height = altura;

  ctxBase.clearRect(
    0,
    0,
    largura,
    altura
  );

  ctxBase.drawImage(
    imagem,
    0,
    0,
    largura,
    altura
  );
}

function criarCampos(){

  formulario.innerHTML = "";

  areasTexto.forEach(area=>{

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

    formulario.appendChild(campo);
  });
}

function definirModo(novoModo){

  modo = novoModo;

  document
    .querySelectorAll(".botoes button")
    .forEach(btn=>{

      btn.classList.remove(
        "botaoAtivo"
      );
    });

  if(modo === "pintar"){

    document
      .getElementById("btnPintar")
      .classList.add("botaoAtivo");
  }

  if(modo === "apagar"){

    document
      .getElementById("btnApagar")
      .classList.add("botaoAtivo");
  }
}

function zoomMais(){

  zoom += 0.1;

  aplicarZoom();
}

function zoomMenos(){

  zoom -= 0.1;

  if(zoom < 0.5){

    zoom = 0.5;
  }

  aplicarZoom();
}

function aplicarZoom(){

  container.style.transform =
    `scale(${zoom})`;
}

function pegarPosicao(e){

  const rect =
    canvasPaint.getBoundingClientRect();

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
        canvasPaint.width /
        rect.width
      ),

    y:
      (
        clientY - rect.top
      ) *
      (
        canvasPaint.height /
        rect.height
      )
  };
}

function iniciarDesenho(e){

  e.preventDefault();

  desenhando = true;

  const pos =
    pegarPosicao(e);

  ultimoX = pos.x;
  ultimoY = pos.y;
}

function moverDesenho(e){

  if(!desenhando) return;

  e.preventDefault();

  const pos =
    pegarPosicao(e);

  if(modo === "pintar"){

    ctxPaint.strokeStyle = "#000";

    ctxPaint.lineWidth = 3;

    ctxPaint.lineCap = "round";

    ctxPaint.beginPath();

    ctxPaint.moveTo(
      ultimoX,
      ultimoY
    );

    ctxPaint.lineTo(
      pos.x,
      pos.y
    );

    ctxPaint.stroke();

  }else{

    ctxPaint.clearRect(
      pos.x - 10,
      pos.y - 10,
      20,
      20
    );
  }

  ultimoX = pos.x;
  ultimoY = pos.y;
}

function finalizarDesenho(){

  desenhando = false;
}

canvasPaint.addEventListener(
  "mousedown",
  iniciarDesenho
);

canvasPaint.addEventListener(
  "mousemove",
  moverDesenho
);

window.addEventListener(
  "mouseup",
  finalizarDesenho
);

canvasPaint.addEventListener(
  "touchstart",
  iniciarDesenho,
  { passive:false }
);

canvasPaint.addEventListener(
  "touchmove",
  moverDesenho,
  { passive:false }
);

window.addEventListener(
  "touchend",
  finalizarDesenho
);

function limparTudo(){

  ctxPaint.clearRect(
    0,
    0,
    canvasPaint.width,
    canvasPaint.height
  );

  document
    .getElementById("btnLimpar")
    .classList.add("botaoAtivo");

  setTimeout(()=>{

    document
      .getElementById("btnLimpar")
      .classList.remove("botaoAtivo");

  },500);
}

async function salvarPDF(){

  document
    .getElementById("btnPDF")
    .classList.add("botaoAtivo");

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
      container,
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

  setTimeout(()=>{

    document
      .getElementById("btnPDF")
      .classList.remove("botaoAtivo");

  },500);
}

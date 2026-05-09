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
  { tipo:"I", x:0.06946428571428571, y:0.3295376385173863 },

  { tipo:"D", x:0.11232142857142857, y:0.40573577620014883 },
  { tipo:"I", x:0.060892857142857144, y:0.4345675039720049 },

  { tipo:"D", x:0.12517857142857142, y:0.642567825754681 },
  { tipo:"I", x:0.07517857142857143, y:0.6724292580898176 },

  { tipo:"D", x:0.12517857142857142, y:0.7702511916014722 },
  { tipo:"I", x:0.07517857142857143, y:0.7970235102467671 },

  { tipo:"D", x:0.47, y:0.30 },
  { tipo:"I", x:0.42232142857142857, y:0.3295376385173863 },

  { tipo:"D", x:0.4680357142857143, y:0.43662691309856605 },
  { tipo:"I", x:0.4180357142857143, y:0.4664883454337027 },

  { tipo:"D", x:0.48660714285714285, y:0.5540132333125516 },
  { tipo:"I", x:0.43660714285714286, y:0.5818152565211271 },

  { tipo:"D", x:0.44089285714285714, y:0.6569836896406089 },
  { tipo:"I", x:0.39089285714285715, y:0.6847857128491844 },

  { tipo:"D", x:0.8680357142857142, y:0.29143856967600507 },
  { tipo:"I", x:0.8180357142857143, y:0.3223297065744223 },

  { tipo:"D", x:0.8808928571428571, y:0.3944090260040625 },
  { tipo:"I", x:0.8366071428571429, y:0.42530016290247974 },

  { tipo:"D", x:0.8580357142857142, y:0.5632805743820767 },
  { tipo:"I", x:0.8080357142857143, y:0.5952014158437745 },

  { tipo:"D", x:0.8523214285714286, y:0.6930233493554291 },
  { tipo:"I", x:0.8023214285714285, y:0.7228847816905657 }

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

  atualizarBotaoAtivo();
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
// BOTÃO ATIVO
// =====================================

function atualizarBotaoAtivo(){

  document
    .querySelectorAll(".acaoBtn")
    .forEach(btn=>{

      btn.classList.remove(
        "ativo"
      );
    });

  if(estado.modo === "pintar"){

    document
      .getElementById("pintar")
      .classList.add("ativo");
  }

  if(estado.modo === "apagar"){

    document
      .getElementById("apagar")
      .classList.add("ativo");
  }
}

// =====================================
// MODOS
// =====================================

function definirModo(modo){

  estado.modo = modo;

  atualizarBotaoAtivo();
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

  document
    .querySelectorAll(".campoMapa")
    .forEach(campo=>{

      if(campo.tagName === "SELECT"){

        campo.selectedIndex = 0;

      }else{

        campo.value = "";
      }
    });

  elementos.nomePaciente.value =
    "";
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

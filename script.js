// ================= DADOS =================
const grupos = [

  { x:0.12, y:0.31 },
  { x:0.112, y:0.41 },
  { x:0.125, y:0.65 },
  { x:0.125, y:0.78 },

  { x:0.47, y:0.31 },
  { x:0.468, y:0.44 },
  { x:0.486, y:0.56 },
  { x:0.440, y:0.67 },

  { x:0.868, y:0.30 },
  { x:0.880, y:0.41 },
  { x:0.858, y:0.58 },
  { x:0.852, y:0.71 }

];

// ================= ELEMENTOS =================
const canvasBase =
  document.getElementById("canvasBase");

const canvasPaint =
  document.getElementById("canvasPaint");

const formulario =
  document.getElementById("formulario");

const mapaContainer =
  document.getElementById("mapaContainer");

const ctxBase =
  canvasBase.getContext("2d");

const ctxPaint =
  canvasPaint.getContext("2d");

// ================= ESTADO =================
let desenhando = false;

let ultimoX = 0;
let ultimoY = 0;

let modo = "";

let zoom = 1;

// ================= IMAGEM =================
const imagem = new Image();

imagem.src = "./img/pessoa.png";

// ================= INIT =================
window.addEventListener(
  "load",
  init
);

function init(){

  configurarCanvas();

  criarCampos();

  preencherData();

}

// ================= CANVAS =================
function configurarCanvas(){

  const w = 700;
  const h = 842;

  canvasBase.width = w;
  canvasBase.height = h;

  canvasPaint.width = w;
  canvasPaint.height = h;

  function desenharImagem(){

    ctxBase.clearRect(
      0,
      0,
      w,
      h
    );

    ctxBase.drawImage(
      imagem,
      0,
      0,
      w,
      h
    );

  }

  imagem.onload =
    desenharImagem;

  if(imagem.complete){

    desenharImagem();

  }

}

// ================= CAMPOS =================
function criarCampos(){

  formulario.innerHTML = "";

  grupos.forEach(g => {

    const div =
      document.createElement("div");

    div.className =
      "grupoCampos";

    div.style.left =
      (g.x * 100) + "%";

    div.style.top =
      (g.y * 100) + "%";

    div.innerHTML = `

      <div>
        D:
        <input type="date">
      </div>

      <div>
        I:
        <select>
          ${Array.from(
            {length:11},
            (_,i)=>`
              <option>${i}</option>
            `
          ).join("")}
        </select>
      </div>

    `;

    formulario.appendChild(div);

  });

}

// ================= DATA =================
function preencherData(){

  const el =
    document.getElementById(
      "dataPreenchimento"
    );

  if(el){

    el.value =
      new Date()
      .toISOString()
      .split("T")[0];

  }

}

// ================= MODOS =================
function definirModo(m){

  modo = m;

  document
    .querySelectorAll(
      ".botoes button"
    )
    .forEach(b =>
      b.classList.remove(
        "botaoAtivo"
      )
    );

  const id =
    modo === "pintar"
      ? "btnPintar"
      : "btnApagar";

  document
    .getElementById(id)
    ?.classList.add(
      "botaoAtivo"
    );

}

function desativarModo(){

  modo = "";

  document
    .querySelectorAll(
      ".botoes button"
    )
    .forEach(b =>
      b.classList.remove(
        "botaoAtivo"
      )
    );

  document
    .getElementById(
      "btnParar"
    )
    ?.classList.add(
      "botaoAtivo"
    );

}

// ================= LIMPAR =================
function limparTudo(){

  ctxPaint.clearRect(
    0,
    0,
    canvasPaint.width,
    canvasPaint.height
  );

}

// ================= POS =================
function pos(e){

  const r =
    canvasPaint
    .getBoundingClientRect();

  const x =
    e.touches
      ? e.touches[0].clientX
      : e.clientX;

  const y =
    e.touches
      ? e.touches[0].clientY
      : e.clientY;

  return {

    x:
      (x-r.left) *
      (
        canvasPaint.width /
        r.width
      ),

    y:
      (y-r.top) *
      (
        canvasPaint.height /
        r.height
      )

  };

}

// ================= DESENHO =================
function down(e){

  if(
    e.touches &&
    e.touches.length > 1
  ){
    return;
  }

  if(
    modo !== "pintar" &&
    modo !== "apagar"
  ){
    return;
  }

  desenhando = true;

  const p = pos(e);

  ultimoX = p.x;
  ultimoY = p.y;

}

function move(e){

  if(
    e.touches &&
    e.touches.length > 1
  ){
    return;
  }

  if(!desenhando){
    return;
  }

  e.preventDefault();

  const p = pos(e);

  ctxPaint.strokeStyle =
    "#000";

  ctxPaint.lineWidth = 3;

  ctxPaint.lineCap =
    "round";

  if(modo === "pintar"){

    ctxPaint.beginPath();

    ctxPaint.moveTo(
      ultimoX,
      ultimoY
    );

    ctxPaint.lineTo(
      p.x,
      p.y
    );

    ctxPaint.stroke();

  }

  else if(
    modo === "apagar"
  ){

    ctxPaint.clearRect(
      p.x - 10,
      p.y - 10,
      20,
      20
    );

  }

  ultimoX = p.x;
  ultimoY = p.y;

}

function up(){

  desenhando = false;

}

// ================= EVENTOS =================
canvasPaint.addEventListener(
  "mousedown",
  down
);

canvasPaint.addEventListener(
  "mousemove",
  move
);

window.addEventListener(
  "mouseup",
  up
);

canvasPaint.addEventListener(
  "touchstart",
  down,
  { passive:false }
);

canvasPaint.addEventListener(
  "touchmove",
  move,
  { passive:false }
);

window.addEventListener(
  "touchend",
  up
);

// ================= ZOOM =================
function aplicarZoom(){

  mapaContainer.style.transform =
    `scale(${zoom})`;

}

function zoomMais(){

  zoom += 0.1;

  aplicarZoom();

}

function zoomMenos(){

  zoom =
    Math.max(
      0.5,
      zoom - 0.1
    );

  aplicarZoom();

}

function resetZoom(){

  zoom = 1;

  aplicarZoom();

}

// ================= PINCH =================
let distanciaInicial = 0;

let zoomInicial = 1;

let pinchZoomAtivo = false;

function distanciaToque(t1,t2){

  const dx =
    t1.clientX - t2.clientX;

  const dy =
    t1.clientY - t2.clientY;

  return Math.sqrt(
    dx*dx + dy*dy
  );

}

mapaContainer.addEventListener(
  "touchstart",
  function(e){

    if(e.touches.length === 2){

      pinchZoomAtivo = true;

      distanciaInicial =
        distanciaToque(
          e.touches[0],
          e.touches[1]
        );

      zoomInicial = zoom;

    }

  },
  { passive:false }
);

mapaContainer.addEventListener(
  "touchmove",
  function(e){

    if(
      pinchZoomAtivo &&
      e.touches.length === 2
    ){

      e.preventDefault();

      const novaDistancia =
        distanciaToque(
          e.touches[0],
          e.touches[1]
        );

      zoom =
        zoomInicial *
        (
          novaDistancia /
          distanciaInicial
        );

      zoom = Math.max(
        0.5,
        Math.min(3,zoom)
      );

      aplicarZoom();

    }

  },
  { passive:false }
);

mapaContainer.addEventListener(
  "touchend",
  function(e){

    if(e.touches.length < 2){

      pinchZoomAtivo = false;

    }

  }
);

// ================= GIF =================
async function salvarGIF(){

  try{

    const canvas =
      await html2canvas(
        document.body,
        {
          backgroundColor:"#fff",
          scale:2
        }
      );

    const gif = new GIF({

      workers:2,
      quality:10,

      width:canvas.width,
      height:canvas.height

    });

    gif.addFrame(
      canvas,
      {delay:700}
    );

    gif.on(
      "finished",
      function(blob){

        const url =
          URL.createObjectURL(blob);

        const a =
          document.createElement("a");

        a.href = url;

        a.download =
          "mapa_dor.gif";

        a.click();

      }
    );

    gif.render();

  }

  catch(err){

    alert("Erro GIF");

  }

}

// ================= PDF =================
async function salvarPDF(){

  try{

    const nome =
      document
      .getElementById("nome")
      ?.value ||
      "sem_nome";

    const canvas =
      await html2canvas(
        document.body,
        {
          backgroundColor:"#fff",
          scale:2
        }
      );

    const img =
      canvas.toDataURL(
        "image/png"
      );

    const pdf =
      new jspdf.jsPDF({

        orientation:"portrait",

        unit:"px",

        format:[
          canvas.width,
          canvas.height
        ]

      });

    pdf.addImage(
      img,
      "PNG",
      0,
      0,
      canvas.width,
      canvas.height
    );

    pdf.save(
      `mapa_dor_${nome}.pdf`
    );

  }

  catch(err){

    alert("Erro PDF");

  }

}

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
const canvasBase = document.getElementById("canvasBase");
const canvasPaint = document.getElementById("canvasPaint");
const formulario = document.getElementById("formulario");

const ctxBase = canvasBase.getContext("2d");
const ctxPaint = canvasPaint.getContext("2d");

// ================= ESTADO =================
let desenhando = false;
let ultimoX = 0;
let ultimoY = 0;

let modo = ""; // começa desligado
let zoom = 1;

// ================= IMAGEM =================
const imagem = new Image();

imagem.crossOrigin = "anonymous";
imagem.src = "./img/pessoa.png";

// ================= INICIALIZAÇÃO =================
window.addEventListener("load", init);

function init() {

  configurarCanvas();
  criarCampos();
  preencherData();

}

// ================= CANVAS =================
function configurarCanvas() {

  const w = 700;
  const h = 842;

  canvasBase.width = w;
  canvasBase.height = h;

  canvasPaint.width = w;
  canvasPaint.height = h;

  ctxBase.clearRect(0,0,w,h);

  imagem.onload = () => {

    ctxBase.drawImage(
      imagem,
      0,
      0,
      w,
      h
    );

  };

  if(imagem.complete){

    ctxBase.drawImage(
      imagem,
      0,
      0,
      w,
      h
    );

  }

}

// ================= CAMPOS =================
function criarCampos() {

  formulario.innerHTML = "";

  grupos.forEach(g => {

    const div = document.createElement("div");

    div.className = "grupoCampos";

    div.style.left = (g.x * 100) + "%";
    div.style.top = (g.y * 100) + "%";

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
            (_,i)=>`<option>${i}</option>`
          ).join("")}
        </select>
      </div>
    `;

    formulario.appendChild(div);

  });

}

// ================= DATA =================
function preencherData() {

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

// ================= MODO =================
function desativarModo() {

  modo = "";

  document
    .querySelectorAll(".botoes button")
    .forEach(b =>
      b.classList.remove("botaoAtivo")
    );

  document
    .getElementById("btnParar")
    ?.classList.add("botaoAtivo");

}

// ================= DESATIVAR =================
function desativarModo() {

  modo = "";

  document
    .querySelectorAll(".botoes button")
    .forEach(b =>
      b.classList.remove("botaoAtivo")
    );

}

// ================= LIMPAR =================
function limparTudo() {

  ctxPaint.clearRect(
    0,
    0,
    canvasPaint.width,
    canvasPaint.height
  );

}

// ================= POSIÇÃO =================
function pos(e){

  const r =
    canvasPaint.getBoundingClientRect();

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
      (canvasPaint.width/r.width),

    y:
      (y-r.top) *
      (canvasPaint.height/r.height)

  };

}

// ================= INICIAR DESENHO =================
function down(e){

  // bloqueia desenho quando desligado
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

// ================= MOVIMENTO =================
function move(e){

  if(!desenhando) return;

  e.preventDefault();

  const p = pos(e);

  ctxPaint.strokeStyle = "#000";
  ctxPaint.lineWidth = 3;
  ctxPaint.lineCap = "round";

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

  } else if(modo === "apagar") {

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

// ================= FINALIZAR =================
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
  {passive:false}
);

canvasPaint.addEventListener(
  "touchmove",
  move,
  {passive:false}
);

window.addEventListener(
  "touchend",
  up
);

// ================= GIF =================
async function salvarGIF() {

  try {

    const container =
      document.getElementById(
        "mapaContainer"
      );

    const canvasCaptura =
      await html2canvas(container, {

        backgroundColor:"#fff",
        scale:2,
        useCORS:true,
        logging:false

      });

    const gif = new GIF({

      workers:2,
      quality:10,

      width:canvasCaptura.width,
      height:canvasCaptura.height

    });

    gif.addFrame(
      canvasCaptura,
      {delay:700}
    );

    gif.addFrame(
      canvasCaptura,
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

  } catch(err){

    console.error(err);

    alert("Erro ao gerar GIF");

  }

}

// ================= PDF / DRIVE =================
async function salvarPDF() {

  try {

    const nome =
      document.getElementById("nome")
      ?.value || "sem_nome";

    const container =
      document.getElementById(
        "mapaContainer"
      );

    const canvas =
      await html2canvas(container, {

        backgroundColor:"#fff",
        scale:2,
        useCORS:true,
        logging:false

      });

    const img =
      canvas.toDataURL("image/png");

    // download local
    const link =
      document.createElement("a");

    link.href = img;

    link.download =
      `mapa_dor_${nome}.png`;

    link.click();

    // upload drive
    const URL =
      "https://script.google.com/macros/s/AKfycbxpq8Qca-JEN9ow4uAD4bCLs1TTotxb44ZAVVss9zOqUrzfxG71jE5UtOyPo6_pIOE_zQ/exec";

    const resposta =
      await fetch(URL, {

        method:"POST",

        body:JSON.stringify({

          nome,
          imagem:img

        })

      });

    const texto =
      await resposta.text();

    const resultado =
      JSON.parse(texto);

    if(resultado.status === "ok"){

      alert(
        "✔ Salvo no Drive com sucesso"
      );

      console.log(
        resultado.url
      );

    } else {

      alert(
        "Erro ao salvar"
      );

    }

  } catch(err){

    console.error(err);

    alert("Erro ao salvar");

  }

}

// ================= ZOOM =================
function aplicarZoom(){

  const mapa =
    document.getElementById(
      "mapaContainer"
    );

  mapa.style.transform =
    `scale(${zoom})`;

  mapa.style.transformOrigin =
    "top center";

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

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

const canvasBase = document.getElementById("canvasBase");
const canvasPaint = document.getElementById("canvasPaint");
const formulario = document.getElementById("formulario");

const ctxBase = canvasBase.getContext("2d");
const ctxPaint = canvasPaint.getContext("2d");

let desenhando = false;
let ultimoX = 0;
let ultimoY = 0;
let modo = "pintar";

const imagem = new Image();
imagem.src = "/mapadador/img/pessoa.png";

window.addEventListener("load", init);

function init() {
  configurarCanvas();
  criarCampos();
  preencherData();
}

function configurarCanvas() {
  const w = 700;
  const h = 842;

  canvasBase.width = w;
  canvasBase.height = h;
  canvasPaint.width = w;
  canvasPaint.height = h;

  if (imagem.complete) {
    ctxBase.drawImage(imagem, 0, 0, w, h);
  } else {
    imagem.onload = () => {
      ctxBase.drawImage(imagem, 0, 0, w, h);
    };
  }
}

function criarCampos() {
  formulario.innerHTML = "";

  grupos.forEach(g => {
    const div = document.createElement("div");
    div.className = "grupoCampos";

    div.style.left = (g.x * 100) + "%";
    div.style.top = (g.y * 100) + "%";

    div.innerHTML = `
      <div>D: <input type="date"></div>
      <div>I: <select>${Array.from({length:11},(_,i)=>`<option>${i}</option>`).join("")}</select></div>
    `;

    formulario.appendChild(div);
  });
}

function preencherData() {
  document.getElementById("dataPreenchimento").value =
    new Date().toISOString().split("T")[0];
}

function definirModo(m) {
  modo = m;

  document.querySelectorAll(".botoes button")
    .forEach(b => b.classList.remove("botaoAtivo"));

  const id = m === "pintar" ? "btnPintar" : "btnApagar";

  document.getElementById(id)?.classList.add("botaoAtivo");
}
  if (m === "apagar") {
    document.querySelector(".botoes button:nth-child(2)")
      ?.classList.add("botaoAtivo");
  }
}
}

function limparTudo() {
  ctxPaint.clearRect(0,0,canvasPaint.width,canvasPaint.height);
}

// DESENHO
function pos(e){
  const r = canvasPaint.getBoundingClientRect();
  const x = e.touches ? e.touches[0].clientX : e.clientX;
  const y = e.touches ? e.touches[0].clientY : e.clientY;

  return {
    x:(x-r.left)*(canvasPaint.width/r.width),
    y:(y-r.top)*(canvasPaint.height/r.height)
  };
}

function down(e){
  desenhando = true;
  const p = pos(e);
  ultimoX = p.x;
  ultimoY = p.y;
}

function move(e){
  if(!desenhando) return;

  const p = pos(e);

  ctxPaint.strokeStyle="#000";
  ctxPaint.lineWidth=3;

  if(modo==="pintar"){
    ctxPaint.beginPath();
    ctxPaint.moveTo(ultimoX,ultimoY);
    ctxPaint.lineTo(p.x,p.y);
    ctxPaint.stroke();
  } else {
    ctxPaint.clearRect(p.x-10,p.y-10,20,20);
  }

  ultimoX=p.x;
  ultimoY=p.y;
}

function up(){ desenhando=false; }

canvasPaint.addEventListener("mousedown",down);
canvasPaint.addEventListener("mousemove",move);
window.addEventListener("mouseup",up);

canvasPaint.addEventListener("touchstart",down,{passive:false});
canvasPaint.addEventListener("touchmove",move,{passive:false});
window.addEventListener("touchend",up);

// SALVAR (mantido base)
async function salvarPDF() {
  try {

    const nome = document.getElementById("nome")?.value || "sem_nome";
    const data = document.getElementById("dataPreenchimento")?.value || "";

    // 🔥 1. CAPTURAR MAPA (canvas + desenho)
    const canvasFinal = document.createElement("canvas");
    canvasFinal.width = canvasBase.width;
    canvasFinal.height = canvasBase.height;

    const ctx = canvasFinal.getContext("2d");

    // base (imagem)
    ctx.drawImage(canvasBase, 0, 0);

    // desenho do usuário
    ctx.drawImage(canvasPaint, 0, 0);

    // 🔥 2. GERAR IMAGEM (PNG)
    const imagemBase64 = canvasFinal.toDataURL("image/png");

    // 🔥 3. DOWNLOAD LOCAL
    const link = document.createElement("a");
    link.href = imagemBase64;
    link.download = `mapa_dor_${nome}.png`;
    link.click();

    // 🔥 4. ENVIAR PARA GOOGLE DRIVE
    const resposta = await fetch("https://script.google.com/macros/s/AKfycbxpq8Qca-JEN9ow4uAD4bCLs1TTotxb44ZAVVss9zOqUrzfxG71jE5UtOyPo6_pIOE_zQ/exec", {
      method: "POST",
      body: JSON.stringify({
        nome,
        data,
        imagem: imagemBase64
      })
    });

    const texto = await resposta.text();
    const resultado = JSON.parse(texto);

    if (resultado.status === "ok") {
      alert("PDF salvo localmente e enviado ao Drive!");
    } else {
      alert("Erro ao enviar ao Drive: " + resultado.message);
    }

  } catch (err) {
    console.error(err);
    alert("Erro ao gerar PDF");
  }
}

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
const container = document.getElementById("mapaContainer");

const ctxBase = canvasBase.getContext("2d");
const ctxPaint = canvasPaint.getContext("2d");

// ================= ESTADO =================
let desenhando = false;
let ultimoX = 0;
let ultimoY = 0;
let modo = "pintar";
let zoom = 1;

// ================= IMAGEM =================
const imagem = new Image();
imagem.src = "./img/pessoa.png";

// ================= INICIALIZAÇÃO SEGURA =================
window.addEventListener("load", () => {
  iniciarSistema();
});

imagem.onload = iniciarSistema;
imagem.onerror = iniciarSistema;

function iniciarSistema() {
  configurarCanvas();
  criarCampos();
  definirModo("pintar");
  preencherDataAtual();
}

// ================= CANVAS =================
function configurarCanvas() {
  const largura = 700;
  const altura = 842;

  canvasBase.width = largura;
  canvasBase.height = altura;
  canvasPaint.width = largura;
  canvasPaint.height = altura;

  ctxBase.clearRect(0, 0, largura, altura);

  try {
    ctxBase.drawImage(imagem, 0, 0, largura, altura);
  } catch (e) {
    console.warn("Imagem não carregou");
  }
}

// ================= CAMPOS =================
function criarCampos() {
  formulario.innerHTML = "";

  grupos.forEach(g => {
    const box = document.createElement("div");
    box.className = "grupoCampos";

    box.style.left = (g.x * 100) + "%";
    box.style.top = (g.y * 100) + "%";

    box.innerHTML = `
      <div class="linhaCampo">
        <strong>D:</strong>
        <input type="date" class="campoMapa campoData">
      </div>
      <div class="linhaCampo">
        <strong>I:</strong>
        <select class="campoMapa campoIntensidade">
          ${Array.from({length:11}, (_,i)=>`<option>${i}</option>`).join("")}
        </select>
      </div>
    `;

    formulario.appendChild(box);
  });
}

// ================= DATA =================
function preencherDataAtual() {
  const el = document.getElementById("dataPreenchimento");
  if (el) {
    el.value = new Date().toISOString().split("T")[0];
  }
}

// ================= MODO =================
function definirModo(m) {
  modo = m;

  document.querySelectorAll(".botoes button")
    .forEach(b => b.classList.remove("botaoAtivo"));

  const btn = document.getElementById(
    m === "pintar" ? "btnPintar" : "btnApagar"
  );

  if (btn) btn.classList.add("botaoAtivo");
}

// ================= ZOOM =================
function zoomMais() {
  zoom += 0.1;
  aplicarZoom();
}

function zoomMenos() {
  zoom = Math.max(0.5, zoom - 0.1);
  aplicarZoom();
}

function aplicarZoom() {
  container.style.transform = `scale(${zoom})`;
}

// ================= POSIÇÃO =================
function pegarPosicao(e) {
  const rect = canvasPaint.getBoundingClientRect();

  const x = e.touches ? e.touches[0].clientX : e.clientX;
  const y = e.touches ? e.touches[0].clientY : e.clientY;

  return {
    x: (x - rect.left) * (canvasPaint.width / rect.width),
    y: (y - rect.top) * (canvasPaint.height / rect.height)
  };
}

// ================= DESENHO =================
function iniciar(e) {
  e.preventDefault();
  desenhando = true;

  const p = pegarPosicao(e);
  ultimoX = p.x;
  ultimoY = p.y;
}

function mover(e) {
  if (!desenhando) return;
  e.preventDefault();

  const p = pegarPosicao(e);

  ctxPaint.strokeStyle = "#000";
  ctxPaint.lineWidth = 3;
  ctxPaint.lineCap = "round";

  if (modo === "pintar") {
    ctxPaint.beginPath();
    ctxPaint.moveTo(ultimoX, ultimoY);
    ctxPaint.lineTo(p.x, p.y);
    ctxPaint.stroke();
  } else {
    ctxPaint.clearRect(p.x - 10, p.y - 10, 20, 20);
  }

  ultimoX = p.x;
  ultimoY = p.y;
}

function finalizar() {
  desenhando = false;
}

// mouse
canvasPaint.addEventListener("mousedown", iniciar);
canvasPaint.addEventListener("mousemove", mover);
window.addEventListener("mouseup", finalizar);

// touch
canvasPaint.addEventListener("touchstart", iniciar, { passive:false });
canvasPaint.addEventListener("touchmove", mover, { passive:false });
window.addEventListener("touchend", finalizar);

// ================= LIMPAR =================
function limparTudo() {
  ctxPaint.clearRect(0,0,canvasPaint.width,canvasPaint.height);
}

// ================= PDF =================
async function salvarPDF() {

  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF("p","mm","a4");

  const captura = await html2canvas(container, {
    scale: 3,
    useCORS: true,
    backgroundColor: "#fff"
  });

  const largura = 190;
  const altura = (captura.height * largura) / captura.width;

  pdf.addImage(
    captura.toDataURL("image/png"),
    "PNG",
    10,
    10,
    largura,
    altura
  );

  const nome =
    document.getElementById("nomePaciente")?.value || "paciente";

  const data = new Date().toISOString().replace(/[:.]/g,"-");

  pdf.save(`${nome}_mapa_${data}.pdf`);
}

// ================= GIF =================
async function salvarGIF() {

  const btn = document.getElementById("btnGIF");
  btn.classList.add("botaoAtivo");

  const captura = await html2canvas(container, {
    scale: 2,
    useCORS: true
  });

  gifshot.createGIF({
    images: [captura.toDataURL("image/png")],
    gifWidth: captura.width,
    gifHeight: captura.height,
    interval: 1
  }, (obj) => {

    if (!obj.error) {
      const a = document.createElement("a");
      a.href = obj.image;
      a.download = "mapa-da-dor.gif";
      a.click();
    }

    btn.classList.remove("botaoAtivo");
  });
}

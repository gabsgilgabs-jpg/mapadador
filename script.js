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
imagem.crossOrigin = "anonymous";

// fallback seguro (EDGE + mobile)
imagem.src = "./img/pessoa.png";

// ================= INICIALIZAÇÃO SEGURA =================
function iniciarSistema() {
  configurarCanvas();
  criarCampos();
  definirModo("pintar");
  preencherDataAtual();
}

// garante execução em qualquer navegador
window.addEventListener("load", () => {
  setTimeout(iniciarSistema, 150);
});

// fallback caso imagem demore ou falhe
imagem.onload = iniciarSistema;
imagem.onerror = iniciarSistema;

// ================= CANVAS =================
function configurarCanvas() {

  const largura = 700;
  const altura = 842;

  canvasBase.width = largura;
  canvasBase.height = altura;
  canvasPaint.width = largura;
  canvasPaint.height = altura;

  ctxBase.clearRect(0,0,largura,altura);

  try {
    ctxBase.drawImage(imagem, 0, 0, largura, altura);
  } catch (e) {
    console.warn("Imagem não carregou, continuando sem ela");
  }
}

// ================= CAMPOS =================
function criarCampos() {

  formulario.innerHTML = "";

  grupos.forEach(grupo => {

    const box = document.createElement("div");
    box.className = "grupoCampos";

    box.style.left = (grupo.x * 100) + "%";
    box.style.top = (grupo.y * 100) + "%";

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
  const hoje = new Date();
  const input = document.getElementById("dataPreenchimento");
  if (input) {
    input.value = hoje.toISOString().split("T")[0];
  }
}

// ================= MODOS =================
function definirModo(novoModo) {
  modo = novoModo;

  document.querySelectorAll(".botoes button")
    .forEach(b => b.classList.remove("botaoAtivo"));

  const ativo = document.getElementById(
    modo === "pintar" ? "btnPintar" : "btnApagar"
  );

  if (ativo) ativo.classList.add("botaoAtivo");
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

// ================= POSIÇÃO (MOUSE + TOUCH) =================
function pegarPosicao(e) {

  const rect = canvasPaint.getBoundingClientRect();

  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const clientY = e.touches ? e.touches[0].clientY : e.clientY;

  return {
    x: (clientX - rect.left) * (canvasPaint.width / rect.width),
    y: (clientY - rect.top) * (canvasPaint.height / rect.height)
  };
}

// ================= DESENHO =================
function iniciarDesenho(e) {
  e.preventDefault();
  desenhando = true;

  const pos = pegarPosicao(e);
  ultimoX = pos.x;
  ultimoY = pos.y;
}

function moverDesenho(e) {
  if (!desenhando) return;
  e.preventDefault();

  const pos = pegarPosicao(e);

  ctxPaint.strokeStyle = "#000";
  ctxPaint.lineWidth = 3;
  ctxPaint.lineCap = "round";

  if (modo === "pintar") {
    ctxPaint.beginPath();
    ctxPaint.moveTo(ultimoX, ultimoY);
    ctxPaint.lineTo(pos.x, pos.y);
    ctxPaint.stroke();
  } else {
    ctxPaint.clearRect(pos.x - 10, pos.y - 10, 20, 20);
  }

  ultimoX = pos.x;
  ultimoY = pos.y;
}

function finalizarDesenho() {
  desenhando = false;
}

// mouse
canvasPaint.addEventListener("mousedown", iniciarDesenho);
canvasPaint.addEventListener("mousemove", moverDesenho);
window.addEventListener("mouseup", finalizarDesenho);

// touch (mobile)
canvasPaint.addEventListener("touchstart", iniciarDesenho, { passive:false });
canvasPaint.addEventListener("touchmove", moverDesenho, { passive:false });
window.addEventListener("touchend", finalizarDesenho);

// ================= LIMPAR =================
function limparTudo() {
  ctxPaint.clearRect(0,0,canvasPaint.width,canvasPaint.height);
}

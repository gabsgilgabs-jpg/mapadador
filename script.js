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

// ================= DOM =================
const canvasBase = document.getElementById("canvasBase");
const canvasPaint = document.getElementById("canvasPaint");
const formulario = document.getElementById("formulario");
const container = document.getElementById("mapaContainer");

const ctxBase = canvasBase.getContext("2d");
const ctxPaint = canvasPaint.getContext("2d");

// ================= STATE =================
let desenhando = false;
let ultimoX = 0;
let ultimoY = 0;
let modo = "pintar";
let zoom = 1;

// ================= IMAGE =================
const imagem = new Image();
imagem.src = "./img/pessoa.png";

// ================= INIT =================
window.addEventListener("load", () => {
  console.log("Sistema carregado");

  configurarCanvas();
  criarCampos();
  definirModo("pintar");
  preencherDataAtual();
});

// fallback caso imagem falhe
imagem.onload = () => {
  configurarCanvas();
};

// ================= FUNCTIONS =================

function preencherDataAtual() {
  const hoje = new Date();
  document.getElementById("dataPreenchimento").value =
    hoje.toISOString().split("T")[0];
}

function configurarCanvas() {
  const largura = 700;
  const altura = 842;

  canvasBase.width = largura;
  canvasBase.height = altura;
  canvasPaint.width = largura;
  canvasPaint.height = altura;

  ctxBase.clearRect(0,0,largura,altura);
  ctxBase.drawImage(imagem, 0, 0, largura, altura);
}

function criarCampos() {
  formulario.innerHTML = "";

  grupos.forEach(grupo => {
    const box = document.createElement("div");
    box.className = "grupoCampos";

    box.style.left = (grupo.x * 100) + "%";
    box.style.top = (grupo.y * 100) + "%";

    const linhaD = document.createElement("div");
    linhaD.className = "linhaCampo";
    linhaD.innerHTML = `
      <strong>D:</strong>
      <input type="date" class="campoMapa campoData">
    `;

    const linhaI = document.createElement("div");
    linhaI.className = "linhaCampo";

    const select = document.createElement("select");
    select.className = "campoMapa campoIntensidade";

    for (let i = 0; i <= 10; i++) {
      const opt = document.createElement("option");
      opt.value = i;
      opt.textContent = i;
      select.appendChild(opt);
    }

    linhaI.innerHTML = `<strong>I:</strong>`;
    linhaI.appendChild(select);

    box.appendChild(linhaD);
    box.appendChild(linhaI);

    formulario.appendChild(box);
  });
}

function definirModo(novoModo) {
  modo = novoModo;

  document.querySelectorAll(".botoes button")
    .forEach(btn => btn.classList.remove("botaoAtivo"));

  const btn = document.getElementById(
    modo === "pintar" ? "btnPintar" : "btnApagar"
  );

  if (btn) btn.classList.add("botaoAtivo");
}

function zoomMais() {
  zoom += 0.1;
  aplicarZoom();
}

function zoomMenos() {
  zoom -= 0.1;
  if (zoom < 0.5) zoom = 0.5;
  aplicarZoom();
}

function aplicarZoom() {
  container.style.transform = `scale(${zoom})`;
}

function pegarPosicao(e) {
  const rect = canvasPaint.getBoundingClientRect();

  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const clientY = e.touches ? e.touches[0].clientY : e.clientY;

  return {
    x: (clientX - rect.left) * (canvasPaint.width / rect.width),
    y: (clientY - rect.top) * (canvasPaint.height / rect.height)
  };
}

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

  if (modo === "pintar") {
    ctxPaint.strokeStyle = "#000";
    ctxPaint.lineWidth = 3;
    ctxPaint.lineCap = "round";

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

canvasPaint.addEventListener("mousedown", iniciarDesenho);
canvasPaint.addEventListener("mousemove", moverDesenho);
window.addEventListener("mouseup", finalizarDesenho);

canvasPaint.addEventListener("touchstart", iniciarDesenho, { passive:false });
canvasPaint.addEventListener("touchmove", moverDesenho, { passive:false });
window.addEventListener("touchend", finalizarDesenho);

function limparTudo() {
  ctxPaint.clearRect(0,0,canvasPaint.width,canvasPaint.height);
}

// ================= PDF =================
async function salvarPDF() {

  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF("p","mm","a4");

  const captura = await html2canvas(container, { scale:4 });

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

  const nomePaciente =
    document.getElementById("nomePaciente")?.value || "paciente";

  const data = new Date()
    .toLocaleString("pt-BR")
    .replace(/[/:]/g, "-");

  const nomeArquivo = `${nomePaciente}_mapa_${data}.pdf`;

  const blob = pdf.output("blob");
  const reader = new FileReader();

  reader.onloadend = async () => {

    const base64 = reader.result.split(",")[1];

    const res = await fetch("https://script.google.com/macros/s/AKfycbyKEExTAxHEbwM3z18R400ylIkEbCp2se4mbQKuA4c4zjmMm2m6fg5CuOSp4rqIMQlVLA/exec", {
      method: "POST",
      body: JSON.stringify({
        file: base64,
        mimeType: "application/pdf",
        filename: nomeArquivo
      })
    });

    const result = await res.json();
    alert("Salvo no Drive:\n" + result.url);
  };

  reader.readAsDataURL(blob);
}

// ================= GIF =================
async function salvarGIF() {

  const btn = document.getElementById("btnGIF");
  btn.classList.add("botaoAtivo");

  const captura = await html2canvas(container, {
    scale:2,
    useCORS:true
  });

  gifshot.createGIF({
    images:[captura.toDataURL("image/png")],
    gifWidth:captura.width,
    gifHeight:captura.height,
    interval:1
  }, (obj) => {

    if (!obj.error) {
      const link = document.createElement("a");
      link.href = obj.image;
      link.download = "mapa-da-dor.gif";
      link.click();
    }

    btn.classList.remove("botaoAtivo");
  });
}

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

// ================= INIT =================
window.addEventListener("load", init);
imagem.onload = init;

function init() {
  configurarCanvas();
  criarCampos();
  definirModo("pintar");
  preencherDataAtual();
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

  if (imagem.complete) {
    ctxBase.drawImage(imagem, 0, 0, w, h);
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
          ${Array.from({length:11},(_,i)=>`<option>${i}</option>`).join("")}
        </select>
      </div>
    `;

    formulario.appendChild(box);
  });
}

// ================= DATA =================
function preencherDataAtual() {
  const el = document.getElementById("dataPreenchimento");
  if (el) el.value = new Date().toISOString().split("T")[0];
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
  container.style.transform = `scale(${zoom})`;
}

function zoomMenos() {
  zoom = Math.max(0.5, zoom - 0.1);
  container.style.transform = `scale(${zoom})`;
}

// ================= POSIÇÃO =================
function pos(e) {
  const r = canvasPaint.getBoundingClientRect();

  const x = e.touches ? e.touches[0].clientX : e.clientX;
  const y = e.touches ? e.touches[0].clientY : e.clientY;

  return {
    x:(x-r.left)*(canvasPaint.width/r.width),
    y:(y-r.top)*(canvasPaint.height/r.height)
  };
}

// ================= DESENHO =================
function down(e){
  e.preventDefault();
  desenhando = true;

  const p = pos(e);
  ultimoX = p.x;
  ultimoY = p.y;
}

function move(e){
  if(!desenhando) return;
  e.preventDefault();

  const p = pos(e);

  ctxPaint.strokeStyle="#000";
  ctxPaint.lineWidth=3;
  ctxPaint.lineCap="round";

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

function up(){
  desenhando=false;
}

canvasPaint.addEventListener("mousedown",down);
canvasPaint.addEventListener("mousemove",move);
window.addEventListener("mouseup",up);

canvasPaint.addEventListener("touchstart",down,{passive:false});
canvasPaint.addEventListener("touchmove",move,{passive:false});
window.addEventListener("touchend",up);

// ================= LIMPAR =================
function limparTudo(){
  ctxPaint.clearRect(0,0,canvasPaint.width,canvasPaint.height);
}

// ================= PDF + DRIVE =================
async function salvarPDF() {

  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF("p","mm","a4");

  const nome =
    document.getElementById("nomePaciente")?.value || "Paciente";

  const data =
    document.getElementById("dataPreenchimento")?.value || "";

  // ================= CABEÇALHO =================
  pdf.setFont("helvetica","bold");
  pdf.setFontSize(16);
  pdf.text("MAPA DA DOR",105,15,{align:"center"});

  pdf.setFontSize(11);
  pdf.setFont("helvetica","normal");
  pdf.text(`Paciente: ${nome}`,14,25);
  pdf.text(`Data: ${data}`,160,25);

  pdf.line(10,30,200,30);

  // ================= MAPA =================
  const captura = await html2canvas(container,{
    scale:3,
    useCORS:true,
    backgroundColor:"#fff"
  });

  const img = captura.toDataURL("image/png");

  const largura = 190;
  const altura = (captura.height*largura)/captura.width;

  pdf.addImage(img,"PNG",10,35,largura,altura);

  // ================= RODAPÉ CORRIGIDO =================
  const startY = 35 + altura + 10;

  pdf.line(10,startY,200,startY);

  pdf.setFontSize(11);
  pdf.setFont("helvetica","normal");

  const addText = (txt, y) => {
    const lines = pdf.splitTextToSize(txt, 180);
    pdf.text(lines, 14, y);
  };

  addText(
    "Obs.: indique com flechas os locais do início (D) e intensidade (I) da dor.",
    startY + 10
  );

  addText(
    "Marque com círculo o local da principal queixa de dor.",
    startY + 18
  );

  addText(
    "Descreva o que piora ou produz sua dor:",
    startY + 28
  );

  addText(
    "Descreva o que melhora sua dor:",
    startY + 36
  );

  addText(
    "A sua dor é constante? Sim (  ) Não (  )",
    startY + 46
  );

  // ================= DRIVE =================
  const fileName = `${nome}_mapa_${data}.pdf`;

  const base64 = pdf.output("datauristring").split(",")[1];

  const response = await fetch("https://script.google.com/macros/s/AKfycby0hGiR5yqtYf3sxiLahAoV2w9NeW8aaF_GnSuDYgOK/dev", {
    method:"POST",
    body: JSON.stringify({
      nome:nome,
      fileName:fileName,
      file:base64
    })
  });

  const result = await response.json();

  alert("Salvo no Drive!\n" + result.url);
}

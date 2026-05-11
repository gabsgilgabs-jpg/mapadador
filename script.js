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
const mapaContainer = document.getElementById("mapaContainer");

const ctxBase = canvasBase.getContext("2d");
const ctxPaint = canvasPaint.getContext("2d");

// ================= ESTADO =================
let desenhando = false;
let ultimoX = 0;
let ultimoY = 0;
let modo = "";
let zoom = 1;

// ================= IMAGEM =================
const imagem = new Image();

function desenharImagem(){
  const w = canvasBase.width;
  const h = canvasBase.height;

  ctxBase.clearRect(0, 0, w, h);
  ctxBase.drawImage(imagem, 0, 0, w, h);
}

imagem.onload = () => {
  desenharImagem();
};

imagem.onerror = () => {
  console.error("Erro ao carregar imagem:", imagem.src);
};

// ================= INIT =================
window.addEventListener("load", init);

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

  imagem.src = "./img/pessoa.png";
}

// ================= CAMPOS =================
function criarCampos(){
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
          ${Array.from({length:11}, (_,i)=>`<option>${i}</option>`).join("")}
        </select>
      </div>
    `;

    formulario.appendChild(div);
  });
}

// ================= DATA =================
function preencherData(){
  const el = document.getElementById("dataPreenchimento");

  if(el){
    el.value = new Date().toISOString().split("T")[0];
  }
}

// ================= MODOS =================
function definirModo(m){
  modo = m;

  document.querySelectorAll(".botoes button")
    .forEach(b => b.classList.remove("botaoAtivo"));

  const id = modo === "pintar" ? "btnPintar" : "btnApagar";

  document.getElementById(id)?.classList.add("botaoAtivo");
}

function desativarModo(){
  modo = "";

  document.querySelectorAll(".botoes button")
    .forEach(b => b.classList.remove("botaoAtivo"));

  document.getElementById("btnParar")?.classList.add("botaoAtivo");
}

// ================= LIMPAR =================
function limparTudo(){
  ctxPaint.clearRect(0,0,canvasPaint.width,canvasPaint.height);
}

// ================= POS =================
function pos(e){
  const r = canvasPaint.getBoundingClientRect();

  const x = e.touches ? e.touches[0].clientX : e.clientX;
  const y = e.touches ? e.touches[0].clientY : e.clientY;

  return {
    x: (x-r.left) * (canvasPaint.width / r.width),
    y: (y-r.top) * (canvasPaint.height / r.height)
  };
}

// ================= DESENHO =================
function down(e){
  if(e.touches && e.touches.length > 1) return;
  if(modo !== "pintar" && modo !== "apagar") return;

  desenhando = true;

  const p = pos(e);
  ultimoX = p.x;
  ultimoY = p.y;
}

function move(e){
  if(e.touches && e.touches.length > 1) return;
  if(!desenhando) return;

  e.preventDefault();

  const p = pos(e);

  ctxPaint.strokeStyle = "#000";
  ctxPaint.lineWidth = 3;
  ctxPaint.lineCap = "round";

  if(modo === "pintar"){
    ctxPaint.beginPath();
    ctxPaint.moveTo(ultimoX, ultimoY);
    ctxPaint.lineTo(p.x, p.y);
    ctxPaint.stroke();
  }

  else if(modo === "apagar"){
    ctxPaint.clearRect(p.x-12, p.y-12, 24, 24);
  }

  ultimoX = p.x;
  ultimoY = p.y;
}

function up(){
  desenhando = false;
}

// ================= EVENTOS =================
canvasPaint.addEventListener("mousedown", down);
canvasPaint.addEventListener("mousemove", move);
window.addEventListener("mouseup", up);

canvasPaint.addEventListener("touchstart", down, {passive:false});
canvasPaint.addEventListener("touchmove", move, {passive:false});
window.addEventListener("touchend", up);

// ================= ZOOM =================
function aplicarZoom(){
  mapaContainer.style.transform = `scale(${zoom})`;
  mapaContainer.style.transformOrigin = "center top";
}

function zoomMais(){
  zoom = Math.min(3, zoom + 0.1);
  aplicarZoom();
}

function zoomMenos(){
  zoom = Math.max(0.5, zoom - 0.1);
  aplicarZoom();
}

function resetZoom(){
  zoom = 1;
  aplicarZoom();
}

// ================= PDF =================
async function salvarPDF(){

  try{

    const nome = document.getElementById("nome")?.value || "sem_nome";

    const zoomAtual = zoom;
    mapaContainer.style.transform = "scale(1)";

    const canvas = await html2canvas(document.body, {
      backgroundColor:"#fff",
      scale:2,
      useCORS:true,
      logging:false
    });

    mapaContainer.style.transform = `scale(${zoomAtual})`;

    const img = canvas.toDataURL("image/png");

    const URL_SCRIPT = "https://script.google.com/macros/s/AKfycbxpq8Qca-JEN9ow4uAD4bCLs1TTotxb44ZAVVss9zOqUrzfxG71jE5UtOyPo6_pIOE_zQ/exec";

    const resposta = await fetch(URL_SCRIPT, {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({ nome, imagem:img })
    });

    const texto = await resposta.text();

    const pdf = new jspdf.jsPDF({
      orientation:"portrait",
      unit:"px",
      format:[canvas.width, canvas.height]
    });

    pdf.addImage(img,"PNG",0,0,canvas.width,canvas.height);
    pdf.save(`mapa_dor_${nome}.pdf`);

    console.log(texto);

  } catch(err){
    console.error(err);
    alert("Erro ao gerar PDF");
  }
}

let modo = "pintar"; 
let img;
let ctxBase, ctxPaint;
let lastX, lastY;

// 12 áreas de texto (valores de proporção ajustáveis conforme posição real)
const areasTexto = [
  { tipo: "D", x: 0.05, y: 0.15, w: 0.15, h: 0.06 },
  { tipo: "I", x: 0.22, y: 0.15, w: 0.10, h: 0.06 },
  { tipo: "D", x: 0.05, y: 0.30, w: 0.15, h: 0.06 },
  { tipo: "I", x: 0.22, y: 0.30, w: 0.10, h: 0.06 },
  { tipo: "D", x: 0.05, y: 0.45, w: 0.15, h: 0.06 },
  { tipo: "I", x: 0.22, y: 0.45, w: 0.10, h: 0.06 },
  { tipo: "D", x: 0.65, y: 0.15, w: 0.15, h: 0.06 },
  { tipo: "I", x: 0.82, y: 0.15, w: 0.10, h: 0.06 },
  { tipo: "D", x: 0.65, y: 0.30, w: 0.15, h: 0.06 },
  { tipo: "I", x: 0.82, y: 0.30, w: 0.10, h: 0.06 },
  { tipo: "D", x: 0.65, y: 0.45, w: 0.15, h: 0.06 },
  { tipo: "I", x: 0.82, y: 0.45, w: 0.10, h: 0.06 }
];

function inicializarCanvas() {
  const canvasBase = document.getElementById("canvasBase");
  const canvasPaint = document.getElementById("canvasPaint");
  ctxBase = canvasBase.getContext("2d");
  ctxPaint = canvasPaint.getContext("2d");

  img = new Image();
  img.src = "./img/pessoa.png"; 
  img.onload = () => {
    const proporcao = img.height / img.width;
    const larguraMax = 595;
    let largura = window.innerWidth * 0.8;
    if (largura > larguraMax) largura = larguraMax;
    const altura = largura * proporcao;

    canvasBase.width = largura;
    canvasBase.height = altura;
    canvasPaint.width = largura;
    canvasPaint.height = altura;

    ctxBase.clearRect(0, 0, largura, altura);
    ctxBase.drawImage(img, 0, 0, largura, altura);

    canvasPaint.style.left = canvasBase.offsetLeft + "px";
    canvasPaint.style.top = canvasBase.offsetTop + "px";

    inicializarCamposTexto(canvasBase);
  };

  habilitarPintura(canvasPaint);
}

function habilitarPintura(canvas) {
  let desenhando = false;

  function getCoords(e) {
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;
    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    const x = (clientX - rect.left) * (canvas.width / rect.width);
    const y = (clientY - rect.top) * (canvas.height / rect.height);
    return { x, y };
  }

  canvas.addEventListener("mousedown", (e) => {
    desenhando = true;
    const { x, y } = getCoords(e);
    lastX = x; lastY = y;
  });
  canvas.addEventListener("mouseup", () => desenhando = false);
  canvas.addEventListener("mousemove", (e) => {
    if (!desenhando) return;
    desenhar(getCoords(e));
  });

  canvas.addEventListener("touchstart", (e) => {
    desenhando = true;
    const { x, y } = getCoords(e);
    lastX = x; lastY = y;
  });
  canvas.addEventListener("touchend", () => desenhando = false);
  canvas.addEventListener("touchmove", (e) => {
    if (!desenhando) return;
    desenhar(getCoords(e));
    e.preventDefault();
  });
}

function desenhar({ x, y }) {
  // bloqueia pintura apenas dentro das caixas D/I
  const dentroTexto = areasTexto.some(area => {
    const ax = area.x * ctxBase.canvas.width;
    const ay = area.y * ctxBase.canvas.height;
    const aw = area.w * ctxBase.canvas.width;
    const ah = area.h * ctxBase.canvas.height;
    return x >= ax && x <= ax + aw && y >= ay && y <= ay + ah;
  });
  if (dentroTexto) return;

  // pintura liberada no corpo da figura
  const pixel = ctxBase.getImageData(x, y, 1, 1).data;
  if (pixel[3] > 0) {
    if (modo === "pintar") {
      ctxPaint.strokeStyle = "black";
      ctxPaint.lineWidth = 3;
      ctxPaint.lineCap = "round";
      ctxPaint.setLineDash([]);
      ctxPaint.beginPath();
      ctxPaint.moveTo(lastX, lastY);
      ctxPaint.lineTo(x, y);
      ctxPaint.stroke();
      lastX = x; lastY = y;
    } else if (modo === "apagar") {
      ctxPaint.clearRect(x - 3, y - 3, 6, 6);
    }
  }
}

function limparCanvas() {
  ctxPaint.clearRect(0, 0, ctxPaint.canvas.width, ctxPaint.canvas.height);
}

function inicializarCamposTexto(canvas) {
  const formulario = document.getElementById("formulario");
  areasTexto.forEach(area => {
    let campo;

    if (area.tipo === "D") {
      campo = document.createElement("input");
      campo.type = "text";
      campo.placeholder = "dd/mm/aaaa";
      campo.pattern = "\\d{2}/\\d{2}/\\d{4}";
    } else if (area.tipo === "I") {
      campo = document.createElement("select");
      for (let i = 0; i <= 10; i++) {
        const opt = document.createElement("option");
        opt.value = i;
        opt.text = i;
        campo.appendChild(opt);
      }
    }

    campo.style.position = "absolute";
    campo.style.left = (area.x * canvas.width + canvas.offsetLeft) + "px";
    campo.style.top = (area.y * canvas.height + canvas.offsetTop) + "px";
    campo.style.width = (area.w * canvas.width) + "px";
    campo.style.height = (area.h * canvas.height) + "px";
    campo.style.border = "none";       // sem borda
    campo.style.background = "transparent"; // fundo transparente
    campo.style.textAlign = "center";
    campo.style.fontSize = "14px";

    formulario.appendChild(campo);
  });
}

async function salvarPDF() {
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  const nomePaciente = document.getElementById('nomePaciente').value || "Paciente não informado";
  const agora = new Date();

  const formulario = document.getElementById('formulario');
  const canvasForm = await html2canvas(formulario, { scale: 2 });

  const imgWidth = pageWidth - 40;
  const imgHeight = (canvasForm.height * imgWidth) / canvasForm.width;
  const posX = 20;
  const posY = (pageHeight - imgHeight) / 2;

  pdf.addImage(canvasForm.toDataURL('image/png'), 'PNG', posX, posY, imgWidth, imgHeight);

  pdf.setFontSize(10);
  pdf.text(`Paciente: ${nomePaciente}`, pageWidth - 10, pageHeight - 15, { align: "right" });
  pdf.text(`Preenchido em: ${agora.toLocaleString()}`, pageWidth - 10, pageHeight - 10, { align: "right" });

  pdf.save(`formulario_d

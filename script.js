let modo = "pintar"; // padrão inicial
let img;
let ctxBase, ctxPaint;
let lastX, lastY;

function inicializarCanvas() {
  const canvasBase = document.getElementById("canvasBase");
  const canvasPaint = document.getElementById("canvasPaint");
  ctxBase = canvasBase.getContext("2d");
  ctxPaint = canvasPaint.getContext("2d");

  img = new Image();
  img.src = "./img/pessoa.png"; // ajuste conforme o caminho real
  img.onload = () => {
    const proporcao = img.height / img.width;

    // largura máxima para caber na página A4
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

    // alinhar canvas de pintura sobre o base
    canvasPaint.style.left = canvasBase.offsetLeft + "px";
    canvasPaint.style.top = canvasBase.offsetTop + "px";
  };

  habilitarPintura(canvasPaint);
}

function habilitarPintura(canvas) {
  let desenhando = false;

  canvas.addEventListener("mousedown", (e) => {
    desenhando = true;
    const rect = canvas.getBoundingClientRect();
    lastX = e.clientX - rect.left;
    lastY = e.clientY - rect.top;
  });

  canvas.addEventListener("mouseup", () => desenhando = false);

  canvas.addEventListener("mousemove", (e) => {
    if (!desenhando) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const pixel = ctxBase.getImageData(x, y, 1, 1).data;
    if (pixel[3] > 0) {
      if (modo === "pintar") {
        ctxPaint.strokeStyle = "black";   // sempre preto
        ctxPaint.lineWidth = 3;           // traço fixo de 3px
        ctxPaint.lineCap = "round";       // ponta arredondada
        ctxPaint.setLineDash([]);         // nunca pontilhado

        ctxPaint.beginPath();
        ctxPaint.moveTo(lastX, lastY);
        ctxPaint.lineTo(x, y);
        ctxPaint.stroke();

        lastX = x;
        lastY = y;
      } else if (modo === "apagar") {
        ctxPaint.clearRect(x - 3, y - 3, 6, 6);
      }
    }
  });
}

function limparCanvas() {
  ctxPaint.clearRect(0, 0, ctxPaint.canvas.width, ctxPaint.canvas.height);
}

function adicionarCaixaTexto() {
  const div = document.createElement("div");
  div.contentEditable = true;
  div.innerText = "Digite aqui...";
  div.style.left = "50px";
  div.style.top = "50px";
  div.style.position = "absolute";
  div.style.background = "rgba(255,255,255,0.7)";
  div.style.border = "1px solid #000";
  div.style.padding = "5px";
  div.style.cursor = "move";

  div.onmousedown = (e) => {
    const offsetX = e.offsetX;
    const offsetY = e.offsetY;
    document.onmousemove = (ev) => {
      div.style.left = (ev.pageX - offsetX) + "px";
      div.style.top = (ev.pageY - offsetY) + "px";
    };
    document.onmouseup = () => document.onmousemove = null;
  };

  document.getElementById("formulario").appendChild(div);
}

async function salvarPDF() {
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  const nomePaciente = document.getElementById('nomePaciente').value || "Paciente não informado";
  const textoD = document.getElementById('textoD').value || "";
  const textoI = document.getElementById('textoI').value || "";
  const agora = new Date();

  const formulario = document.getElementById('formulario');
  const canvasForm = await html2canvas(formulario, { scale: 2 });

  // centralizar com margens fixas
  const imgWidth = pageWidth - 40; // margem 20mm cada lado
  const imgHeight = (canvasForm.height * imgWidth) / canvasForm.width;
  const posX = 20;
  const posY = (pageHeight - imgHeight) / 2;

  pdf.addImage(canvasForm.toDataURL('image/png'), 'PNG', posX, posY, imgWidth, imgHeight);

  pdf.setFontSize(12);
  pdf.text(`D: ${textoD}`, 10, pageHeight - 30);
  pdf.text(`I: ${textoI}`, 10, pageHeight - 20);

  pdf.setFontSize(10);
  pdf.text(`Paciente: ${nomePaciente}`, pageWidth - 10, pageHeight - 15, { align: "right" });
  pdf.text(`Preenchido em: ${agora.toLocaleString()}`, pageWidth - 10, pageHeight - 10, { align: "right" });

  pdf.save(`formulario_dor_${nomePaciente}.pdf`);
}

window.onload = inicializarCanvas;

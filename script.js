let modo = "pintar"; 
let img;
let ctxBase, ctxPaint;
let lastX, lastY;

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

  function desenhar({ x, y }) {
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

  // botão X (inicialmente oculto)
  const btn = document.createElement("span");
  btn.innerText = "✖";
  btn.style.position = "absolute";
  btn.style.top = "2px";
  btn.style.right = "5px";
  btn.style.cursor = "pointer";
  btn.style.color = "red";
  btn.style.fontWeight = "bold";
  btn.style.display = "none";
  btn.onclick = () => div.remove();

  div.appendChild(btn);

  div.onmouseenter = () => btn.style.display = "block";
  div.onmouseleave = () => btn.style.display = "none";

  div.onmousedown = (e) => {
    if (e.target === btn) return;
    if (e.button === 0) {
      const offsetX = e.offsetX;
      const offsetY = e.offsetY;
      document.onmousemove = (ev) => {
        div.style.left = (ev.pageX - offsetX) + "px";
        div.style.top = (ev.pageY - offsetY) + "px";
      };
      document.onmouseup = () => document.onmousemove = null;
    }
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

  const imgWidth = pageWidth - 40;
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

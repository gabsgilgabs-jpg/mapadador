let modo = "pintar";
let img;
let ctxBase, ctxPaint;

function inicializarCanvas() {
  const canvasBase = document.getElementById("canvasBase");
  const canvasPaint = document.getElementById("canvasPaint");
  ctxBase = canvasBase.getContext("2d");
  ctxPaint = canvasPaint.getContext("2d");

  img = new Image();
  // ajuste o caminho conforme onde está seu arquivo
  img.src = "./img/pessoa.png"; // se estiver na pasta /img
  // img.src = "./pessoa.png";   // se estiver na raiz

  img.onload = () => {
    const proporcao = img.height / img.width;
    const largura = window.innerWidth * 0.8;
    const altura = largura * proporcao;

    canvasBase.width = largura;
    canvasBase.height = altura;
    canvasPaint.width = largura;
    canvasPaint.height = altura;

    ctxBase.clearRect(0, 0, largura, altura);
    ctxBase.drawImage(img, 0, 0, largura, altura);
  };

  habilitarPintura(canvasPaint);
}

function habilitarPintura(canvas) {
  let desenhando = false;

  canvas.addEventListener("mousedown", () => desenhando = true);
  canvas.addEventListener("mouseup", () => desenhando = false);
  canvas.addEventListener("mousemove", (e) => {
    if (!desenhando) return;
    const pixel = ctxBase.getImageData(e.offsetX, e.offsetY, 1, 1).data;
    if (pixel[3] > 0) { // só dentro da figura
      if (modo === "pintar") {
        ctxPaint.fillStyle = "black";
        ctxPaint.fillRect(e.offsetX, e.offsetY, 3, 3);
      } else if (modo === "apagar") {
        ctxPaint.clearRect(e.offsetX, e.offsetY, 6, 6); // só apaga pintura
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
  const largura = pdf.internal.pageSize.getWidth();
  const altura = pdf.internal.pageSize.getHeight();

  const nomePaciente = document.getElementById('nomePaciente').value || "Paciente não informado";
  const textoD = document.getElementById('textoD').value || "";
  const textoI = document.getElementById('textoI').value || "";
  const agora = new Date();

  const formulario = document.getElementById('formulario');
  const canvasForm = await html2canvas(formulario, { scale: 2 });
  pdf.addImage(canvasForm.toDataURL('image/png'), 'PNG', 0, 0, largura, altura);

  pdf.setFontSize(12);
  pdf.text(`D: ${textoD}`, 10, altura - 30);
  pdf.text(`I: ${textoI}`, 10, altura - 20);

  pdf.setFontSize(10);
  pdf.text(`Paciente: ${nomePaciente}`, largura - 10, altura - 15, { align: "right" });
  pdf.text(`Preenchido em: ${agora.toLocaleString()}`, largura - 10, altura - 10, { align: "right" });

  pdf.save(`formulario_dor_${nomePaciente}.pdf`);
}

window.onload = inicializarCanvas;

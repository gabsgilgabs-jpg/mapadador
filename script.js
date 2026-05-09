let modo = "pintar"; // padrão: pintar

function habilitarPintura(canvasId) {
  const canvas = document.getElementById(canvasId);
  const ctx = canvas.getContext("2d");
  let desenhando = false;

  // Carregar imagem da pessoa (com fundo transparente)
  const img = new Image();
  img.src = "img/pessoa.png";
  img.onload = () => ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  canvas.addEventListener("mousedown", () => desenhando = true);
  canvas.addEventListener("mouseup", () => desenhando = false);
  canvas.addEventListener("mousemove", (e) => {
    if (!desenhando) return;

    const pixel = ctx.getImageData(e.offsetX, e.offsetY, 1, 1).data;
    if (pixel[3] > 0) { // só pinta/apaga dentro da figura
      if (modo === "pintar") {
        ctx.fillStyle = "black";
        ctx.fillRect(e.offsetX, e.offsetY, 3, 3);
      } else if (modo === "apagar") {
        ctx.clearRect(e.offsetX, e.offsetY, 6, 6); // borracha maior
      }
    }
  });
}

habilitarPintura("canvasPessoa");

async function salvarPDF() {
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF('p', 'mm', 'a4');
  const largura = pdf.internal.pageSize.getWidth();
  const altura = pdf.internal.pageSize.getHeight();

  const nomePaciente = document.getElementById('nomePaciente').value || "Paciente não informado";
  const agora = new Date();

  pdf.setFont("arial", "bold");
  pdf.setFontSize(10);

  const formulario = document.getElementById('formulario');
  const canvasForm = await html2canvas(formulario, { scale: 2 });
  pdf.addImage(canvasForm.toDataURL('image/png'), 'PNG', 0, 0, largura, altura);

  pdf.text(`Paciente: ${nomePaciente}`, largura - 10, altura - 15, { align: "right" });
  pdf.text(`Preenchido em: ${agora.toLocaleString()}`, largura - 10, altura - 10, { align: "right" });

  pdf.save(`formulario_dor_${nomePaciente}.pdf`);
}

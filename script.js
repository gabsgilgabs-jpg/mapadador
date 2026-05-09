// Função para habilitar pintura em um canvas
function habilitarPintura(canvasId) {
  const canvas = document.getElementById(canvasId);
  const ctx = canvas.getContext("2d");
  let desenhando = false;

  // Carregar imagem de pessoa dentro do canvas
  const img = new Image();
  img.src = "img/pessoa.png"; // coloque sua imagem na pasta /img/
  img.onload = () => ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  canvas.addEventListener("mousedown", () => desenhando = true);
  canvas.addEventListener("mouseup", () => desenhando = false);
  canvas.addEventListener("mousemove", (e) => {
    if (!desenhando) return;
    ctx.fillStyle = "red"; // cor da pintura
    ctx.fillRect(e.offsetX, e.offsetY, 3, 3); // ponto pintado
  });
}

// Ativar pintura apenas no canvas da pessoa
habilitarPintura("canvasPessoa");

async function salvarPDF() {
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF('p', 'mm', 'a4');
  const largura = pdf.internal.pageSize.getWidth();
  const altura = pdf.internal.pageSize.getHeight();

  const nomePaciente = document.getElementById('nomePaciente').value || "Paciente não informado";
  const agora = new Date();

  // Definir Arial negrito como padrão
  pdf.setFont("arial", "bold");
  pdf.setFontSize(10);

  // Página única
  const formulario = document.getElementById('formulario');
  const canvasForm = await html2canvas(formulario, { scale: 2 });
  pdf.addImage(canvasForm.toDataURL('image/png'), 'PNG', 0, 0, largura, altura);
  pdf.text(`Paciente: ${nomePaciente}`, largura - 10, altura - 15, { align: "right" });
  pdf.text(`Preenchido em: ${agora.toLocaleString()}`, largura - 10, altura - 10, { align: "right" });

  // Nome do arquivo
  pdf.save(`formulario_dor_${nomePaciente}.pdf`);
}

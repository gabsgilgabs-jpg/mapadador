let modo = "pintar"; 
let img; 
let zoomFactor = 1;
let offsetX = 0;
let offsetY = 0;
let initialDistance = null;
let lastTouch = null;

function ajustarCanvasResponsivo(canvasId) {
  const canvas = document.getElementById(canvasId);
  const ctx = canvas.getContext("2d");

  img = new Image();
  img.src = "img/pessoa.png"; // PNG transparente em alta resolução
  img.onload = () => {
    const proporcao = img.height / img.width;
    const largura = window.innerWidth * 0.8;
    const altura = largura * proporcao;

    canvas.width = largura;
    canvas.height = altura;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  };
}

function habilitarPintura(canvasId, lupaId) {
  const canvas = document.getElementById(canvasId);
  const ctx = canvas.getContext("2d");
  const lupa = document.getElementById(lupaId);
  const lupaCtx = lupa.getContext("2d");
  let desenhando = false;

  canvas.addEventListener("mousedown", () => desenhando = true);
  canvas.addEventListener("mouseup", () => desenhando = false);
  canvas.addEventListener("mousemove", (e) => {
    const zoomFactorLupa = 2;
    const size = 50;
    const x = e.offsetX;
    const y = e.offsetY;

    const imageData = ctx.getImageData(x - size/2, y - size/2, size, size);
    lupaCtx.clearRect(0, 0, lupa.width, lupa.height);
    lupaCtx.putImageData(imageData, 0, 0);
    lupaCtx.drawImage(lupa, 0, 0, size, size, 0, 0, lupa.width, lupa.height);

    if (!desenhando) return;
    const pixel = ctx.getImageData(e.offsetX, e.offsetY, 1, 1).data;
    if (pixel[3] > 0) {
      if (modo === "pintar") {
        ctx.fillStyle = "black";
        ctx.fillRect(e.offsetX, e.offsetY, 3, 3);
      } else if (modo === "apagar") {
        ctx.clearRect(e.offsetX, e.offsetY, 6, 6);
      }
    }
  });
}

function limparCanvas() {
  const canvas = document.getElementById("canvasPessoa");
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
}

// pinch-to-zoom + pan
function habilitarPinchZoomPan(canvasId) {
  const canvas = document.getElementById(canvasId);
  const ctx = canvas.getContext("2d");

  canvas.addEventListener("touchstart", (e) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      initialDistance = Math.sqrt(dx*dx + dy*dy);
    } else if (e.touches.length === 1) {
      lastTouch = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  });

  canvas.addEventListener("touchmove", (e) => {
    if (e.touches.length === 2 && initialDistance) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const newDistance = Math.sqrt(dx*dx + dy*dy);

      zoomFactor *= newDistance / initialDistance;
      initialDistance = newDistance;
      redesenharImagem(canvas, ctx);
    } else if (e.touches.length === 1 && lastTouch) {
      const dx = e.touches[0].clientX - lastTouch.x;
      const dy = e.touches[0].clientY - lastTouch.y;
      offsetX += dx;
      offsetY += dy;
      lastTouch = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      redesenharImagem(canvas, ctx);
    }
  });

  canvas.addEventListener("touchend", () => {
    initialDistance = null;
    lastTouch = null;
  });
}

function redesenharImagem(canvas, ctx) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.translate(offsetX, offsetY);
  ctx.scale(zoomFactor, zoomFactor);
  ctx.drawImage(img, 0, 0, canvas.width / zoomFactor, canvas.height / zoomFactor);
  ctx.restore();
}

// reset suave com bounce
function resetZoomPan() {
  const canvas = document.getElementById("canvasPessoa");
  const ctx = canvas.getContext("2d");

  const startZoom = zoomFactor;
  const startX = offsetX;
  const startY = offsetY;

  const targetZoom = 1;
  const targetX = 0;
  const targetY = 0;

  const duration = 500;
  const startTime = performance.now();

  function easeOutBounce(t) {
    if (t < (1 / 2.75)) {
      return (7.5625 * t * t) * 1.2;
    } else if (t < (2 / 2.75)) {
      t -= (1.5 / 2.75);
      return (7.5625 * t * t + 0.75) * 1.2;
    } else if (t < (2.5 / 2.75)) {
      t -= (2.25 / 2.75);
      return (7.5625 * t * t + 0.9375) * 1.2;
    } else {
      t -= (2.625 / 2.75);
      return (7.5625 * t * t + 0.984375) * 1.2;
    }
  }

  function animate(time) {
    const progress = Math.min((time - startTime) / duration, 1);
    const eased = easeOutBounce(progress);

    zoomFactor = startZoom + (targetZoom - startZoom) * eased;
    offsetX = startX + (targetX - startX) * eased;
    offsetY = startY + (targetY - startY) * eased;


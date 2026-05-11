/* script.js - online-ready
   - cria Blob URL do worker (evita SecurityError)
   - pintura, marcadores, export GIF/PDF
*/

const $ = id => document.getElementById(id);

async function getGifWorkerScriptUrl() {
  const cdn = 'https://cdnjs.cloudflare.com/ajax/libs/gif.js/0.2.0/gif.worker.js';
  try {
    const res = await fetch(cdn, { mode: 'cors' });
    if (!res.ok) throw new Error('CDN fetch failed: ' + res.status);
    const text = await res.text();
    const blob = new Blob([text], { type: 'application/javascript' });
    return URL.createObjectURL(blob);
  } catch (err) {
    console.warn('CDN worker fetch failed, fallback to local gif.worker.js if available. Error:', err);
    return 'gif.worker.js';
  }
}

window.addEventListener('load', () => {
  const fileInput = $('fileImage');
  const colorPicker = $('colorPicker');
  const lineWidthInput = $('lineWidth');

  const canvasBase = $('canvasBase');
  const canvasPaint = $('canvasPaint');
  const mapaContainer = $('mapaContainer');
  const formulario = $('formulario');

  if (!canvasBase || !canvasPaint || !mapaContainer || !formulario) {
    console.warn('Elementos essenciais não encontrados.');
    return;
  }

  let strokeStyle = colorPicker ? colorPicker.value : '#000000';
  let lineWidth = lineWidthInput ? parseInt(lineWidthInput.value, 10) : 4;
  let mode = 'none';
  let drawing = false;
  let last = { x: 0, y: 0 };
  let addMarkerType = null;

  function resizeCanvasToContainer(canvas) {
    const rect = mapaContainer.getBoundingClientRect();
    const cssW = rect.width || 700;
    const cssH = rect.height || 842;
    const dpr = window.devicePixelRatio || 1;
    canvas.style.width = cssW + 'px';
    canvas.style.height = cssH + 'px';
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return ctx;
  }

  let ctxBase = resizeCanvasToContainer(canvasBase);
  let ctxPaint = resizeCanvasToContainer(canvasPaint);

  function applyPaintSettings() {
    if (!ctxPaint) return;
    ctxPaint.lineCap = 'round';
    ctxPaint.lineJoin = 'round';
    ctxPaint.strokeStyle = strokeStyle;
    ctxPaint.lineWidth = lineWidth;
    ctxPaint.globalCompositeOperation = 'source-over';
  }
  applyPaintSettings();

  function drawBasePlaceholder() {
    ctxBase.clearRect(0, 0, canvasBase.width, canvasBase.height);
    ctxBase.fillStyle = '#fff';
    ctxBase.fillRect(0, 0, canvasBase.width, canvasBase.height);
    ctxBase.fillStyle = '#999';
    ctxBase.font = '16px Arial';
    ctxBase.textAlign = 'center';
    const x = (canvasBase.width / (window.devicePixelRatio || 1)) / 2;
    const y = (canvasBase.height / (window.devicePixelRatio || 1)) / 2;
    ctxBase.fillText('Imagem base (selecione um arquivo)', x, y);
  }
  drawBasePlaceholder();

  function drawImageToCanvas(img) {
    const paintBackup = document.createElement('canvas');
    paintBackup.width = canvasPaint.width;
    paintBackup.height = canvasPaint.height;
    paintBackup.getContext('2d').drawImage(canvasPaint, 0, 0);

    ctxBase = resizeCanvasToContainer(canvasBase);
    ctxPaint = resizeCanvasToContainer(canvasPaint);

    const cssW = canvasBase.clientWidth;
    const cssH = canvasBase.clientHeight;
    const imgRatio = img.naturalWidth / img.naturalHeight;
    const canvasRatio = cssW / cssH;
    let drawW, drawH, offsetX, offsetY;

    if (imgRatio > canvasRatio) {
      drawW = cssW;
      drawH = cssW / imgRatio;
      offsetX = 0;
      offsetY = (cssH - drawH) / 2;
    } else {
      drawH = cssH;
      drawW = cssH * imgRatio;
      offsetX = (cssW - drawW) / 2;
      offsetY = 0;
    }

    ctxBase.clearRect(0, 0, canvasBase.width, canvasBase.height);
    ctxBase.drawImage(img, offsetX, offsetY, drawW, drawH);

    ctxPaint.clearRect(0, 0, canvasPaint.width, canvasPaint.height);
    ctxPaint.drawImage(paintBackup, 0, 0, paintBackup.width, paintBackup.height, 0, 0, canvasPaint.clientWidth, canvasPaint.clientHeight);

    applyPaintSettings();
  }

  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        drawImageToCanvas(img);
        URL.revokeObjectURL(url);
      };
      img.onerror = () => {
        console.error('Erro ao carregar imagem local');
        URL.revokeObjectURL(url);
        drawBasePlaceholder();
      };
      img.src = url;
    });
  }

  function clientToCanvas(canvas, clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    return { x: clientX - rect.left, y: clientY - rect.top };
  }

  function onPointerDown(e) {
    if (addMarkerType) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    drawing = true;
    const p = clientToCanvas(canvasPaint, e.clientX, e.clientY);
    last.x = p.x; last.y = p.y;
    e.preventDefault();
  }

  function onPointerMove(e) {
    if (!drawing) return;
    const p = clientToCanvas(canvasPaint, e.clientX, e.clientY);
    if (!ctxPaint) return;
    ctxPaint.lineCap = 'round';
    ctxPaint.lineJoin = 'round';
    if (mode === 'pintar') {
      ctxPaint.globalCompositeOperation = 'source-over';
      ctxPaint.strokeStyle = strokeStyle;
      ctxPaint.lineWidth = lineWidth;
    } else if (mode === 'apagar') {
      ctxPaint.globalCompositeOperation = 'destination-out';
      ctxPaint.lineWidth = Math.max(lineWidth * 2, 12);
    } else return;
    ctxPaint.beginPath();
    ctxPaint.moveTo(last.x, last.y);
    ctxPaint.lineTo(p.x, p.y);
    ctxPaint.stroke();
    last.x = p.x; last.y = p.y;
    e.preventDefault();
  }

  function onPointerUp() { drawing = false; }

  if (window.PointerEvent) {
    canvasPaint.addEventListener('pointerdown', onPointerDown, { passive: false });
    canvasPaint.addEventListener('pointermove', onPointerMove, { passive: false });
    canvasPaint.addEventListener('pointerup', onPointerUp, { passive: false });
    canvasPaint.addEventListener('pointercancel', onPointerUp, { passive: false });
  } else {
    canvasPaint.addEventListener('mousedown', onPointerDown, { passive: false });
    canvasPaint.addEventListener('mousemove', onPointerMove, { passive: false });
    canvasPaint.addEventListener('mouseup', onPointerUp, { passive: false });
    canvasPaint.addEventListener('touchstart', (ev) => {
      if (addMarkerType) return;
      const t = ev.changedTouches[0];
      onPointerDown({ clientX: t.clientX, clientY: t.clientY, pointerType: 'touch', button: 0, preventDefault: () => ev.preventDefault() });
    }, { passive: false });
    canvasPaint.addEventListener('touchmove', (ev) => {
      const t = ev.changedTouches[0];
      onPointerMove({ clientX: t.clientX, clientY: t.clientY, pointerType: 'touch', preventDefault: () => ev.preventDefault() });
    }, { passive: false });
    canvasPaint.addEventListener('touchend', onPointerUp, { passive: false });
  }

  function setActive(id) {
    document.querySelectorAll('.botoes button').forEach(b => b.classList.remove('botaoAtivo'));
    const el = document.getElementById(id);
    if (el) el.classList.add('botaoAtivo');
  }

  const btnPintar = $('btnPintar');
  const btnApagar = $('btnApagar');
  const btnParar = $('btnParar');
  const btnLimpar = $('btnLimpar');
  const btnZoomMais = $('btnZoomMais');
  const btnZoomMenos = $('btnZoomMenos');
  const btnResetZoom = $('btnResetZoom');

  if (btnPintar) btnPintar.addEventListener('click', () => { mode = 'pintar'; addMarkerType = null; setActive('btnPintar'); });
  if (btnApagar) btnApagar.addEventListener('click', () => { mode = 'apagar'; addMarkerType = null; setActive('btnApagar'); });
  if (btnParar) btnParar.addEventListener('click', () => { mode = 'none'; addMarkerType = null; setActive('btnParar'); });
  if (btnLimpar) btnLimpar.addEventListener('click', () => ctxPaint.clearRect(0, 0, canvasPaint.width, canvasPaint.height));
  if (btnZoomMais) btnZoomMais.addEventListener('click', () => zoom(1.1));
  if (btnZoomMenos) btnZoomMenos.addEventListener('click', () => zoom(0.9));
  if (btnResetZoom) btnResetZoom.addEventListener('click', () => zoomReset());

  if (colorPicker) colorPicker.addEventListener('input', (e) => { strokeStyle = e.target.value; if (ctxPaint) ctxPaint.strokeStyle = strokeStyle; });
  if (lineWidthInput) lineWidthInput.addEventListener('input', (e) => { lineWidth = parseInt(e.target.value, 10) || 4; if (ctxPaint) ctxPaint.lineWidth = lineWidth; });

  let currentScale = 1;
  function zoom(factor) {
    currentScale *= factor;
    currentScale = Math.min(Math.max(currentScale, 0.5), 3);
    mapaContainer.style.transform = `scale(${currentScale})`;
  }
  function zoomReset() { currentScale = 1; mapaContainer.style.transform = 'scale(1)'; }

  function createMarker(type, x, y) {
    const el = document.createElement('div');
    el.className = 'marker';
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    el.draggable = true;
    if (type === 'C') {
      el.innerHTML = '<svg width="48" height="48" viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="18" stroke="#d00" stroke-width="3" fill="rgba(255,0,0,0.08)"/></svg>';
    } else {
      el.innerHTML = `<div class="label">${type}</div>`;
    }
    el.addEventListener('dragstart', (ev) => {
      ev.dataTransfer.setData('text/plain', '');
      el.dataset.dragging = '1';
    });
    el.addEventListener('dragend', (ev) => {
      el.dataset.dragging = '0';
      const rect = mapaContainer.getBoundingClientRect();
      const nx = ev.clientX - rect.left;
      const ny = ev.clientY - rect.top;
      el.style.left = `${nx}px`;
      el.style.top = `${ny}px`;
    });
    formulario.appendChild(el);
    return el;
  }

  function enableAddMarker(type) {
    addMarkerType = type;
    mode = 'none';
    setActive('btnParar');
    mapaContainer.style.cursor = 'crosshair';
  }
  function disableAddMarker() {
    addMarkerType = null;
    mapaContainer.style.cursor = '';
  }

  const btnSetD = $('btnSetD');
  const btnSetI = $('btnSetI');
  const btnCircle = $('btnCircle');

  if (btnSetD) btnSetD.addEventListener('click', () => enableAddMarker('D'));
  if (btnSetI) btnSetI.addEventListener('click', () => enableAddMarker('I'));
  if (btnCircle) btnCircle.addEventListener('click', () => enableAddMarker('C'));

  mapaContainer.addEventListener('click', (ev) => {
    if (!addMarkerType) return;
    const rect = mapaContainer.getBoundingClientRect();
    const x = ev.clientX - rect.left;
    const y = ev.clientY - rect.top;
    createMarker(addMarkerType, x, y);
    disableAddMarker();
  });

  function composeFullCanvas() {
    const cssW = canvasBase.clientWidth;
    const cssH = canvasBase.clientHeight;
    const dpr = window.devicePixelRatio || 1;
    const tmp = document.createElement('canvas');
    tmp.width = Math.round(cssW * dpr);
    tmp.height = Math.round(cssH * dpr);
    const tctx = tmp.getContext('2d');
    tctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    tctx.drawImage(canvasBase, 0, 0, canvasBase.width, canvasBase.height, 0, 0, cssW, cssH);
    tctx.drawImage(canvasPaint, 0, 0, canvasPaint.width, canvasPaint.height, 0, 0, cssW, cssH);

    const markers = formulario.querySelectorAll('.marker');
    markers.forEach(m => {
      const left = parseFloat(m.style.left || 0);
      const top = parseFloat(m.style.top || 0);
      if (m.innerHTML.includes('<svg')) {
        tctx.strokeStyle = '#d00';
        tctx.lineWidth = 3;
        tctx.beginPath();
        tctx.arc(left, top, 18, 0, Math.PI * 2);
        tctx.stroke();
      } else {
        const text = m.textContent.trim();
        tctx.font = 'bold 14px Arial';
        const padding = 6;
        const w = tctx.measureText(text).width + padding * 2;
        const h = 20;
        tctx.fillStyle = '#fff';
        tctx.fillRect(left - w/2, top - h/2, w, h);
        tctx.strokeStyle = '#d00';
        tctx.lineWidth = 1;
        tctx.strokeRect(left - w/2, top - h/2, w, h);
        tctx.fillStyle = '#d00';
        tctx.fillText(text, left - w/2 + padding, top + 5);
      }
    });

    return tmp;
  }

  async function savePDFFlow() {
    try {
      const tmp = composeFullCanvas();
      const imgData = tmp.toDataURL('image/png');
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: [tmp.width / (window.devicePixelRatio || 1), tmp.height / (window.devicePixelRatio || 1)] });
      pdf.addImage(imgData, 'PNG', 0, 0, tmp.width / (window.devicePixelRatio || 1), tmp.height / (window.devicePixelRatio || 1));
      const pdfBlob = pdf.output('blob');
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'mapa-de-dor.pdf';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Erro ao gerar PDF', err);
      alert('Não foi possível gerar o PDF neste navegador.');
    }
  }

  async function saveGIFFlow() {
    try {
      const tmp = composeFullCanvas();
      const workerScriptUrl = await getGifWorkerScriptUrl();
      const gif = new GIF({ workers: 2, quality: 10, workerScript: workerScriptUrl, width: tmp.width, height: tmp.height });
      gif.addFrame(tmp, { delay: 200, copy: true });
      gif.on('finished', function (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'mapa-de-dor.gif';
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      });
      gif.render();
    } catch (err) {
      console.error('Erro ao gerar GIF', err);
      alert('Não foi possível gerar o GIF neste navegador.');
    }
  }

  const btnSavePDF = $('btnSavePDF');
  const btnSaveGIF = $('btnSaveGIF');
  if (btnSavePDF) btnSavePDF.addEventListener('click', savePDFFlow);
  if (btnSaveGIF) btnSaveGIF.addEventListener('click', saveGIFFlow);

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const paintBackup = document.createElement('canvas');
      paintBackup.width = canvasPaint.width;
      paintBackup.height = canvasPaint.height;
      paintBackup.getContext('2d').drawImage(canvasPaint, 0, 0);

      const baseBackup = document.createElement('canvas');
      baseBackup.width = canvasBase.width;
      baseBackup.height = canvasBase.height;
      baseBackup.getContext('2d').drawImage(canvasBase, 0, 0);

      ctxBase = resizeCanvasToContainer(canvasBase);
      ctxPaint = resizeCanvasToContainer(canvasPaint);

      ctxBase.clearRect(0, 0, canvasBase.width, canvasBase.height);
      ctxBase.drawImage(baseBackup, 0, 0, baseBackup.width, baseBackup.height, 0, 0, canvasBase.clientWidth, canvasBase.clientHeight);

      ctxPaint.clearRect(0, 0, canvasPaint.width, canvasPaint.height);
      ctxPaint.drawImage(paintBackup, 0, 0, paintBackup.width, paintBackup.height, 0, 0, canvasPaint.clientWidth, canvasPaint.clientHeight);

      applyPaintSettings();
    }, 150);
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'p') { mode = 'pintar'; addMarkerType = null; setActive('btnPintar'); }
    if (e.key === 'e') { mode = 'apagar'; addMarkerType = null; setActive('btnApagar'); }
    if (e.key === 'Escape') { mode = 'none'; addMarkerType = null; setActive('btnParar'); }
  });

  setActive('btnParar');
});

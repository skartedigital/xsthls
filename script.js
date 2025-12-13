const video = document.getElementById('video');
const overlay = document.getElementById('overlay');
const canvas = document.getElementById('canvas');

const captureBtn = document.getElementById('capture');
const switchCameraBtn = document.getElementById('switch-camera');

const previewContainer = document.getElementById('preview-container');
const photoPreview = document.getElementById('photo-preview');
const saveBtn = document.getElementById('save-btn');
const retryBtn = document.getElementById('retry-btn');
const instructions = document.getElementById('instructions');

let stream;
let usingFrontCamera = true;

const isiOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

// TAMANHO FIXO STORY
const OUTPUT_WIDTH = 1080;
const OUTPUT_HEIGHT = 1920;

// INICIAR CÂMERA
async function startCamera() {
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
  }

  stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: usingFrontCamera ? 'user' : 'environment' },
    audio: false
  });

  video.srcObject = stream;

  // espelha somente no ao vivo
  video.style.transform = usingFrontCamera ? 'scaleX(-1)' : 'scaleX(1)';
  overlay.style.transform = 'scaleX(1)';
}

// TROCAR CÂMERA
switchCameraBtn.onclick = () => {
  usingFrontCamera = !usingFrontCamera;
  startCamera();
};

// TIRAR FOTO (1080x1920)
captureBtn.onclick = () => {
  if (!stream) return;

  canvas.width = OUTPUT_WIDTH;
  canvas.height = OUTPUT_HEIGHT;
  const ctx = canvas.getContext('2d');

  const videoRatio = video.videoWidth / video.videoHeight;
  const canvasRatio = OUTPUT_WIDTH / OUTPUT_HEIGHT;

  let drawWidth, drawHeight, offsetX, offsetY;

  if (videoRatio > canvasRatio) {
    drawHeight = OUTPUT_HEIGHT;
    drawWidth = drawHeight * videoRatio;
    offsetX = (OUTPUT_WIDTH - drawWidth) / 2;
    offsetY = 0;
  } else {
    drawWidth = OUTPUT_WIDTH;
    drawHeight = drawWidth / videoRatio;
    offsetX = 0;
    offsetY = (OUTPUT_HEIGHT - drawHeight) / 2;
  }

  if (usingFrontCamera) {
    ctx.save();
    ctx.translate(OUTPUT_WIDTH, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, offsetX, offsetY, drawWidth, drawHeight);
    ctx.restore();
  } else {
    ctx.drawImage(video, offsetX, offsetY, drawWidth, drawHeight);
  }

  // MOLDURA 1080x1920
  ctx.drawImage(overlay, 0, 0, OUTPUT_WIDTH, OUTPUT_HEIGHT);

  const dataUrl = canvas.toDataURL('image/png');
  photoPreview.src = dataUrl;
  previewContainer.style.display = 'flex';
};

// SALVAR FOTO
saveBtn.onclick = () => {
  const link = document.createElement('a');
  link.download = 'story-moldura-1080x1920.png';
  link.href = photoPreview.src;
  link.click();

  if (isiOS) {
    instructions.style.display = 'block';
  }
};

// TIRAR OUTRA
retryBtn.onclick = () => {
  previewContainer.style.display = 'none';
  instructions.style.display = 'none';
};

// INICIALIZA
startCamera();

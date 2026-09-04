/**
 * CropDoctor AI - Main Application Controller
 */

// Global Instance Declarations
let aiClassifier;
let voiceAssistant;
let activeScanResult = null;
let currentViewMode = 'original'; // 'original' or 'heatmap'
let mediaStream = null;
let scanHistory = [];

document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

function initApp() {
  aiClassifier = new LeafAIClassifier();
  voiceAssistant = new AgriVoiceAssistant();

  setupDropzone();
  loadKnowledgeBaseGrid('All');
  loadScanHistory();
  updateRiskCalculator();
}

/* ==========================================================================
   Navigation & UI Utilities
   ========================================================================== */

function scrollToSection(sectionId) {
  const el = document.getElementById(sectionId);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' });
  }
}

function switchAppLanguage(langCode) {
  voiceAssistant.setLanguage(langCode);
  const isUrdu = langCode.startsWith('ur');

  if (isUrdu) {
    document.querySelector('.hero-headline').innerHTML = 'پودوں کی بیماریوں کا <span>مصنوعی ذہانت سے علاج</span>';
    document.querySelector('.hero-subtext').innerText = 'پتے کی تصویر اپلوڈ کریں اور فوراً بیماری کا علاج اور آرگینک دوائی معلوم کریں۔';
  } else {
    document.querySelector('.hero-headline').innerHTML = 'Protect Your Crops with <span>AI Leaf Analysis</span>';
    document.querySelector('.hero-subtext').innerText = 'Snap or upload a leaf photo to detect plant diseases instantly, map lesion heatmaps, and get expert treatment advice.';
  }
}

/* ==========================================================================
   Dropzone, File Upload & Camera Stream
   ========================================================================== */

function setupDropzone() {
  const dropzone = document.getElementById('dropzone');

  ['dragenter', 'dragover'].forEach(eventName => {
    dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropzone.classList.add('dragover');
    }, false);
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropzone.classList.remove('dragover');
    }, false);
  });

  dropzone.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    const files = dt.files;
    if (files.length > 0) {
      processSelectedFile(files[0]);
    }
  });
}

function handleFileSelect(event) {
  const file = event.target.files[0];
  if (file) {
    processSelectedFile(file);
  }
}

function processSelectedFile(file) {
  if (!file.type.startsWith('image/')) {
    alert('Please upload a valid leaf image file.');
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    triggerLeafAnalysis(e.target.result);
  };
  reader.readAsDataURL(file);
}

/* Quick 1-Click Demo Sample Launcher */
function loadDemoSample(sampleId) {
  let imgPath = 'tomato_late_blight.png';
  if (sampleId === 'corn_common_rust') imgPath = 'corn_common_rust.png';
  if (sampleId === 'healthy_plant') imgPath = 'healthy_pepper.png';

  triggerLeafAnalysis(imgPath, sampleId);
}

/* Camera Stream Controller */
async function toggleCameraStream() {
  const cameraContainer = document.getElementById('cameraContainer');
  const video = document.getElementById('cameraVideo');
  const btnStartCam = document.getElementById('btnStartCam');

  if (mediaStream) {
    // Stop camera
    mediaStream.getTracks().forEach(track => track.stop());
    mediaStream = null;
    cameraContainer.style.display = 'none';
    btnStartCam.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg> Live Camera Capture`;
    return;
  }

  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
    video.srcObject = mediaStream;
    cameraContainer.style.display = 'block';

    document.getElementById('dropzonePrompt').style.display = 'none';
    document.getElementById('previewContainer').style.display = 'none';

    btnStartCam.innerHTML = `📸 Capture Leaf Snapshot`;
    btnStartCam.onclick = captureCameraSnapshot;
  } catch (err) {
    alert('Webcam access failed or denied: ' + err.message);
  }
}

function captureCameraSnapshot() {
  const video = document.getElementById('cameraVideo');
  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth || 640;
  canvas.height = video.videoHeight || 480;
  
  const ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  
  const dataUrl = canvas.toDataURL('image/png');
  toggleCameraStream(); // Stop camera
  triggerLeafAnalysis(dataUrl);
}

/* ==========================================================================
   AI Image Classifier & Diagnostics Handler
   ========================================================================== */

async function triggerLeafAnalysis(imageSource, sampleIdHint = null) {
  // Show Beam Scanner effect
  const scanBeam = document.getElementById('scanBeam');
  const statusBadge = document.getElementById('scanStatusBadge');
  
  scanBeam.style.display = 'block';
  statusBadge.innerText = '● Analyzing Leaf Pixels...';
  statusBadge.style.color = '#f59e0b';

  const previewImg = document.getElementById('sourcePreviewImg');
  
  previewImg.onload = async () => {
    document.getElementById('dropzonePrompt').style.display = 'none';
    document.getElementById('previewContainer').style.display = 'block';

    // Perform AI Classification
    const result = await aiClassifier.analyzeLeafImage(previewImg, sampleIdHint);
    activeScanResult = result;

    // Render Heatmap on Canvas
    const heatmapCanvas = document.getElementById('heatmapCanvas');
    aiClassifier.renderLesionHeatmap(previewImg, heatmapCanvas, result);

    // Stop Beam
    scanBeam.style.display = 'none';
    statusBadge.innerText = '● Analysis Complete';
    statusBadge.style.color = '#10b981';

    // Display Results in UI
    displayDiagnosticResults(result);
    saveScanToHistory(result, imageSource);
    
    document.getElementById('btnResetScan').style.display = 'inline-flex';
    document.getElementById('btnExportPDF').style.display = 'inline-flex';
  };

  previewImg.src = imageSource;
}

function displayDiagnosticResults(res) {
  document.getElementById('resultsPlaceholder').style.display = 'none';
  document.getElementById('resultContent').style.display = 'block';

  const disease = res.disease;
  const metrics = res.metrics;

  document.getElementById('txtCrop').innerText = disease.crop.toUpperCase();
  document.getElementById('txtPathogen').innerText = disease.pathogenType.toUpperCase();
  document.getElementById('txtDiseaseName').innerText = disease.name;
  document.getElementById('txtDiseaseUrdu').innerText = disease.nameUrdu;
  document.getElementById('txtConfidence').innerText = res.confidence + '%';

  // Severity Badge
  const badgeSeverity = document.getElementById('badgeSeverity');
  const fillSeverity = document.getElementById('fillSeverity');
  badgeSeverity.innerText = disease.severity.toUpperCase();
  badgeSeverity.className = `severity-badge ${disease.severity.toLowerCase()}`;

  let severityPct = '85%';
  let severityColor = 'var(--red-danger)';
  if (disease.severity === 'Severe') { severityPct = '70%'; severityColor = 'var(--amber-warning)'; }
  if (disease.severity === 'Moderate') { severityPct = '50%'; severityColor = 'var(--blue-info)'; }
  if (disease.severity === 'Healthy') { severityPct = '10%'; severityColor = 'var(--emerald-primary)'; }
  
  fillSeverity.style.width = severityPct;
  fillSeverity.style.background = severityColor;

  // Metrics
  document.getElementById('metricGreen').innerText = metrics.greenFoliageRatio + '%';
  document.getElementById('metricChlorosis').innerText = metrics.chlorosisRatio + '%';
  document.getElementById('metricNecrosis').innerText = metrics.necrosisRatio + '%';
  document.getElementById('metricInfected').innerText = metrics.infectedSurfacePercent + '%';

  // Action Tabs
  document.getElementById('listOrganic').innerHTML = disease.organicControl.map(item => `<li>${item}</li>`).join('');
  document.getElementById('listChemical').innerHTML = disease.chemicalControl.map(item => `<li>${item}</li>`).join('');
  document.getElementById('listPrevention').innerHTML = disease.prevention.map(item => `<li>${item}</li>`).join('');

  // Voice announcement
  if (voiceAssistant) {
    voiceAssistant.speak(`Analysis complete. Identified ${disease.name} on ${disease.crop} with ${res.confidence}% match.`);
  }
}

function toggleViewMode(mode) {
  currentViewMode = mode;
  const previewImg = document.getElementById('sourcePreviewImg');
  const heatmapCanvas = document.getElementById('heatmapCanvas');
  const btnOrig = document.getElementById('btnViewOriginal');
  const btnHeat = document.getElementById('btnViewHeatmap');

  if (mode === 'heatmap') {
    previewImg.style.display = 'none';
    heatmapCanvas.style.display = 'block';
    btnOrig.classList.remove('active');
    btnHeat.classList.add('active');
  } else {
    previewImg.style.display = 'block';
    heatmapCanvas.style.display = 'none';
    btnOrig.classList.add('active');
    btnHeat.classList.remove('active');
  }
}

function resetScanner() {
  document.getElementById('dropzonePrompt').style.display = 'block';
  document.getElementById('previewContainer').style.display = 'none';
  document.getElementById('cameraContainer').style.display = 'none';
  document.getElementById('resultsPlaceholder').style.display = 'block';
  document.getElementById('resultContent').style.display = 'none';
  document.getElementById('btnResetScan').style.display = 'none';
  document.getElementById('btnExportPDF').style.display = 'none';
  document.getElementById('fileInput').value = '';
}

function switchActionTab(tabKey) {
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));

  if (tabKey === 'organic') {
    event.target.classList.add('active');
    document.getElementById('paneOrganic').classList.add('active');
  } else if (tabKey === 'chemical') {
    event.target.classList.add('active');
    document.getElementById('paneChemical').classList.add('active');
  } else if (tabKey === 'prevention') {
    event.target.classList.add('active');
    document.getElementById('panePrevention').classList.add('active');
  }
}

/* ==========================================================================
   Micro-Climate Risk Calculator
   ========================================================================== */

function updateRiskCalculator() {
  const temp = parseInt(document.getElementById('sliderTemp').value);
  const hum = parseInt(document.getElementById('sliderHumidity').value);

  document.getElementById('lblTemp').innerText = `${temp}°C`;
  document.getElementById('lblHumidity').innerText = `${hum}%`;

  const txtStatus = document.getElementById('txtRiskStatus');
  const txtDesc = document.getElementById('txtRiskDesc');

  let riskPct = Math.round((hum * 0.7) + (temp > 15 && temp < 28 ? 30 : 10));
  riskPct = Math.min(99, Math.max(12, riskPct));

  if (hum > 80 && temp >= 14 && temp <= 25) {
    txtStatus.innerText = `HIGH OUTBREAK RISK (${riskPct}%)`;
    txtStatus.style.color = 'var(--red-danger)';
    txtDesc.innerText = 'Critical warning: High humidity (>80%) and mild temperature create prime spore germination conditions for Late Blight, Rust, and Anthracnose.';
  } else if (hum >= 60) {
    txtStatus.innerText = `MODERATE RISK (${riskPct}%)`;
    txtStatus.style.color = 'var(--amber-warning)';
    txtDesc.innerText = 'Moderate humidity. Scout field leaves every 2 days for early chlorosis or bullseye spot development.';
  } else {
    txtStatus.innerText = `LOW RISK (${riskPct}%)`;
    txtStatus.style.color = 'var(--mint-accent)';
    txtDesc.innerText = 'Environmental conditions are currently unfavorable for rapid fungal spore germination.';
  }
}

/* ==========================================================================
   Knowledge Base Grid & Details Modal
   ========================================================================== */

function loadKnowledgeBaseGrid(filterCrop = 'All') {
  const container = document.getElementById('kbGridContainer');
  container.innerHTML = '';

  const filtered = filterCrop === 'All' 
    ? DISEASE_DATABASE 
    : DISEASE_DATABASE.filter(d => d.crop.includes(filterCrop));

  filtered.forEach(item => {
    const card = document.createElement('div');
    card.className = 'kb-card';
    card.onclick = () => openDiseaseModal(item.id);

    card.innerHTML = `
      <div class="kb-crop-tag">${item.crop}</div>
      <div class="kb-dis-name">${item.name}</div>
      <div class="kb-dis-type">${item.pathogenType} Pathogen • ${item.severity}</div>
      <div style="font-size: 0.82rem; color: var(--text-muted); line-height: 1.4;">
        ${item.symptoms[0]}
      </div>
    `;

    container.appendChild(card);
  });
}

function filterKnowledgeBase(cropName) {
  document.querySelectorAll('.kb-filter-btn').forEach(btn => btn.classList.remove('active'));
  event.target.classList.add('active');
  loadKnowledgeBaseGrid(cropName);
}

function openDiseaseModal(diseaseId) {
  const item = DISEASE_DATABASE.find(d => d.id === diseaseId);
  if (!item) return;

  const modal = document.getElementById('diseaseModal');
  const body = document.getElementById('modalCardBody');

  body.innerHTML = `
    <div style="font-size: 0.85rem; color: var(--mint-accent); font-weight: 700; text-transform: uppercase;">${item.crop} • ${item.scientificName}</div>
    <h2 style="font-size: 1.8rem; margin: 0.2rem 0;">${item.name}</h2>
    <div style="font-size: 1.1rem; color: var(--text-muted); margin-bottom: 1.25rem; font-family: serif;">${item.nameUrdu}</div>

    <div style="margin-bottom: 1.25rem;">
      <h4 style="color: var(--mint-accent);">Key Symptoms:</h4>
      <ul style="padding-left: 1.25rem; font-size: 0.9rem; color: var(--text-muted);">
        ${item.symptoms.map(s => `<li>${s}</li>`).join('')}
      </ul>
    </div>

    <div style="margin-bottom: 1.25rem;">
      <h4 style="color: var(--mint-accent);">Organic Control Remedies:</h4>
      <ul style="padding-left: 1.25rem; font-size: 0.9rem; color: var(--text-muted);">
        ${item.organicControl.map(s => `<li>${s}</li>`).join('')}
      </ul>
    </div>

    <div style="margin-bottom: 1.25rem;">
      <h4 style="color: var(--mint-accent);">Recommended Chemical Fungicide:</h4>
      <ul style="padding-left: 1.25rem; font-size: 0.9rem; color: var(--text-muted);">
        ${item.chemicalControl.map(s => `<li>${s}</li>`).join('')}
      </ul>
    </div>
  `;

  modal.style.display = 'flex';
}

function closeDiseaseModal() {
  document.getElementById('diseaseModal').style.display = 'none';
}

/* ==========================================================================
   Scan History Persistence & Export PDF Report
   ========================================================================== */

function saveScanToHistory(res, imageSrc) {
  const record = {
    id: Date.now(),
    date: new Date().toLocaleString(),
    crop: res.disease.crop,
    disease: res.disease.name,
    confidence: res.confidence + '%',
    severity: res.disease.severity,
    imageThumbnail: imageSrc
  };

  scanHistory.unshift(record);
  if (scanHistory.length > 20) scanHistory.pop();

  localStorage.setItem('cropdoctor_history', JSON.stringify(scanHistory));
  renderScanHistoryTable();
}

function loadScanHistory() {
  const saved = localStorage.getItem('cropdoctor_history');
  if (saved) {
    try {
      scanHistory = JSON.parse(saved);
      renderScanHistoryTable();
    } catch (e) {
      scanHistory = [];
    }
  }
}

function renderScanHistoryTable() {
  const tbody = document.getElementById('historyTableBody');
  if (!tbody) return;

  if (scanHistory.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted);">No scan history saved yet.</td></tr>`;
    return;
  }

  tbody.innerHTML = scanHistory.map(item => `
    <tr>
      <td style="font-size: 0.85rem;">${item.date}</td>
      <td style="font-weight: 700;">${item.crop}</td>
      <td>${item.disease}</td>
      <td style="color: var(--mint-accent); font-weight: 700;">${item.confidence}</td>
      <td><span class="severity-badge ${item.severity.toLowerCase()}">${item.severity}</span></td>
      <td>
        <button class="btn-outline" style="padding: 0.25rem 0.6rem; font-size: 0.75rem;" onclick="exportAdvisoryReport()">Print Report</button>
      </td>
    </tr>
  `).join('');
}

function clearScanHistory() {
  scanHistory = [];
  localStorage.removeItem('cropdoctor_history');
  renderScanHistoryTable();
}

function exportAdvisoryReport() {
  if (!activeScanResult) {
    alert('Please complete a leaf scan first.');
    return;
  }

  const printWindow = window.open('', '_blank');
  const d = activeScanResult.disease;

  printWindow.document.write(`
    <html>
    <head>
      <title>CropDoctor AI - Field Diagnostic Advisory Report</title>
      <style>
        body { font-family: sans-serif; padding: 2rem; color: #1e293b; line-height: 1.5; }
        h1 { color: #059669; border-bottom: 2px solid #059669; padding-bottom: 0.5rem; }
        .header-meta { margin-bottom: 2rem; color: #64748b; font-size: 0.9rem; }
        .box { border: 1px solid #cbd5e1; border-radius: 8px; padding: 1.25rem; margin-bottom: 1.5rem; }
        .title { font-weight: bold; font-size: 1.1rem; color: #0f172a; margin-bottom: 0.5rem; }
      </style>
    </head>
    <body>
      <h1>CropDoctor AI - Field Diagnostic Advisory Report</h1>
      <div class="header-meta">Generated Date: ${new Date().toLocaleString()} | Diagnostic Match Score: ${activeScanResult.confidence}%</div>

      <div class="box">
        <div class="title">Target Crop & Pathogen Diagnosis</div>
        <p><strong>Crop Type:</strong> ${d.crop}</p>
        <p><strong>Diagnosed Condition:</strong> ${d.name} (${d.nameUrdu})</p>
        <p><strong>Pathogen Classification:</strong> ${d.pathogenType}</p>
        <p><strong>Severity Index:</strong> ${d.severity}</p>
        <p><strong>Infected Leaf Surface:</strong> ${activeScanResult.metrics.infectedSurfacePercent}%</p>
      </div>

      <div class="box">
        <div class="title">Organic Treatment Protocol</div>
        <ul>${d.organicControl.map(c => `<li>${c}</li>`).join('')}</ul>
      </div>

      <div class="box">
        <div class="title">Chemical Fungicide & Dosage Application</div>
        <ul>${d.chemicalControl.map(c => `<li>${c}</li>`).join('')}</ul>
      </div>

      <script>window.print();</script>
    </body>
    </html>
  `);
  printWindow.document.close();
}

/* ==========================================================================
   AI Agronomist Voice Assistant & Floating Chat
   ========================================================================== */

function toggleVoiceDrawer() {
  const drawer = document.getElementById('voiceDrawer');
  drawer.style.display = drawer.style.display === 'flex' ? 'none' : 'flex';
}

function toggleMicRecording() {
  const fab = document.getElementById('fabVoice');
  voiceAssistant.toggleListening(
    (transcript) => {
      // Result callback
      addChatMessage(transcript, 'user');
      const reply = voiceAssistant.processAgronomistQuery(transcript, activeScanResult ? activeScanResult.disease : null);
      addChatMessage(reply, 'bot');
      voiceAssistant.speak(reply);
    },
    (isListening) => {
      // State change callback
      if (isListening) {
        fab.classList.add('listening');
      } else {
        fab.classList.remove('listening');
      }
    }
  );
}

function sendChatMessage() {
  const input = document.getElementById('txtChatInput');
  const text = input.value.trim();
  if (!text) return;

  addChatMessage(text, 'user');
  input.value = '';

  const reply = voiceAssistant.processAgronomistQuery(text, activeScanResult ? activeScanResult.disease : null);
  setTimeout(() => {
    addChatMessage(reply, 'bot');
    voiceAssistant.speak(reply);
  }, 400);
}

function addChatMessage(text, sender) {
  const box = document.getElementById('chatMessages');
  const msg = document.createElement('div');
  msg.className = `chat-msg ${sender}`;
  msg.innerText = text;
  box.appendChild(msg);
  box.scrollTop = box.scrollHeight;
}

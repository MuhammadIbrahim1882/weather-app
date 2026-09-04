/**
 * TruthGuard AI - Main Application Controller
 * Handles user interactions, mode switching, UI animations,
 * history persistence, and report generation.
 */

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const mainInputText = document.getElementById('main-input-text');
  const sourceUrlInput = document.getElementById('source-url-input');
  const btnRunAnalysis = document.getElementById('btn-run-analysis');
  const btnClearInput = document.getElementById('btn-clear-input');
  const btnPasteClipboard = document.getElementById('btn-paste-clipboard');
  const btnVoiceInput = document.getElementById('btn-voice-input');
  const btnCopyReport = document.getElementById('btn-copy-report');
  const btnExportPdf = document.getElementById('btn-export-pdf');
  const charCounter = document.getElementById('char-counter');
  const readingTime = document.getElementById('reading-time');
  const samplesContainer = document.getElementById('samples-container');
  const inputPromptLabel = document.getElementById('input-prompt-label');

  // Radial Meter & Telemetry
  const meterProgressRing = document.getElementById('meter-progress-ring');
  const meterScoreDisplay = document.getElementById('meter-score-display');
  const tierBadge = document.getElementById('tier-badge');
  const tierSummaryText = document.getElementById('tier-summary-text');

  // Sub-metrics
  const valSensationalism = document.getElementById('val-sensationalism');
  const barSensationalism = document.getElementById('bar-sensationalism');
  const valEmotional = document.getElementById('val-emotional');
  const barEmotional = document.getElementById('bar-emotional');
  const valEvidence = document.getElementById('val-evidence');
  const barEvidence = document.getElementById('bar-evidence');
  const valObjectivity = document.getElementById('val-objectivity');
  const barObjectivity = document.getElementById('bar-objectivity');

  // Diagnostics & Annotated Text
  const findingsContainer = document.getElementById('findings-container');
  const diagnosticCount = document.getElementById('diagnostic-count');
  const annotatedTextDisplay = document.getElementById('annotated-text-display');

  // History & Modal
  const btnHistoryToggle = document.getElementById('btn-history-toggle');
  const historyModal = document.getElementById('history-modal');
  const modalClose = document.getElementById('modal-close');
  const historyCount = document.getElementById('history-count');
  const historyItemsContainer = document.getElementById('history-items-container');
  const btnClearHistory = document.getElementById('btn-clear-history');

  // Toast
  const toastNotice = document.getElementById('toast-notice');
  const toastMsg = document.getElementById('toast-msg');

  // Application State
  let currentMode = 'article';
  let lastAnalysisResult = null;
  const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * 90; // ~565.48

  // Initialize
  initApp();

  function initApp() {
    renderSamples();
    setupEventListeners();
    updateHistoryCount();
    setMeterScore(0, 'secondary');

    // Auto-load first sample for immediate visual delight
    if (typeof SAMPLE_DATA !== 'undefined' && SAMPLE_DATA.length > 0) {
      loadSample(SAMPLE_DATA[0]);
    }
  }

  /**
   * Set up all UI event listeners
   */
  function setupEventListeners() {
    // Mode switcher
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentMode = btn.getAttribute('data-mode');
        handleModeChange(currentMode);
      });
    });

    // Input listeners
    mainInputText.addEventListener('input', () => {
      updateInputCounters();
    });

    // Action buttons
    btnRunAnalysis.addEventListener('click', () => {
      executeAnalysis();
    });

    btnClearInput.addEventListener('click', () => {
      mainInputText.value = '';
      sourceUrlInput.value = '';
      updateInputCounters();
      resetTelemetryView();
      showToast('Console cleared');
    });

    btnPasteClipboard.addEventListener('click', async () => {
      try {
        const text = await navigator.clipboard.readText();
        if (text) {
          mainInputText.value = text;
          updateInputCounters();
          showToast('Pasted from clipboard');
        }
      } catch (err) {
        showToast('Clipboard access denied or unsupported');
      }
    });

    // Voice dictation
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;

      let isRecording = false;

      btnVoiceInput.addEventListener('click', () => {
        if (!isRecording) {
          try {
            recognition.start();
            isRecording = true;
            btnVoiceInput.style.color = '#ef4444';
            showToast('Listening for claim...');
          } catch (e) {
            showToast('Microphone unavailable');
          }
        } else {
          recognition.stop();
          isRecording = false;
          btnVoiceInput.style.color = '';
        }
      });

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        mainInputText.value = (mainInputText.value ? mainInputText.value + ' ' : '') + transcript;
        updateInputCounters();
        isRecording = false;
        btnVoiceInput.style.color = '';
        showToast('Claim captured via voice');
      };

      recognition.onerror = () => {
        isRecording = false;
        btnVoiceInput.style.color = '';
        showToast('Voice capture error');
      };
    } else {
      btnVoiceInput.style.display = 'none';
    }

    // Export & Copy
    btnCopyReport.addEventListener('click', copyDossierReport);
    btnExportPdf.addEventListener('click', () => window.print());

    // History Modal
    btnHistoryToggle.addEventListener('click', () => {
      renderHistoryModal();
      historyModal.classList.add('active');
    });

    modalClose.addEventListener('click', () => {
      historyModal.classList.remove('active');
    });

    historyModal.addEventListener('click', (e) => {
      if (e.target === historyModal) {
        historyModal.classList.remove('active');
      }
    });

    btnClearHistory.addEventListener('click', () => {
      localStorage.removeItem('truthguard_history');
      renderHistoryModal();
      updateHistoryCount();
      showToast('History cleared');
    });
  }

  /**
   * Handle mode switching
   */
  function handleModeChange(mode) {
    if (mode === 'headline') {
      inputPromptLabel.textContent = 'Enter a single headline or social media title:';
      mainInputText.placeholder = 'e.g. "Scientists Discover Ancient Subterranean Ecosystem in Antarctica"';
      mainInputText.style.minHeight = '120px';
    } else if (mode === 'url') {
      inputPromptLabel.textContent = 'Paste article URL or domain to audit source reputation:';
      mainInputText.placeholder = 'e.g. https://www.reuters.com/world/breaking-story or suspicious-news.xyz';
      mainInputText.style.minHeight = '100px';
    } else {
      inputPromptLabel.textContent = 'Paste article body or social media post content:';
      mainInputText.placeholder = 'Paste article text, breaking social media claim, or news report here to run comprehensive AI credibility screening...';
      mainInputText.style.minHeight = '190px';
    }
  }

  /**
   * Render curated test sample cards
   */
  function renderSamples() {
    if (typeof SAMPLE_DATA === 'undefined') return;

    samplesContainer.innerHTML = '';
    SAMPLE_DATA.forEach(sample => {
      const card = document.createElement('div');
      card.className = 'sample-card';
      card.innerHTML = `
        <div class="sample-card-header">
          <span class="sample-tag ${sample.expectedTier}">${sample.type}</span>
          <span style="font-size: 0.7rem; color: var(--text-dim);">${sample.category}</span>
        </div>
        <div class="sample-card-title">${escapeHtml(sample.title)}</div>
      `;
      card.addEventListener('click', () => {
        loadSample(sample);
      });
      samplesContainer.appendChild(card);
    });
  }

  /**
   * Load a chosen sample into the workspace and trigger analysis
   */
  function loadSample(sample) {
    mainInputText.value = sample.content;
    sourceUrlInput.value = sample.url || '';
    updateInputCounters();
    executeAnalysis();
    showToast(`Loaded: ${sample.title.slice(0, 32)}...`);
  }

  /**
   * Update character and word counters
   */
  function updateInputCounters() {
    const text = mainInputText.value;
    const charCount = text.length;
    const words = text.trim().split(/\s+/).filter(w => w.length > 0);
    const wordCount = words.length;

    charCounter.textContent = `${charCount.toLocaleString()} characters`;
    readingTime.textContent = `${wordCount.toLocaleString()} words (~${Math.max(1, Math.ceil(wordCount / 200))} min read)`;
  }

  /**
   * Execute Core Analysis
   */
  function executeAnalysis() {
    const text = mainInputText.value.trim();
    const url = sourceUrlInput.value.trim();

    if (!text && !url) {
      showToast('Please provide text or URL to evaluate');
      return;
    }

    // Run analysis through engine
    const analysisTarget = text || url;
    const result = TruthAnalyzer.analyzeText(analysisTarget, url);
    lastAnalysisResult = { ...result, rawInput: analysisTarget, url };

    // Update Telemetry Displays
    updateTelemetry(result);

    // Save to History
    saveToHistory(lastAnalysisResult);
    updateHistoryCount();
  }

  /**
   * Updates all telemetry visuals and badges
   */
  function updateTelemetry(result) {
    // 1. Animated Score Ring
    animateScoreRing(result.truthIndex, result.tierClass);

    // 2. Tier Badge & Summary
    tierBadge.className = `tier-badge ${result.tierClass}`;
    tierBadge.textContent = result.tierLabel;
    tierSummaryText.textContent = result.summaryDesc;

    // 3. Sub-scores Progress Bars
    animateProgressBar(barSensationalism, valSensationalism, result.subScores.sensationalism);
    animateProgressBar(barEmotional, valEmotional, result.subScores.emotionalBias);
    animateProgressBar(barEvidence, valEvidence, result.subScores.evidenceAttribution);
    animateProgressBar(barObjectivity, valObjectivity, result.subScores.objectivity);

    // 4. Diagnostic Findings
    renderDiagnostics(result.diagnostics);

    // 5. Annotated Text Inspector
    if (result.annotatedHtml) {
      annotatedTextDisplay.innerHTML = result.annotatedHtml;
    } else {
      annotatedTextDisplay.innerHTML = `<p style="color: var(--text-dim); font-style: italic;">No specific manipulation patterns or citations detected in short text.</p>`;
    }
  }

  /**
   * Animate radial progress circle and number
   */
  function animateScoreRing(targetScore, tierClass) {
    let current = 0;
    const duration = 800; // ms
    const startTime = performance.now();

    // Map color
    let strokeColor = '#00f0ff';
    if (tierClass === 'success') strokeColor = '#10b981';
    else if (tierClass === 'warning') strokeColor = '#f59e0b';
    else if (tierClass === 'danger') strokeColor = '#f43f5e';

    meterProgressRing.style.stroke = strokeColor;

    function step(timestamp) {
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      current = Math.round(eased * targetScore);

      meterScoreDisplay.innerHTML = `${current}<span class="score-unit">%</span>`;

      // Update stroke-dashoffset
      const offset = CIRCLE_CIRCUMFERENCE - (eased * (targetScore / 100) * CIRCLE_CIRCUMFERENCE);
      meterProgressRing.style.strokeDashoffset = offset;

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        meterScoreDisplay.innerHTML = `${targetScore}<span class="score-unit">%</span>`;
      }
    }

    requestAnimationFrame(step);
  }

  function setMeterScore(score, tierClass) {
    meterScoreDisplay.innerHTML = `${score}<span class="score-unit">%</span>`;
    meterProgressRing.style.strokeDashoffset = CIRCLE_CIRCUMFERENCE;
    meterProgressRing.style.stroke = 'rgba(255,255,255,0.1)';
  }

  function animateProgressBar(barElement, valElement, targetVal) {
    valElement.textContent = `${targetVal}%`;
    barElement.style.width = `${targetVal}%`;
  }

  /**
   * Render key diagnostic findings
   */
  function renderDiagnostics(diagnostics) {
    diagnosticCount.textContent = `${diagnostics.length} flags`;

    if (!diagnostics || diagnostics.length === 0) {
      findingsContainer.innerHTML = `
        <div class="finding-item success">
          <div class="finding-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>
          <div class="finding-content">
            <h4>No Deceptive Markers Detected</h4>
            <p>The analyzed sample did not trigger sensationalism or manipulative language flags.</p>
          </div>
        </div>
      `;
      return;
    }

    findingsContainer.innerHTML = '';
    diagnostics.forEach(item => {
      const div = document.createElement('div');
      div.className = `finding-item ${item.type}`;
      div.innerHTML = `
        <div class="finding-icon">
          ${getFindingIconSvg(item.icon)}
        </div>
        <div class="finding-content">
          <h4>${escapeHtml(item.title)}</h4>
          <p>${escapeHtml(item.detail)}</p>
        </div>
      `;
      findingsContainer.appendChild(div);
    });
  }

  function getFindingIconSvg(iconName) {
    switch (iconName) {
      case 'alert-triangle':
        return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`;
      case 'clock':
        return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`;
      case 'award':
      case 'check-circle':
        return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`;
      case 'globe':
        return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>`;
      default:
        return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
    }
  }

  function resetTelemetryView() {
    setMeterScore(0, 'secondary');
    tierBadge.className = 'tier-badge secondary';
    tierBadge.textContent = 'Awaiting Analysis';
    tierSummaryText.textContent = 'Provide text above or pick a sample preset to compute multi-factor NLP veracity metrics.';

    barSensationalism.style.width = '0%';
    valSensationalism.textContent = '0%';
    barEmotional.style.width = '0%';
    valEmotional.textContent = '0%';
    barEvidence.style.width = '0%';
    valEvidence.textContent = '0%';
    barObjectivity.style.width = '0%';
    valObjectivity.textContent = '0%';

    findingsContainer.innerHTML = `
      <div class="finding-item info">
        <div class="finding-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
        </div>
        <div class="finding-content">
          <h4>Heuristic Engine Ready</h4>
          <p>Paste text or load a preset on the left to review automated linguistic flags and source telemetry.</p>
        </div>
      </div>
    `;
    diagnosticCount.textContent = '0 flags';
    annotatedTextDisplay.innerHTML = `<p style="color: var(--text-dim); font-style: italic;">Analyzed text with interactive highlighted spans will appear here once verified.</p>`;
  }

  /**
   * Copy verification dossier report
   */
  function copyDossierReport() {
    if (!lastAnalysisResult) {
      showToast('Run an analysis first before copying report');
      return;
    }

    const report = `=========================================
TRUTHGUARD AI VERIFICATION DOSSIER
=========================================
Truth & Reliability Index: ${lastAnalysisResult.truthIndex}%
Classification Tier: ${lastAnalysisResult.tierLabel}
Assessment: ${lastAnalysisResult.summaryDesc}

CORE METRICS BREAKDOWN:
- Sensationalism & Hyperbole: ${lastAnalysisResult.subScores.sensationalism}%
- Emotional Coercion / Panic: ${lastAnalysisResult.subScores.emotionalBias}%
- Evidence & Citations: ${lastAnalysisResult.subScores.evidenceAttribution}%
- Journalistic Objectivity: ${lastAnalysisResult.subScores.objectivity}%

KEY DIAGNOSTIC FINDINGS:
${lastAnalysisResult.diagnostics.map(d => `* [${d.type.toUpperCase()}] ${d.title}: ${d.detail}`).join('\n')}

VERIFIED BY: TruthGuard AI v2.4 PRO
Timestamp: ${new Date().toLocaleString()}
=========================================`;

    navigator.clipboard.writeText(report).then(() => {
      showToast('Verification Dossier copied to clipboard!');
    }).catch(() => {
      showToast('Unable to copy dossier');
    });
  }

  /**
   * LocalStorage History
   */
  function getHistory() {
    try {
      const raw = localStorage.getItem('truthguard_history');
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function saveToHistory(item) {
    const list = getHistory();
    // Prepend and cap at 20
    list.unshift({
      id: Date.now(),
      title: item.rawInput.slice(0, 70) + (item.rawInput.length > 70 ? '...' : ''),
      content: item.rawInput,
      url: item.url,
      truthIndex: item.truthIndex,
      tierLabel: item.tierLabel,
      tierClass: item.tierClass,
      date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
    const trimmed = list.slice(0, 20);
    localStorage.setItem('truthguard_history', JSON.stringify(trimmed));
  }

  function updateHistoryCount() {
    const list = getHistory();
    historyCount.textContent = list.length;
  }

  function renderHistoryModal() {
    const list = getHistory();
    if (list.length === 0) {
      historyItemsContainer.innerHTML = `<p style="color: var(--text-dim); text-align: center; font-size: 0.85rem; padding: 2rem 0;">No saved verifications yet.</p>`;
      return;
    }

    historyItemsContainer.innerHTML = '';
    list.forEach(entry => {
      const div = document.createElement('div');
      div.className = 'history-item';
      div.innerHTML = `
        <div class="history-item-left">
          <div class="history-item-title">${escapeHtml(entry.title)}</div>
          <div class="history-item-meta">${entry.date} &bull; ${entry.tierLabel}</div>
        </div>
        <div>
          <span class="sample-tag ${entry.tierClass}">${entry.truthIndex}%</span>
        </div>
      `;
      div.addEventListener('click', () => {
        mainInputText.value = entry.content;
        sourceUrlInput.value = entry.url || '';
        updateInputCounters();
        executeAnalysis();
        historyModal.classList.remove('active');
        showToast('Restored verification from history');
      });
      historyItemsContainer.appendChild(div);
    });
  }

  /**
   * Toast notification helper
   */
  let toastTimeout;
  function showToast(message) {
    toastMsg.textContent = message;
    toastNotice.classList.add('visible');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toastNotice.classList.remove('visible');
    }, 2800);
  }

  function escapeHtml(str) {
    return (str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
});

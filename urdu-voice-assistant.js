/* ==========================================================================
   Urdu Voice Assistant - "آوازِ موسم" (Voice of Weather)
   Web Speech API (ur-PK) Speech-to-Text & Urdu Speech Synthesis Engine
   ========================================================================== */

class UrduVoiceAssistant {
  constructor() {
    this.recognition = null;
    this.synth = window.speechSynthesis || null;
    this.isListening = false;
    this.isSpeaking = false;
    this.supported = false;

    this.initSpeechRecognition();
  }

  /* ------------------------------------------------------------------------
     Initialize Web Speech API
     ------------------------------------------------------------------------ */
  initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.lang = 'ur-PK';
      this.recognition.continuous = false;
      this.recognition.interimResults = true;

      this.recognition.onstart = () => {
        this.isListening = true;
        this.updateUIListening(true);
      };

      this.recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        this.updateTranscriptUI(transcript);
        if (event.results[0].isFinal) {
          this.processUrduQuery(transcript);
        }
      };

      this.recognition.onerror = (event) => {
        console.warn('Urdu Speech Recognition Error:', event.error);
        this.isListening = false;
        this.updateUIListening(false);

        if (event.error === 'no-speech') {
          this.speakUrduResponse('معذرت، میں آپ کی آواز نہیں سن سکا۔ برائے مہربانی دوبارہ بولیں یا مائیک کے بٹن پر کلک کریں۔');
        } else if (event.error === 'not-allowed') {
          this.showMicPermissionNotice();
        }
      };

      this.recognition.onend = () => {
        this.isListening = false;
        this.updateUIListening(false);
      };

      this.supported = true;
    } else {
      console.warn('Web Speech Recognition API not supported in this browser.');
      this.supported = false;
    }
  }

  /* ------------------------------------------------------------------------
     Start / Stop Listening
     ------------------------------------------------------------------------ */
  toggleListening() {
    if (this.isListening) {
      this.stopListening();
    } else {
      this.startListening();
    }
  }

  startListening() {
    if (this.synth && this.synth.speaking) {
      this.synth.cancel();
    }

    if (!this.supported) {
      this.openModal();
      this.updateTranscriptUI('آواز کی شناخت فعال نہیں ہے۔ نیچے ٹیکسٹ یا سوال پر کلک کریں۔');
      return;
    }

    try {
      this.openModal();
      this.recognition.start();
    } catch (e) {
      console.error('Failed to start speech recognition:', e);
    }
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
    }
    this.isListening = false;
    this.updateUIListening(false);
  }

  /* ------------------------------------------------------------------------
     Natural Language Urdu Intent Processing
     ------------------------------------------------------------------------ */
  processUrduQuery(query) {
    const q = query.toLowerCase().trim();
    this.stopListening();

    const app = window.app;
    if (!app || !app.weatherData) {
      this.speakUrduResponse('معذرت، موسم کا ڈیٹا فی الحال لوڈ نہیں ہے۔');
      return;
    }

    const currentLoc = app.currentLocation;
    const current = app.weatherData.current;
    const daily = app.weatherData.daily;
    const displayTemp = app.formatTemp(current.temperature_2m);
    const weatherInfo = app.getWeatherInfo(current.weather_code, current.is_day);

    let responseText = '';
    let responseUrduAudio = '';

    // City switching intents in Urdu
    if (q.includes('سکردو') || q.includes('skardu')) {
      app.loadWeatherForLocation({ name: 'Skardu', country: 'Gilgit-Baltistan, Pakistan', lat: 35.2979, lon: 75.6337 });
      responseText = 'سکردو کا موسم لوڈ کر دیا گیا ہے۔';
      responseUrduAudio = 'سکردو کا موسم لوڈ کر دیا گیا ہے۔';
    } else if (q.includes('ہنزہ') || q.includes('hunza')) {
      app.loadWeatherForLocation({ name: 'Hunza', country: 'Gilgit-Baltistan, Pakistan', lat: 36.3167, lon: 74.6500 });
      responseText = 'ہنزہ وادی کا موسم لوڈ کر دیا گیا ہے۔';
      responseUrduAudio = 'ہنزہ وادی کا موسم لوڈ کر دیا گیا ہے۔';
    } else if (q.includes('گلگت') || q.includes('gilgit')) {
      app.loadWeatherForLocation({ name: 'Gilgit', country: 'Gilgit-Baltistan, Pakistan', lat: 35.9187, lon: 74.3125 });
      responseText = 'گلگت شہر کا موسم لوڈ کر دیا گیا ہے۔';
      responseUrduAudio = 'گلگت شہر کا موسم لوڈ کر دیا گیا ہے۔';
    } else if (q.includes('اسلام آباد') || q.includes('islamabad')) {
      app.loadWeatherForLocation({ name: 'Islamabad', country: 'Federal Capital, Pakistan', lat: 33.6844, lon: 73.0479 });
      responseText = 'اسلام آباد کا موسم لوڈ کر دیا گیا ہے۔';
      responseUrduAudio = 'اسلام آباد کا موسم لوڈ کر دیا گیا ہے۔';
    } 
    // Disaster & Alert queries
    else if (q.includes('الرٹ') || q.includes('خطرہ') || q.includes('ڈسائسٹر') || q.includes('لینڈ سلائیڈنگ') || q.includes('سیلاب')) {
      if (app.disasterAlertManager) {
        const evalRes = app.disasterAlertManager.evaluateRisks(app.weatherData, currentLoc);
        const topAlert = evalRes.alerts[0];
        responseText = `موجودہ خطرہ کا سطح ${evalRes.overallLevel} ہے۔ ${topAlert ? topAlert.titleUrdu + ': ' + topAlert.descUrdu : 'تمام صورتحال فی الحال نارمل ہے۔'}`;
        responseUrduAudio = responseText;
        app.disasterAlertManager.openSafetyModal(evalRes, currentLoc.name);
      }
    }
    // Rain forecast queries
    else if (q.includes('بارش') || q.includes('بوند') || q.includes('پانی')) {
      const popMax = daily ? daily.precipitation_probability_max[0] : 0;
      if (popMax > 50) {
        responseText = `${currentLoc.name} میں آج بارش کا امکان ${popMax} فیصد ہے۔ چھتری ساتھ رکھیں۔`;
      } else {
        responseText = `${currentLoc.name} میں آج بارش کے امکانی چانسز صرف ${popMax} فیصد ہیں۔ موسم کا امکان صاف رہنے کا ہے۔`;
      }
      responseUrduAudio = responseText;
    }
    // Temperature & general weather queries
    else if (q.includes('درجہ حرارت') || q.includes('گرمی') || q.includes('سردی') || q.includes('ٹمپریچر')) {
      responseText = `${currentLoc.name} میں اس وقت درجہ حرارت ${displayTemp} ڈگری سینٹی گریڈ ہے اور یہ ${weatherInfo.text} ہے۔`;
      responseUrduAudio = responseText;
    }
    // Default weather summary
    else {
      const highT = daily ? app.formatTemp(daily.temperature_2m_max[0]) : displayTemp;
      const lowT = daily ? app.formatTemp(daily.temperature_2m_min[0]) : displayTemp;
      responseText = `${currentLoc.name} میں اس وقت موسم ${weatherInfo.text} ہے۔ موجودہ درجہ حرارت ${displayTemp} ڈگری سینٹی گریڈ ہے، زیادہ سے زیادہ ${highT} اور کم سے کم ${lowT} ڈگری رہے گا۔`;
      responseUrduAudio = responseText;
    }

    this.speakUrduResponse(responseText, responseUrduAudio);
  }

  /* ------------------------------------------------------------------------
     Urdu Text-to-Speech Output
     ------------------------------------------------------------------------ */
  speakUrduResponse(text, audioText = null) {
    this.updateResponseUI(text);

    if (!this.synth) return;

    this.synth.cancel(); // Stop any ongoing speech

    const speechText = audioText || text;
    const utterance = new SpeechSynthesisUtterance(speechText);
    utterance.lang = 'ur-PK';
    utterance.rate = 0.95; // Natural speaking pace
    utterance.pitch = 1.0;

    // Try finding an Urdu voice
    const voices = this.synth.getVoices();
    const urduVoice = voices.find(v => v.lang.includes('ur') || v.lang.includes('hi') || v.name.includes('Urdu'));
    if (urduVoice) {
      utterance.voice = urduVoice;
    }

    utterance.onstart = () => {
      this.isSpeaking = true;
      this.updateUISpeaking(true);
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      this.updateUISpeaking(false);
    };

    utterance.onerror = (e) => {
      console.warn('Speech synthesis error:', e);
      this.isSpeaking = false;
      this.updateUISpeaking(false);
    };

    this.synth.speak(utterance);
  }

  /* ------------------------------------------------------------------------
     UI & Modal Render Logic
     ------------------------------------------------------------------------ */
  openModal() {
    let modal = document.getElementById('urduAssistantModal');
    if (!modal) {
      this.createModalDOM();
      modal = document.getElementById('urduAssistantModal');
    }
    modal.classList.add('active');
  }

  closeModal() {
    const modal = document.getElementById('urduAssistantModal');
    if (modal) modal.classList.remove('active');
    this.stopListening();
    if (this.synth) this.synth.cancel();
  }

  createModalDOM() {
    const modal = document.createElement('div');
    modal.id = 'urduAssistantModal';
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-card urdu-modal-card">
        <div class="modal-header">
          <div class="urdu-brand-header">
            <div class="mic-glow-icon">
              <i class="fa-solid fa-microphone-lines"></i>
            </div>
            <div>
              <h3>اردو وائس اسسٹنٹ — "آوازِ موسم"</h3>
              <p class="urdu-sub">اپنی زبان میں گلگت بلتستان کا موسم جانیے</p>
            </div>
          </div>
          <button class="close-modal-btn" id="closeUrduModalBtn"><i class="fa-solid fa-xmark"></i></button>
        </div>

        <div class="modal-body urdu-assistant-body">
          <!-- Voice Visualizer Waves -->
          <div class="voice-wave-container" id="voiceWaveVisualizer">
            <div class="wave-bar bar-1"></div>
            <div class="wave-bar bar-2"></div>
            <div class="wave-bar bar-3"></div>
            <div class="wave-bar bar-4"></div>
            <div class="wave-bar bar-5"></div>
          </div>

          <!-- Status Indicator -->
          <div class="status-indicator" id="assistantStatusIndicator">
            <span class="pulse-dot-green"></span>
            <span id="assistantStatusText">مائیک پر کلک کریں اور بولیں...</span>
          </div>

          <!-- Speech Transcript Box -->
          <div class="transcript-box" id="transcriptBox">
            <p id="transcriptText" class="transcript-text">آپ کا سوال یہاں نظر آئے گا...</p>
          </div>

          <!-- Response Box -->
          <div class="response-box" id="responseBox">
            <i class="fa-solid fa-robot bot-icon"></i>
            <p id="responseText" class="response-text">سلام! میں آپ کا اردو وائس اسسٹنٹ ہوں۔ موسم سے متعلق سوالات پوچھیں۔</p>
          </div>

          <!-- Direct Text Input Option -->
          <div class="urdu-input-row">
            <input type="text" id="urduTextInput" placeholder="اردو میں ٹائپ کریں یا سوال پوچھیں..." />
            <button class="btn btn-primary" id="sendUrduTextBtn"><i class="fa-solid fa-paper-plane"></i></button>
          </div>

          <!-- Quick Suggestion Chips -->
          <div class="suggestion-chips-title">
            <i class="fa-solid fa-wand-magic-sparkles"></i> منتخب سوالات (بٹن پر کلک کریں):
          </div>
          <div class="suggestion-chips">
            <button class="chip-btn" data-query="گلگت کا موسم کیسا ہے؟"><i class="fa-solid fa-mountain"></i> گلگت کا موسم</button>
            <button class="chip-btn" data-query="آج بارش ہوگی یا نہیں؟"><i class="fa-solid fa-cloud-rain"></i> بارش کی پیش گوئی</button>
            <button class="chip-btn" data-query="ڈسائسٹر الرٹ اور خطرہ"><i class="fa-solid fa-triangle-exclamation"></i> آفت و الرٹ</button>
            <button class="chip-btn" data-query="سکردو کا موسم"><i class="fa-solid fa-snowflake"></i> سکردو کا موسم</button>
            <button class="chip-btn" data-query="ہنزہ کا موسم"><i class="fa-solid fa-sun"></i> ہنزہ کا موسم</button>
            <button class="chip-btn" data-query="درجہ حرارت کتنا ہے؟"><i class="fa-solid fa-temperature-high"></i> درجہ حرارت</button>
          </div>
        </div>

        <div class="modal-footer assistant-footer">
          <button class="mic-main-btn" id="micMainBtn">
            <i class="fa-solid fa-microphone" id="micMainIcon"></i>
          </button>
          <span class="mic-hint" id="micHintText">بولنے کے لیے مائیک دبائیں</span>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Event Bindings
    document.getElementById('closeUrduModalBtn')?.addEventListener('click', () => this.closeModal());
    modal.addEventListener('click', (e) => {
      if (e.target === modal) this.closeModal();
    });

    const micBtn = document.getElementById('micMainBtn');
    micBtn?.addEventListener('click', () => this.toggleListening());

    const textInput = document.getElementById('urduTextInput');
    const sendBtn = document.getElementById('sendUrduTextBtn');

    const handleSendText = () => {
      const val = textInput.value.trim();
      if (val) {
        this.updateTranscriptUI(val);
        this.processUrduQuery(val);
        textInput.value = '';
      }
    };

    sendBtn?.addEventListener('click', handleSendText);
    textInput?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleSendText();
    });

    // Suggestion Chips Click
    const chipBtns = modal.querySelectorAll('.chip-btn');
    chipBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const query = btn.dataset.query;
        this.updateTranscriptUI(query);
        this.processUrduQuery(query);
      });
    });
  }

  updateUIListening(listening) {
    const wave = document.getElementById('voiceWaveVisualizer');
    const statusText = document.getElementById('assistantStatusText');
    const micIcon = document.getElementById('micMainIcon');
    const micBtn = document.getElementById('micMainBtn');

    if (listening) {
      wave?.classList.add('listening');
      if (statusText) statusText.textContent = 'سن رہا ہوں... (برائے مہربانی بولیں)';
      if (micIcon) micIcon.className = 'fa-solid fa-microphone-slash';
      micBtn?.classList.add('listening');
    } else {
      wave?.classList.remove('listening');
      if (statusText) statusText.textContent = 'مائیک پر کلک کریں اور بولیں...';
      if (micIcon) micIcon.className = 'fa-solid fa-microphone';
      micBtn?.classList.remove('listening');
    }
  }

  updateUISpeaking(speaking) {
    const wave = document.getElementById('voiceWaveVisualizer');
    const statusText = document.getElementById('assistantStatusText');

    if (speaking) {
      wave?.classList.add('speaking');
      if (statusText) statusText.textContent = 'جواب بول رہا ہوں...';
    } else {
      wave?.classList.remove('speaking');
      if (!this.isListening && statusText) {
        statusText.textContent = 'مائیک پر کلک کریں اور بولیں...';
      }
    }
  }

  updateTranscriptUI(text) {
    const tText = document.getElementById('transcriptText');
    if (tText) tText.textContent = text || '...';
  }

  updateResponseUI(text) {
    const rText = document.getElementById('responseText');
    if (rText) rText.textContent = text;
  }

  showMicPermissionNotice() {
    this.updateTranscriptUI('مائیکروفون کے استعمال کی اجازت نہیں مل سکی۔ براؤزر کی سیٹنگز چیک کریں۔');
    this.updateResponseUI('مائیکرو فون رسائی فعال کریں۔ آپ نیچے باکس میں اردو ٹیکسٹ بھی ٹائپ کر سکتے ہیں۔');
  }
}

// Make globally accessible
window.UrduVoiceAssistant = UrduVoiceAssistant;

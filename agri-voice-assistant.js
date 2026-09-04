/**
 * CropDoctor AI - Voice Assistant & Agronomist Chatbot
 * Supports English and Urdu voice input & text-to-speech outputs.
 */

class AgriVoiceAssistant {
  constructor() {
    this.recognition = null;
    this.synthesis = window.speechSynthesis || null;
    this.isListening = false;
    this.lang = 'en-US'; // 'en-US' or 'ur-PK'
    this.onResultCallback = null;
    this.onStateChangeCallback = null;

    this.initSpeechRecognition();
  }

  initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = this.lang;

      this.recognition.onstart = () => {
        this.isListening = true;
        if (this.onStateChangeCallback) this.onStateChangeCallback(true);
      };

      this.recognition.onend = () => {
        this.isListening = false;
        if (this.onStateChangeCallback) this.onStateChangeCallback(false);
      };

      this.recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (this.onResultCallback) {
          this.onResultCallback(transcript);
        }
      };

      this.recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        this.isListening = false;
        if (this.onStateChangeCallback) this.onStateChangeCallback(false);
      };
    }
  }

  setLanguage(langCode) {
    this.lang = langCode; // 'en-US' or 'ur-PK'
    if (this.recognition) {
      this.recognition.lang = this.lang;
    }
  }

  toggleListening(onResult, onStateChange) {
    this.onResultCallback = onResult;
    this.onStateChangeCallback = onStateChange;

    if (!this.recognition) {
      alert('Speech recognition is not supported in this browser. Please type your query in the chat box.');
      return;
    }

    if (this.isListening) {
      this.recognition.stop();
    } else {
      this.recognition.start();
    }
  }

  speak(text, lang = this.lang) {
    if (!this.synthesis) return;

    this.synthesis.cancel(); // Stop active speech

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    // Try finding matching voice
    const voices = this.synthesis.getVoices();
    const voice = voices.find(v => v.lang.startsWith(lang.split('-')[0]));
    if (voice) {
      utterance.voice = voice;
    }

    this.synthesis.speak(utterance);
  }

  /**
   * Process user query & return AI Agronomist response
   */
  processAgronomistQuery(query, activeDisease = null) {
    const q = query.toLowerCase();

    // Check for Urdu language input
    const isUrdu = /[\u0600-\u06FF]/.test(query) || this.lang.startsWith('ur');

    if (isUrdu) {
      return this.handleUrduQuery(query, activeDisease);
    }

    // English responses
    if (q.includes('late blight') || (activeDisease && activeDisease.id.includes('late_blight'))) {
      if (q.includes('spray') || q.includes('chemical') || q.includes('medicine') || q.includes('fungicide')) {
        return "For Late Blight control, spray systemic fungicide Ridomil Gold (Metalaxyl + Mancozeb) at 2 grams per Liter of water immediately. Repeat after 7-10 days if high humidity persists.";
      }
      if (q.includes('organic') || q.includes('natural') || q.includes('home remedy')) {
        return "For organic protection, spray Copper Hydroxide (2g/L) combined with 5ml/L Neem Oil. Ensure you remove and burn infected lower leaves immediately to stop spore spread.";
      }
      return "Late Blight is a destructive fungal disease favoured by cool, wet weather (15-22°C, >80% humidity). It causes dark water-soaked leaf spots with white mold under leaves. Quick action with copper or systemic fungicide is essential.";
    }

    if (q.includes('rust') || (activeDisease && activeDisease.id.includes('rust'))) {
      return "For Rust fungal infections (like Corn or Wheat Rust), apply Propiconazole 25% EC at 1ml per Liter of water or Wettable Sulfur at 3g/L. Ensure complete foliage coverage.";
    }

    if (q.includes('yellow') || q.includes('curl') || q.includes('whitefly')) {
      return "Yellowing and leaf curling are often caused by Viral infections carried by Silverleaf Whiteflies. Hang yellow sticky traps (15-20 per acre) and spray Imidacloprid (0.5ml/L) or Neem oil to suppress the whitefly vectors.";
    }

    if (q.includes('healthy') || q.includes('prevent') || q.includes('fertilizer')) {
      return "To keep your crops healthy, maintain balanced NPK fertilization, install drip irrigation to avoid wet leaves, practice 3-year crop rotation, and scout fields every 3 days.";
    }

    if (q.includes('dosage') || q.includes('water') || q.includes('acre')) {
      return "Standard knapsack sprayer dosage: Mix 25-30g of wettable fungicide powder per 15-Liter water tank. Spray during early morning or late evening to prevent leaf burn.";
    }

    // Default response
    if (activeDisease) {
      return `For ${activeDisease.name} (${activeDisease.crop}), our recommended treatment is: ${activeDisease.chemicalControl[0]} or ${activeDisease.organicControl[0]}. Keep foliage dry and check weather humidity levels.`;
    }

    return "Hello! I am your CropDoctor AI Agronomist. Ask me about plant symptoms, fungicide dosages, organic remedies, or how to control whiteflies and leaf blights.";
  }

  handleUrduQuery(query, activeDisease) {
    const q = query;
    if (q.includes('اسپرے') || q.includes('دوائی') || q.includes('کیمیکل')) {
      return "بیماری کے تدارک کے لیے میٹا لیکسل + مینکوزیب (ریڈومل گولڈ) ۲ گرام فی لیٹر پانی کے حساب سے اسپرے کریں۔ صبح یا شام کے وقت اسپرے کرنا بہتر ہے۔";
    }
    if (q.includes('دیسی') || q.includes('آرگینک') || q.includes('علاج')) {
      return "آرگینک علاج کے لیے کاپر ہائیڈرو آکسائیڈ اور نیم کے تیل (۵ ملی لیٹر فی لیٹر) کا اسپرے کریں۔ متاثرہ پتے فوراً توڑ کر کھیت سے دور تلف کریں۔";
    }
    if (activeDisease) {
      return `${activeDisease.nameUrdu} کے لیے بہترین علاج: ${activeDisease.organicControl[0]} اور کھیت میں پانی جمع نہ ہونے دیں۔`;
    }
    return "السلام علیکم! میں آپ کا ڈیجیٹل فصل کا ڈاکٹر ہوں۔ آپ مجھ سے پودوں کی بیماریوں، اسپرے کی مقدار اور آرگینک علاج کے بارے میں پوچھ سکتے ہیں۔";
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AgriVoiceAssistant };
}

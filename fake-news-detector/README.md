# TruthGuard AI - Intelligent Fake News & Misinformation Detector

**TruthGuard AI** is a client-side NLP and heuristic verification engine that audits news articles, headlines, viral claims, and web domains for signs of fabrication, sensationalism, panic appeals, and ungrounded statements.

---

## 🌟 Key Features

1. **Multi-Vector Credibility Scoring (Truth Index 0 - 100%)**:
   - **Sensationalism & Hyperbole Detector**: Flags excessive capitalizations, repeated punctuation marks (`!!!`), and hyperbolic buzzwords ("MIRACLE", "SHOCKING", "THEY DON'T WANT YOU TO KNOW").
   - **Emotional Coercion & Panic Meter**: Measures fear-mongering and urgency hooks designed to force viral shares before fact-checking.
   - **Evidence & Citation Verifier**: Scans for peer-reviewed journals, named institutional sources, statistically grounded intervals, and direct attributions.
   - **Journalistic Objectivity Metric**: Assesses neutral tone and linguistic balance.

2. **Explainable AI (In-Text Highlighting)**:
   - Displays analyzed text with color-coded marker tags:
     - 🔴 **Sensational / Hyperbolic Claim**
     - 🟡 **Manufactured Urgency & Panic**
     - 🟢 **Empirical / Scientific Term**
     - 🔵 **Journalistic Attribution / Quote**
   - Hover tooltips provide contextual rationales for each flagged phrase.

3. **Domain & Source Reliability Scanner**:
   - Evaluates domain trust tiers against known legitimate news agencies, peer-reviewed journals, satirical sites, and suspicious top-level domains (`.xyz`, `.top`, `.buzz`, etc.).

4. **1-Click Testing Lab**:
   - Pre-loaded with diverse realistic test cases:
     - Legitimate Science (NASA Exoplanet study)
     - Viral Fabricated Hoax (Miracle jungle fruit cure)
     - Legitimate Economy (Federal Reserve interest rate update)
     - Sensational Conspiracy (5G smart meters mind-control)
     - Health & Science Study (Mediterranean diet study)
     - Sensational Tech Rumor (Smart fridge photos AI leak)

5. **Fact-Checking Action Toolkit**:
   - Quick integration links to Reuters Fact Check, Snopes, Google Fact Check Explorer, and TinEye Reverse Image Search.

6. **History & Export**:
   - Stores recent verification scans locally using `localStorage`.
   - 1-Click Copy Dossier Report formatted for sharing or reporting.
   - Clean printable layout (`window.print()`).
   - Voice Dictation input for evaluating spoken claims.

---

## 🚀 How to Run

1. Simply double-click `index.html` or open it in any modern browser (Chrome, Edge, Firefox, Safari).
2. Or serve it with any local server:
   ```bash
   npx serve .
   ```
   or with Python:
   ```bash
   python -m http.server 8080
   ```
3. Open `http://localhost:8080` in your browser.

---

## 📁 File Structure

```
fake-news-detector/
├── index.html       # Semantic application interface & telemetry dashboard
├── styles.css       # Obsidian & Cyber neon design system with glassmorphism
├── analyzer.js     # Client-side NLP heuristic engine & scoring algorithms
├── app.js          # Controller, animations, history, and user interactions
├── samples.js      # Curated preset articles & headlines library
└── README.md       # Documentation
```

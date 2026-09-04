/**
 * TruthGuard AI - Enhanced Core NLP & Credibility Analyzer Engine
 * Performs comprehensive heuristic analysis, emotional valence parsing, sensationalism scoring,
 * source verification, factual grounding checks, and explainability text markup.
 */

const TruthAnalyzer = (() => {
  // 1. SENSATIONAL & CLICKBAIT LEXICON (Common in fake news & viral social media hoaxes)
  const SENSATIONAL_WORDS = [
    'shocking', 'unbelievable', 'miracle', 'mind-blowing', 'jaw-dropping',
    'vaporize', 'eradicate', 'cures 100%', 'cure 100%', 'secret cure',
    'doctors terrified', 'doctors hate', 'they don\'t want you to know',
    'what they hide', 'wake up sheeple', 'wake up', 'mainstream media lies',
    'puppet networks', 'shadow organizations', 'global elites', 'conspiracy',
    'whistleblower leaked', 'insiders reveal', 'banned forever', 'covert',
    'military-grade', 'mind-control', 'poisoning our water', 'miracle seed',
    'magic potion', 'magic formula', 'elites exposed', 'destroy this',
    'act immediately', 'before it\'s deleted', 'share before banned',
    'share this with everyone', 'emergency bottle', 'top secret',
    'urgent alert', 'warning to all', 'viral video', 'banned video',
    'censored by', 'forwarded as received', 'forward to all', 'tell everyone',
    'forward this', 'tell your family', 'spread the word', '100% proven',
    'guaranteed cure', 'cancer cure', 'burns fat overnight', 'secret investment',
    'make $5000', 'crypto secret', 'free money', 'illuminati', 'deep state',
    'chemtrails', 'flat earth', 'microchip implant', 'microchips in',
    '5g radiation', 'plandemic', 'stolen election', 'fake virus',
    'biological weapon', 'depopulation', 'poisonous chemicals', 'hidden truth',
    'you won\'t believe', 'what happened next', 'secret revealed', 'exposed',
    'share immediately', 'forwarded message', 'forwarded many times',
    'the truth about', 'shocking truth', 'explosive revelation'
  ];

  // 2. URGENCY & CHAIN-LETTER TRIGGERS (Manufactured panic & viral pressure)
  const URGENCY_TRIGGERS = [
    'act immediately', 'before midnight', 'before it\'s deleted',
    'before supplies are confiscated', 'before it is banned',
    'share this immediately', 'warning:', 'urgent warning', 'breaking alert',
    'urgent alert', 'wake up patriots', 'time is running out', 'do not wait',
    'spread the word', 'tell your family', 'tell everyone you know',
    'forward now', 'forward to all groups', 'forwarded message',
    'forwarded many times', 'do not ignore', 'emergency notice',
    'share before taken down', 'send to 10 people', 'forward to everyone'
  ];

  // 3. EMOTIONAL MANIPULATION & RAGE-BAIT (Extreme hysteria words)
  const EMOTIONAL_WORDS = [
    'horrific', 'terrified', 'furious', 'insane', 'outrageous', 'pure evil',
    'disaster', 'apocalypse', 'run for your lives', 'deadly plot', 'scandalous',
    'blood on their hands', 'monsters', 'catastrophic', 'nightmare', 'sinister',
    'sickening', 'heartbreaking', 'destroying our country', 'treason',
    'evil agenda', 'lethal injection', 'deadly conspiracy'
  ];

  // 4. PHANTOM / ANONYMOUS VAGUE AUTHORITIES (Classic fake news attribution dodge)
  const PHANTOM_AUTHORITIES = [
    'scientists say', 'doctors say', 'experts claim', 'a top doctor',
    'a doctor from', 'russian scientists', 'japanese researchers',
    'an insider claims', 'sources say', 'anonymous whistleblower',
    'a hospital nurse said', 'someone told me', 'reports are circulating',
    'people are saying', 'rumors say', 'it is rumored that', 'leaked reports say'
  ];

  // 5. SCIENTIFIC & EMPIRICAL EVIDENCE MARKERS (Credible research markers)
  const SCIENTIFIC_EVIDENCE_MARKERS = [
    'peer-reviewed', 'published in', 'study', 'journal', 'researchers',
    'investigator', 'clinical trial', 'longitudinal', 'cohort',
    'statistically robust', 'confidence interval', 'methodology',
    'empirical', 'laboratory', 'systematic review', 'meta-analysis',
    'control group', 'placebo', 'correlation', 'causality', 'data indicates',
    'department of', 'university of', 'institute of', 'national institute',
    'astrophysical journal', 'medical journal', 'proceedings of the national academy',
    'scientific consensus', 'randomized controlled trial'
  ];

  // 6. REPUTABLE NEWS AGENCIES & VERIFIED INSTITUTIONS
  const JOURNALISTIC_ENTITIES = [
    'reuters', 'associated press', 'ap news', 'afp', 'bbc', 'bbc news',
    'cnn', 'bloomberg', 'wall street journal', 'wsj', 'new york times',
    'the guardian', 'washington post', 'npr', 'pbs', 'financial times',
    'forbes', 'cnbc', 'usa today', 'time magazine', 'sky news',
    'abc news', 'cbs news', 'nbc news', 'al jazeera',
    'world health organization', 'who', 'cdc', 'fda', 'nasa',
    'united nations', 'white house', 'pentagon', 'supreme court',
    'ministry of health', 'department of health', 'ministry of justice',
    'police department', 'central bank', 'federal reserve', 'european union',
    'parliament', 'congress', 'prime minister', 'foreign ministry',
    'treasury department', 'attorney general', 'high court'
  ];

  // 7. JOURNALISTIC ATTRIBUTION PHRASES & VERBS
  const JOURNALISTIC_ATTRIBUTION_MARKERS = [
    'according to', 'stated in', 'spokesperson said', 'spokeswoman said',
    'official statement', 'confirmed by', 'cited by', 'reported by',
    'in an interview with', 'testified that', 'announced on', 'announced that',
    'reported on', 'reported that', 'stated that', 'confirmed that',
    'said on', 'told reporters', 'told reuters', 'in a statement',
    'spoke to', 'briefed reporters', 'disclosed in', 'declared that',
    'filed a lawsuit', 'court documents show', 'spokesman for',
    'in a press release', 'during a press conference', 'minutes of the meeting',
    'public filing', 'official records', 'testimony before', 'in remarks on'
  ];

  // 8. DOMAIN REPUTATION LISTS
  const REPUTABLE_DOMAINS = [
    'reuters.com', 'apnews.com', 'bbc.com', 'bbc.co.uk', 'nasa.gov',
    'nih.gov', 'cdc.gov', 'who.int', 'nature.com', 'science.org',
    'bmj.com', 'thelancet.com', 'nejm.org', 'bloomberg.com',
    'nytimes.com', 'wsj.com', 'theguardian.com', 'ft.com', 'pbs.org',
    'npr.org', 'scientificamerican.com', 'un.org', 'mit.edu', 'stanford.edu',
    'gov.uk', 'europa.eu', 'aljazeera.com', 'time.com', 'forbes.com'
  ];

  const SATIRICAL_DOMAINS = [
    'theonion.com', 'babylonbee.com', 'newsthump.com', 'clickhole.com',
    'borowitz-report', 'duffelblog.com'
  ];

  const SUSPICIOUS_TLDS = ['.xyz', '.top', '.buzz', '.click', '.tk', '.ml', '.ga', '.cf', '.gq', '.work', '.ru'];

  /**
   * Main analysis function for article, social media post, or headline text
   */
  function analyzeText(text, providedUrl = '') {
    if (!text || text.trim().length === 0) {
      return getEmptyResult();
    }

    const cleanText = text.trim();
    const words = cleanText.split(/\s+/).filter(w => w.length > 0);
    const wordCount = words.length;
    const lowerText = cleanText.toLowerCase();

    // 1. Formatting & Punctuation metrics
    const exclamationCount = (cleanText.match(/!/g) || []).length;
    const questionCount = (cleanText.match(/\?/g) || []).length;
    const multiPunctuation = (cleanText.match(/[!?]{2,}/g) || []).length;
    const hasEmojis = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u.test(cleanText);

    // Uppercase token count (ignore common short acronyms like NASA, US, AI, FDA, WHO, BBC, CNN)
    const knownAcronyms = new Set(['NASA', 'FDA', 'CDC', 'WHO', 'BBC', 'CNN', 'AP', 'AFP', 'USA', 'UK', 'UN', 'EU', 'AI', 'CEO', 'CFO', 'FBI', 'CIA']);
    const upperWords = words.filter(w => {
      const letters = w.replace(/[^A-Za-z]/g, '');
      return letters.length > 3 && letters === letters.toUpperCase() && !knownAcronyms.has(letters);
    });
    const uppercaseRatio = words.length > 0 ? (upperWords.length / words.length) : 0;

    // 2. Pattern Matching against Lexicons

    // (A) Sensational matches
    const sensationalMatches = [];
    SENSATIONAL_WORDS.forEach(phrase => {
      const regex = new RegExp(`\\b${escapeRegExp(phrase)}\\b`, 'gi');
      let match;
      while ((match = regex.exec(cleanText)) !== null) {
        sensationalMatches.push({ phrase: match[0], index: match.index, type: 'sensational' });
      }
    });

    // (B) Urgency matches
    const urgencyMatches = [];
    URGENCY_TRIGGERS.forEach(phrase => {
      const regex = new RegExp(`\\b${escapeRegExp(phrase)}\\b`, 'gi');
      let match;
      while ((match = regex.exec(cleanText)) !== null) {
        urgencyMatches.push({ phrase: match[0], index: match.index, type: 'urgency' });
      }
    });

    // (C) Emotional rage words
    const emotionalMatches = [];
    EMOTIONAL_WORDS.forEach(phrase => {
      const regex = new RegExp(`\\b${escapeRegExp(phrase)}\\b`, 'gi');
      let match;
      while ((match = regex.exec(cleanText)) !== null) {
        emotionalMatches.push({ phrase: match[0], index: match.index, type: 'emotional' });
      }
    });

    // (D) Phantom / Vague Authorities
    const phantomMatches = [];
    PHANTOM_AUTHORITIES.forEach(phrase => {
      const regex = new RegExp(`\\b${escapeRegExp(phrase)}\\b`, 'gi');
      let match;
      while ((match = regex.exec(cleanText)) !== null) {
        phantomMatches.push({ phrase: match[0], index: match.index, type: 'phantom' });
      }
    });

    // (E) Scientific evidence matches
    const evidenceMatches = [];
    SCIENTIFIC_EVIDENCE_MARKERS.forEach(phrase => {
      const regex = new RegExp(`\\b${escapeRegExp(phrase)}\\b`, 'gi');
      let match;
      while ((match = regex.exec(cleanText)) !== null) {
        evidenceMatches.push({ phrase: match[0], index: match.index, type: 'evidence' });
      }
    });

    // (F) Journalistic Entities & Wire Services
    const entityMatches = [];
    JOURNALISTIC_ENTITIES.forEach(phrase => {
      const regex = new RegExp(`\\b${escapeRegExp(phrase)}\\b`, 'gi');
      let match;
      while ((match = regex.exec(cleanText)) !== null) {
        entityMatches.push({ phrase: match[0], index: match.index, type: 'entity' });
      }
    });

    // (G) Journalistic Attributions
    const attributionMatches = [];
    JOURNALISTIC_ATTRIBUTION_MARKERS.forEach(phrase => {
      const regex = new RegExp(`\\b${escapeRegExp(phrase)}\\b`, 'gi');
      let match;
      while ((match = regex.exec(cleanText)) !== null) {
        attributionMatches.push({ phrase: match[0], index: match.index, type: 'attribution' });
      }
    });

    // (H) Direct Quotes in quotation marks
    const quoteMatches = cleanText.match(/"([^"]{10,})"/g) || cleanText.match(/“([^”]{10,})”/g) || [];

    // (I) Factual Grounding: Temporal Markers (Days of week, months, years)
    const temporalMatches = cleanText.match(/\b(on\s+)?(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\b/gi) ||
      cleanText.match(/\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2}(,\s+\d{4})?\b/gi) ||
      cleanText.match(/\b(202[0-9])\b/g) || [];

    // (J) Quantitative & Statistical Data (percentages, currency amounts, numbers)
    const statsMatches = cleanText.match(/\b\d+(\.\d+)?%\b/g) ||
      cleanText.match(/\$\d+(\.\d+)?\s*(billion|million|trillion|thousand)?\b/gi) ||
      cleanText.match(/\b\d{1,3}(,\d{3})+\b/g) || [];

    // (K) Medical Fraud / Miracle Cure Regex
    const medicalHoaxMatch = /(cures?|reverses?|eliminates?|kills?)\s+(all\s+|100%\s+)?(cancer|diabetes|diseases?|blindness|virus|tumors?)/i.test(cleanText) ||
      /(boiled|lemon|garlic|ginger|warm|alkaline)\s+water\s+(kills|cures|prevents)/i.test(cleanText) ||
      /(burns?|loses?)\s+(\d+\s*)?(kg|pounds|lbs|fat)\s+overnight/i.test(cleanText);

    // 3. Domain evaluation (if provided in text or URL input)
    const urlAnalysis = analyzeDomain(providedUrl || extractFirstUrl(cleanText));

    // 4. Calculate Sub-Scores (0 - 100)

    // Sensationalism Score (Higher = worse, more clickbait/fake)
    let sensationalismScore = 0;
    sensationalismScore += Math.min(sensationalMatches.length * 18, 60);
    sensationalismScore += Math.min(urgencyMatches.length * 16, 32);
    sensationalismScore += Math.min(multiPunctuation * 15, 25);
    sensationalismScore += Math.min(uppercaseRatio * 250, 35);
    if (medicalHoaxMatch) sensationalismScore += 35;
    sensationalismScore = Math.min(Math.round(sensationalismScore), 100);

    // Emotional / Urgency Bias Score (Higher = worse, panic & fear appeals)
    let emotionalBiasScore = 0;
    emotionalBiasScore += Math.min(urgencyMatches.length * 25, 45);
    emotionalBiasScore += Math.min(emotionalMatches.length * 18, 35);
    emotionalBiasScore += Math.min(multiPunctuation * 12, 20);
    emotionalBiasScore += Math.min(uppercaseRatio * 180, 25);
    if (exclamationCount >= 2) emotionalBiasScore += 12;
    if (hasEmojis && words.length < 50) emotionalBiasScore += 15;
    emotionalBiasScore = Math.min(Math.round(emotionalBiasScore), 100);

    // Evidence & Attribution Score (Higher = better, verified facts & sourcing)
    let evidenceScore = 0;
    evidenceScore += Math.min(evidenceMatches.length * 20, 40);
    evidenceScore += Math.min(entityMatches.length * 18, 36);
    evidenceScore += Math.min(attributionMatches.length * 16, 32);
    evidenceScore += Math.min(quoteMatches.length * 15, 30);
    evidenceScore += Math.min(temporalMatches.length * 10, 20);
    evidenceScore += Math.min(statsMatches.length * 8, 16);
    if (urlAnalysis.category === 'reputable') evidenceScore += 25;
    evidenceScore = Math.min(Math.round(evidenceScore), 100);

    // 5. Dynamic Truth Index Calculation (0 - 100%)
    // Base starts dynamically based on whether factual markers or fake markers dominate
    let credibilityBase = 50;

    // --- Credibility Boosts (Real News Characteristics) ---
    let credibilityBoost = 0;
    credibilityBoost += Math.min(entityMatches.length * 16, 32); // Reuters, BBC, White House, etc.
    credibilityBoost += Math.min(attributionMatches.length * 14, 28); // "according to", "said on", etc.
    credibilityBoost += Math.min(quoteMatches.length * 12, 24); // direct quotes
    credibilityBoost += Math.min(evidenceMatches.length * 14, 28); // "published in", "study", etc.
    credibilityBoost += Math.min(temporalMatches.length * 8, 16); // dates, days of week
    credibilityBoost += Math.min(statsMatches.length * 6, 12); // percentages, currencies

    // Bonus for proper journalistic sentence structure (clean paragraphs, no ALL-CAPS, proper length)
    if (wordCount >= 35 && uppercaseRatio < 0.04 && multiPunctuation === 0 && exclamationCount <= 1) {
      credibilityBoost += 10;
    }

    // --- Manipulation / Misinformation Penalties (Fake News Characteristics) ---
    let manipulationPenalty = 0;
    manipulationPenalty += Math.min(sensationalMatches.length * 18, 54);
    manipulationPenalty += Math.min(urgencyMatches.length * 16, 36);
    manipulationPenalty += Math.min(emotionalMatches.length * 12, 24);
    manipulationPenalty += Math.min(phantomMatches.length * 14, 28); // "scientists say", "doctors claim" without name
    
    if (medicalHoaxMatch) {
      manipulationPenalty += 40;
    }
    if (multiPunctuation >= 1 || exclamationCount >= 3) {
      manipulationPenalty += 15;
    }
    if (uppercaseRatio > 0.08) {
      manipulationPenalty += 20;
    }
    if (lowerText.includes('forward to all') || lowerText.includes('share this with everyone') || lowerText.includes('forwarded message')) {
      manipulationPenalty += 25;
    }

    // --- Domain Adjustments ---
    if (urlAnalysis.domain) {
      if (urlAnalysis.category === 'reputable') credibilityBoost += 25;
      else if (urlAnalysis.category === 'satire') manipulationPenalty += 50;
      else if (urlAnalysis.category === 'suspicious') manipulationPenalty += 45;
    }

    // --- Unsubstantiated Claim Check ---
    // If the text makes assertions without ANY named sources, dates, quotes, or agencies:
    const hasAnyEvidence = (entityMatches.length > 0 || attributionMatches.length > 0 || 
                            quoteMatches.length > 0 || evidenceMatches.length > 0 || 
                            temporalMatches.length > 0 || urlAnalysis.category === 'reputable');
    
    if (!hasAnyEvidence && wordCount < 60) {
      // Unverified social media rumor / gossip
      credibilityBase = 42;
    }

    // Combine base, boosts, and penalties
    credibilityBase = credibilityBase + credibilityBoost - manipulationPenalty;

    // --- Hard Caps for Clear Real vs Fake Separation ---
    // If strong fake indicators exist (e.g. clickbait, hoax phrases, panic triggers, forwarding):
    if (sensationalMatches.length >= 2 || medicalHoaxMatch || 
        (sensationalMatches.length >= 1 && urgencyMatches.length >= 1) || 
        (urgencyMatches.length >= 1 && uppercaseRatio > 0.06)) {
      // Force into definite FAKE range (8% - 30%)
      credibilityBase = Math.min(credibilityBase, 28);
    } else if (manipulationPenalty > 35) {
      credibilityBase = Math.min(credibilityBase, 34);
    }

    // If strong genuine journalistic indicators exist and NO sensationalism:
    if (sensationalMatches.length === 0 && !medicalHoaxMatch && uppercaseRatio < 0.05 && multiPunctuation === 0) {
      if (entityMatches.length >= 1 && (attributionMatches.length >= 1 || quoteMatches.length >= 1)) {
        // High credibility verified news
        credibilityBase = Math.max(credibilityBase, 82);
      } else if (hasAnyEvidence && wordCount >= 30 && credibilityBoost >= 20) {
        credibilityBase = Math.max(credibilityBase, 76);
      }
    }

    // Clamp final score safely between 5% and 98%
    const truthIndex = Math.max(5, Math.min(98, Math.round(credibilityBase)));

    // 6. Determine Classification Tier & Labels
    let tier = 'questionable';
    let tierLabel = 'SUSPICIOUS / Unverified';
    let tierClass = 'warning';
    let summaryDesc = '';

    if (truthIndex >= 78) {
      tier = 'verified';
      tierLabel = 'VERIFIED REAL';
      tierClass = 'success';
      summaryDesc = 'Displays verified journalistic sourcing, objective language, factual grounding (dates, quotes, official institutions), and negligible sensationalism.';
    } else if (truthIndex >= 58) {
      tier = 'leaning-credible';
      tierLabel = 'LIKELY REAL';
      tierClass = 'info';
      summaryDesc = 'Presents coherent, factual reporting with moderate context. Cross-referencing primary sources is recommended.';
    } else if (truthIndex >= 38) {
      tier = 'questionable';
      tierLabel = 'SUSPICIOUS / Unverified';
      tierClass = 'warning';
      summaryDesc = 'Unsubstantiated or unverified claim. Lacks credible sources, specific dates, or official attribution. Treat with skepticism.';
    } else {
      tier = 'fake';
      tierLabel = 'FAKE / Misinformation';
      tierClass = 'danger';
      summaryDesc = 'Exhibits viral hoax patterns, sensational clickbait, manufactured panic, conspiracy framing, or medical misinformation characteristic of fabricated content.';
    }

    // 7. Generate Annotated Text with Highlighting
    const allMatches = [
      ...sensationalMatches,
      ...urgencyMatches,
      ...evidenceMatches,
      ...attributionMatches,
      ...entityMatches.map(e => ({ phrase: e.phrase, index: e.index, type: 'attribution' })),
      ...emotionalMatches.map(em => ({ phrase: em.phrase, index: em.index, type: 'urgency' }))
    ];
    const annotatedHtml = generateAnnotatedHtml(cleanText, allMatches);

    // 8. Generate Key Diagnostic Findings
    const diagnostics = generateDiagnostics({
      wordCount,
      sensationalMatches,
      urgencyMatches,
      evidenceMatches,
      attributionMatches,
      entityMatches,
      emotionalMatches,
      phantomMatches,
      medicalHoaxMatch,
      quoteMatches,
      temporalMatches,
      statsMatches,
      uppercaseRatio,
      multiPunctuation,
      urlAnalysis,
      truthIndex
    });

    return {
      truthIndex,
      tier,
      tierLabel,
      tierClass,
      summaryDesc,
      wordCount,
      subScores: {
        sensationalism: sensationalismScore,
        emotionalBias: emotionalBiasScore,
        evidenceAttribution: evidenceScore,
        objectivity: Math.max(0, 100 - emotionalBiasScore)
      },
      counts: {
        sensational: sensationalMatches.length,
        urgency: urgencyMatches.length,
        evidence: evidenceMatches.length + entityMatches.length,
        attribution: attributionMatches.length,
        quotes: quoteMatches.length,
        excessiveCaps: upperWords.length
      },
      diagnostics,
      urlAnalysis,
      annotatedHtml,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Domain analysis helper
   */
  function analyzeDomain(url) {
    if (!url) return { domain: '', category: 'unknown', trustScore: null, notes: 'No domain provided' };

    try {
      let hostname = '';
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        hostname = new URL('https://' + url).hostname.toLowerCase();
      } else {
        hostname = new URL(url).hostname.toLowerCase();
      }
      hostname = hostname.replace(/^www\./, '');

      // Check reputable
      const isReputable = REPUTABLE_DOMAINS.some(d => hostname === d || hostname.endsWith('.' + d));
      if (isReputable) {
        return {
          domain: hostname,
          category: 'reputable',
          trustScore: 95,
          badge: 'High Trust Source',
          notes: 'Recognized public institution, scientific journal, or established news agency with verified editorial standards.'
        };
      }

      // Check satire
      const isSatire = SATIRICAL_DOMAINS.some(d => hostname === d || hostname.endsWith('.' + d));
      if (isSatire) {
        return {
          domain: hostname,
          category: 'satire',
          trustScore: 30,
          badge: 'Satire / Parody Publication',
          notes: 'Known satirical publication. Stories are intended for humor/entertainment and are not factual.'
        };
      }

      // Check suspicious TLDs
      const isSuspiciousTLD = SUSPICIOUS_TLDS.some(tld => hostname.endsWith(tld));
      if (isSuspiciousTLD) {
        return {
          domain: hostname,
          category: 'suspicious',
          trustScore: 18,
          badge: 'High-Risk Domain TLD',
          notes: 'Uses a top-level domain frequently associated with disposable spam portals, phishing, or unverified viral sites.'
        };
      }

      return {
        domain: hostname,
        category: 'unverified',
        trustScore: 50,
        badge: 'Independent / Unranked Domain',
        notes: 'Independent or uncatalogued domain. Review author credentials and corroborate claims with primary sources.'
      };
    } catch (e) {
      return { domain: url, category: 'unknown', trustScore: null, notes: 'Invalid URL format' };
    }
  }

  /**
   * Extract first URL if text contains one
   */
  function extractFirstUrl(text) {
    const urlMatch = text.match(/https?:\/\/[^\s]+/i);
    return urlMatch ? urlMatch[0] : '';
  }

  /**
   * Helper to escape strings for RegExp
   */
  function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * Generates formatted marked-up HTML highlighting manipulation indicators
   */
  function generateAnnotatedHtml(rawText, matches) {
    if (!rawText) return '';

    // Sort matches in reverse order of index to safely insert span tags
    const sorted = [...matches].sort((a, b) => b.index - a.index);

    // Remove duplicates or overlapping ranges
    const filtered = [];
    let lastEnd = Infinity;

    sorted.forEach(m => {
      const phraseLen = m.phrase.length;
      const end = m.index + phraseLen;
      if (end <= lastEnd) {
        filtered.push(m);
        lastEnd = m.index;
      }
    });

    let html = escapeHtml(rawText);

    filtered.forEach(item => {
      const escapedPhrase = escapeHtml(item.phrase);
      let label = 'Indicator';
      let cssClass = 'mark-sensational';

      if (item.type === 'sensational') {
        label = 'Sensational / Clickbait';
        cssClass = 'mark-sensational';
      } else if (item.type === 'urgency') {
        label = 'Urgency / Emotional Pressure';
        cssClass = 'mark-urgency';
      } else if (item.type === 'evidence') {
        label = 'Scientific / Empirical Citation';
        cssClass = 'mark-evidence';
      } else if (item.type === 'attribution') {
        label = 'Journalistic Attribution / Sourced Entity';
        cssClass = 'mark-attribution';
      }

      const regex = new RegExp(`\\b${escapeRegExp(escapedPhrase)}\\b`, 'i');
      html = html.replace(regex, `<span class="nlp-marker ${cssClass}" data-tooltip="${label}">${escapedPhrase}</span>`);
    });

    // Replace newlines with paragraph / br
    return html.split('\n\n').map(para => `<p>${para.replace(/\n/g, '<br/>')}</p>`).join('');
  }

  function escapeHtml(text) {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /**
   * Generates actionable diagnosis items
   */
  function generateDiagnostics(data) {
    const findings = [];

    // Sensational findings
    if (data.sensationalMatches.length > 0) {
      findings.push({
        type: 'danger',
        icon: 'alert-triangle',
        title: `Detected ${data.sensationalMatches.length} Sensational or Clickbait Trigger(s)`,
        detail: `Found phrases like "${data.sensationalMatches.slice(0, 3).map(m => m.phrase).join('", "')}". Fabricated news exploits sensational hyperbole to induce viral sharing.`
      });
    }

    // Medical hoax finding
    if (data.medicalHoaxMatch) {
      findings.push({
        type: 'danger',
        icon: 'alert-octagon',
        title: 'High-Risk Health or Medical Claim Detected',
        detail: 'Claims promising guaranteed miracle cures or rapid disease elimination are classic signatures of health misinformation.'
      });
    }

    // Urgency findings
    if (data.urgencyMatches.length > 0) {
      findings.push({
        type: 'warning',
        icon: 'clock',
        title: 'Artificial Urgency & Forwarding Pressure',
        detail: `Text employs viral panic triggers ("${data.urgencyMatches[0].phrase}") urging readers to share before verifying facts.`
      });
    }

    // Phantom authorities finding
    if (data.phantomMatches && data.phantomMatches.length > 0) {
      findings.push({
        type: 'warning',
        icon: 'help-circle',
        title: 'Vague / Anonymous Authority Attribution',
        detail: `Claims are attributed to vague entities ("${data.phantomMatches[0].phrase}") without naming specific researchers, institutions, or official papers.`
      });
    }

    // Uppercase / Punctuation
    if (data.uppercaseRatio > 0.06 || data.multiPunctuation > 1) {
      findings.push({
        type: 'warning',
        icon: 'volume-2',
        title: 'Aggressive Typography & Formatting',
        detail: 'Excessive capitalized words and clustered exclamation marks are common signatures of tabloid hoaxes and rage-bait.'
      });
    }

    // Evidence & Scientific positive findings
    if (data.evidenceMatches.length > 0) {
      findings.push({
        type: 'success',
        icon: 'award',
        title: 'Scientific or Empirical Language Present',
        detail: `Identified credible research terminology (${data.evidenceMatches.slice(0, 3).map(m => m.phrase).join(', ')}), typical of verified science reporting.`
      });
    }

    // Journalistic entities / agencies
    if (data.entityMatches && data.entityMatches.length > 0) {
      findings.push({
        type: 'success',
        icon: 'check-circle',
        title: 'Recognized News Agency or Official Body Cited',
        detail: `References recognized institution(s) (${data.entityMatches.slice(0, 3).map(m => m.phrase).join(', ')}), indicating standard journalistic attribution.`
      });
    }

    // Attributions & quotes
    if (data.quoteMatches.length > 0 || data.attributionMatches.length > 0) {
      findings.push({
        type: 'success',
        icon: 'message-square',
        title: 'Direct Attributions and Sourced Quotations',
        detail: `Found ${data.quoteMatches.length} explicit direct quote(s) and structured journalistic citations.`
      });
    } else if (data.wordCount > 50 && data.sensationalMatches.length === 0) {
      findings.push({
        type: 'info',
        icon: 'help-circle',
        title: 'Lack of Direct Attributed Quotes',
        detail: 'The text makes statements without citing named individuals, official institutions, or primary documents.'
      });
    }

    // Temporal grounding
    if (data.temporalMatches && data.temporalMatches.length > 0) {
      findings.push({
        type: 'success',
        icon: 'calendar',
        title: 'Temporal Grounding & Specificity',
        detail: `Grounded with specific dates/times (${data.temporalMatches.slice(0, 2).join(', ')}), a common indicator of legitimate real-time reporting.`
      });
    }

    // Unsubstantiated warning
    if (data.truthIndex < 58 && data.truthIndex >= 38 && data.sensationalMatches.length === 0) {
      findings.push({
        type: 'warning',
        icon: 'alert-circle',
        title: 'Unsubstantiated Claim (Needs Verification)',
        detail: 'This text lacks verifiable citations, named official sources, or specific references. Verify through a trusted news outlet before sharing.'
      });
    }

    // Domain finding
    if (data.urlAnalysis && data.urlAnalysis.domain) {
      findings.push({
        type: data.urlAnalysis.category === 'reputable' ? 'success' : (data.urlAnalysis.category === 'suspicious' ? 'danger' : 'info'),
        icon: 'globe',
        title: `Source Domain: ${data.urlAnalysis.domain}`,
        detail: data.urlAnalysis.notes
      });
    }

    return findings;
  }

  function getEmptyResult() {
    return {
      truthIndex: 0,
      tier: 'empty',
      tierLabel: 'Awaiting Content',
      tierClass: 'secondary',
      summaryDesc: 'Paste an article, headline, or claim to initiate AI verification.',
      wordCount: 0,
      subScores: {
        sensationalism: 0,
        emotionalBias: 0,
        evidenceAttribution: 0,
        objectivity: 0
      },
      counts: {
        sensational: 0,
        urgency: 0,
        evidence: 0,
        attribution: 0,
        quotes: 0,
        excessiveCaps: 0
      },
      diagnostics: [],
      urlAnalysis: { domain: '', category: 'unknown', trustScore: null, notes: '' },
      annotatedHtml: '',
      timestamp: new Date().toISOString()
    };
  }

  return {
    analyzeText,
    analyzeDomain
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { TruthAnalyzer };
}

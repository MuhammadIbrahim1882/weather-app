/* ==========================================================================
   Disaster Alert Manager - Gilgit-Baltistan Hazard Risk Engine
   Monitors GLOF, Landslides, KKH Road Blockages, Flash Floods & Emergency Contacts
   ========================================================================== */

class DisasterAlertManager {
  constructor(containerId = 'disasterAlertHub') {
    this.containerId = containerId;
    this.simulationMode = false;
    this.simulatedAlert = null;
    this.currentRisks = [];
  }

  /* ------------------------------------------------------------------------
     Evaluate Real-Time Hazard Telemetry
     ------------------------------------------------------------------------ */
  evaluateRisks(weatherData, location) {
    if (this.simulationMode && this.simulatedAlert) {
      return this.simulatedAlert;
    }

    if (!weatherData || !weatherData.current) {
      return { overallLevel: 'low', alerts: [] };
    }

    const current = weatherData.current;
    const daily = weatherData.daily || {};
    const hourly = weatherData.hourly || {};

    const tempMax = daily.temperature_2m_max ? daily.temperature_2m_max[0] : current.temperature_2m;
    const rainSum = daily.precipitation_sum ? daily.precipitation_sum[0] : (current.precipitation || 0);
    const windGust = current.wind_gusts_10m || current.wind_speed_10m || 0;
    const weatherCode = current.weather_code || 0;
    const humidity = current.relative_humidity_2m || 50;

    const alerts = [];

    // 1. GLOF (Glacial Lake Outburst Flood) Risk
    // Triggered by unseasonal high temperatures in mountain zones + precipitation melt
    let glofScore = 15;
    if (tempMax > 28) glofScore += 45;
    else if (tempMax > 24) glofScore += 25;
    if (rainSum > 10) glofScore += 30;
    if (humidity > 70) glofScore += 10;

    const glofLevel = glofScore >= 70 ? 'high' : glofScore >= 40 ? 'moderate' : 'low';
    if (glofLevel !== 'low' || location.name.toLowerCase().includes('hunza') || location.name.toLowerCase().includes('skardu') || location.name.toLowerCase().includes('gilgit')) {
      alerts.push({
        id: 'glof',
        title: 'GLOF (Glacial Outburst) Risk',
        titleUrdu: 'گلیشیر جھیل کا پھٹنے کا خطرہ',
        level: glofLevel,
        score: Math.min(100, glofScore),
        icon: 'fa-solid fa-water-overflow',
        desc: glofLevel === 'high' 
          ? 'High temperatures accelerating rapid glacial melt in Hunza, Shimshal & Shigar valleys. Avoid riverbank settlement areas.'
          : 'Moderate glacial melt rate observed. Keep monitoring river levels in mountain valleys.',
        descUrdu: glofLevel === 'high'
          ? 'ہنزہ، شمشال اور شگر کی وادیوں میں شدید گرمی سے گلیشیر پگھلنے کا عمل تیز ہے۔ ندی نالوں کے قریب جانے سے گریز کریں۔'
          : 'گلیشیر پگھلنے کا عمل معتدل ہے۔ دریا کے بہاؤ کی نگرانی رکھیں۔',
        safetyTip: 'Move to elevated ground immediately if river noise or rapid water discoloration increases.',
        safetyTipUrdu: 'دریا کی سطح یا آواز تبدیل ہونے پر فوراً اونچی جگہ پر منتقل ہوں۔'
      });
    }

    // 2. Landslide & Rockfall Warning (شاہراہِ قراقرم و پہاڑی راستے)
    let landslideScore = 10;
    if (rainSum > 15) landslideScore += 55;
    else if (rainSum > 5) landslideScore += 25;
    if ([61, 63, 65, 80, 81, 82, 95, 96, 99].includes(weatherCode)) landslideScore += 25;

    const landslideLevel = landslideScore >= 65 ? 'severe' : landslideScore >= 40 ? 'moderate' : 'low';
    alerts.push({
      id: 'landslide',
      title: 'Landslide & Rockfall Warning',
      titleUrdu: 'لینڈ سلائیڈنگ اور چٹانوں کا گرنا',
      level: landslideLevel,
      score: Math.min(100, landslideScore),
      icon: 'fa-solid fa-hill-rockslide',
      desc: landslideLevel === 'severe'
        ? 'Heavy rainfall triggering active rockfalls along Karakoram Highway (KKH) & Jaglot-Skardu Road. High risk of debris flow.'
        : landslideLevel === 'moderate'
        ? 'Moisture accumulation on mountain slopes. Exercise caution near steep cliff passes.'
        : 'Low landslide threat. Mountain slopes stable.',
      descUrdu: landslideLevel === 'severe'
        ? 'شاہراہِ قراقرم اور جگلوٹ سکردو روڈ پر شدید بارش کے باعث چٹانیں گرنے کا خطرہ اعلیٰ ہے۔ بلا ضرورت سفر سے گریز کریں۔'
        : 'پہاڑی ڈھلوانوں پر نیمی موجود ہے۔ احتیاط سے ڈرائیونگ کریں۔'
        : 'لینڈ سلائیڈنگ کا خطرہ فی الحال کم ہے۔',
      safetyTip: 'Avoid non-essential mountain travel after dark during rain spells.',
      safetyTipUrdu: 'بارش کے دوران رات کو پہاڑی سفر سے مکمل پرہیز کریں۔'
    });

    // 3. Karakoram Highway & Mountain Pass Road Blockage
    let passScore = 10;
    if (windGust > 40) passScore += 35;
    if ([71, 73, 75, 85, 86].includes(weatherCode)) passScore += 45;
    if (tempMax < 2) passScore += 20;

    const passLevel = passScore >= 65 ? 'high' : passScore >= 35 ? 'moderate' : 'low';
    alerts.push({
      id: 'pass_blockage',
      title: 'KKH & Babusar Pass Travel Risk',
      titleUrdu: 'شاہراہِ قراقرم و بابوسر ٹاپ سفری الرٹ',
      level: passLevel,
      score: Math.min(100, passScore),
      icon: 'fa-solid fa-road-barrier',
      desc: passLevel === 'high'
        ? 'Severe snow/wind spells affecting Babusar Pass, Khunjerab Pass & Deosai plains. Tire chains & emergency supplies required.'
        : passLevel === 'moderate'
        ? 'Gusty winds & localized ice patches reported at high elevation mountain passes.'
        : 'All major GB transit highways currently open & clear.',
      descUrdu: passLevel === 'high'
        ? 'بابوسر ٹاپ اور خنجراب پاس پر شدید برف باری اور ہواؤں سے سڑک بند ہونے کا خدشہ۔ گاڑی میں چین اور راشن رکھیں۔'
        : 'پہاڑی دروں پر تیز ہوائیں اور برف کے ٹکڑے موجود ہیں۔'
        : 'تمام اہم شاہراہیں فی الحال کھلی ہیں۔',
      safetyTip: 'Check GBDMA travel advisory before heading towards high altitude passes.',
      safetyTipUrdu: 'بابوسر یا سکردو روانگی سے قبل جی بی ڈی ایم اے کی ایڈوائزری چیک کریں۔'
    });

    // 4. Flash Flood & Heavy Runoff Risk
    let floodScore = 5;
    if (rainSum > 20) floodScore += 65;
    else if (rainSum > 8) floodScore += 30;

    const floodLevel = floodScore >= 65 ? 'severe' : floodScore >= 35 ? 'moderate' : 'low';
    alerts.push({
      id: 'flash_flood',
      title: 'Flash Flood & Nullah Overflow Risk',
      titleUrdu: 'طغیانی اور ندی نالوں کا ابلنا',
      level: floodLevel,
      score: Math.min(100, floodScore),
      icon: 'fa-solid fa-cloud-showers-water',
      desc: floodLevel === 'severe'
        ? 'Torrential rainfall causing rapid nullah surge in Gilgit, Nomal & Danyore tributaries.'
        : floodLevel === 'moderate'
        ? 'Moderate runoff in mountain streams. Keep clear of active stream beds.'
        : 'Stream water flow levels normal across valleys.',
      descUrdu: floodLevel === 'severe'
        ? 'گلگت، نومل اور دانیور کے نالوں میں فوری طغیانی کا خطرہ۔ ندی نالوں کے پاس جانے سے احتیاط کریں۔'
        : 'پہاڑی ندی نالوں میں بہاؤ معتدل ہے۔'
        : 'تمام نالوں میں پانی کا بہاؤ نارمل ہے۔',
      safetyTip: 'Do not attempt to cross swollen mountain nullahs or flooded bridges on foot or vehicle.',
      safetyTipUrdu: 'تیز بہاؤ والے پہاڑی نالے پار کرنے کی کوشش ہرگز نہ کریں۔'
    });

    // Determine Overall Risk Level
    const hasSevere = alerts.some(a => a.level === 'severe');
    const hasHigh = alerts.some(a => a.level === 'high');
    const hasModerate = alerts.some(a => a.level === 'moderate');

    const overallLevel = hasSevere ? 'severe' : hasHigh ? 'high' : hasModerate ? 'moderate' : 'low';

    this.currentRisks = alerts;
    return { overallLevel, alerts };
  }

  /* ------------------------------------------------------------------------
     Render Top Emergency Banner
     ------------------------------------------------------------------------ */
  renderBanner(evalResult, locationName) {
    const banner = document.getElementById('disasterAlertBanner');
    if (!banner) return;

    const { overallLevel, alerts } = evalResult;

    if (overallLevel === 'low' && !this.simulationMode) {
      banner.className = 'disaster-banner status-normal hidden';
      banner.innerHTML = '';
      return;
    }

    banner.classList.remove('hidden');
    banner.className = `disaster-banner status-${overallLevel}`;

    const activeAlerts = alerts.filter(a => a.level !== 'low');
    const primaryAlert = activeAlerts[0] || alerts[0];

    const iconClass = overallLevel === 'severe' || overallLevel === 'high' 
      ? 'fa-solid fa-triangle-exclamation pulse-icon' 
      : 'fa-solid fa-circle-info';

    banner.innerHTML = `
      <div class="banner-content">
        <div class="banner-badge badge-${overallLevel}">
          <i class="${iconClass}"></i>
          <span>${overallLevel.toUpperCase()} HAZARD ALERT</span>
        </div>
        <div class="banner-text">
          <strong>${locationName}: ${primaryAlert.title} (${primaryAlert.titleUrdu})</strong> — ${primaryAlert.desc}
        </div>
        <div class="banner-actions">
          <button class="banner-btn primary-btn" id="openDisasterModalBtn">
            <i class="fa-solid fa-shield-halved"></i> Safety Guide (رہنمائی)
          </button>
          <button class="banner-btn emergency-call-btn" onclick="window.location.href='tel:1122'">
            <i class="fa-solid fa-phone"></i> Rescue 1122
          </button>
          ${this.simulationMode ? `<span class="sim-tag"><i class="fa-solid fa-flask"></i> SIMULATION ACTIVE</span>` : ''}
        </div>
      </div>
    `;

    document.getElementById('openDisasterModalBtn')?.addEventListener('click', () => {
      this.openSafetyModal(evalResult, locationName);
    });
  }

  /* ------------------------------------------------------------------------
     Render Disaster Hub UI Section in App Dashboard
     ------------------------------------------------------------------------ */
  renderHub(evalResult, locationName) {
    const hubContainer = document.getElementById(this.containerId);
    if (!hubContainer) return;

    const { overallLevel, alerts } = evalResult;

    let overallBadge = `<span class="risk-pill pill-low"><i class="fa-solid fa-circle-check"></i> All Clear / محفوظ</span>`;
    if (overallLevel === 'moderate') {
      overallBadge = `<span class="risk-pill pill-moderate"><i class="fa-solid fa-triangle-exclamation"></i> Moderate Advisory / محتاط رہیں</span>`;
    } else if (overallLevel === 'high') {
      overallBadge = `<span class="risk-pill pill-high"><i class="fa-solid fa-triangle-exclamation"></i> High Risk Warning / الرٹ</span>`;
    } else if (overallLevel === 'severe') {
      overallBadge = `<span class="risk-pill pill-severe"><i class="fa-solid fa-skull-crossbones"></i> Severe Emergency / ہنگامی صورتحال</span>`;
    }

    let cardsHtml = '';
    alerts.forEach(alert => {
      const levelClass = alert.level;
      const meterWidth = `${alert.score}%`;

      cardsHtml += `
        <div class="hazard-card hazard-${levelClass}">
          <div class="hazard-header">
            <div class="hazard-title-group">
              <div class="hazard-icon-box icon-${levelClass}">
                <i class="${alert.icon}"></i>
              </div>
              <div>
                <h4>${alert.title}</h4>
                <span class="urdu-title">${alert.titleUrdu}</span>
              </div>
            </div>
            <span class="hazard-badge badge-${levelClass}">${levelClass.toUpperCase()}</span>
          </div>

          <div class="hazard-meter-container">
            <div class="hazard-meter-bar">
              <div class="hazard-meter-fill fill-${levelClass}" style="width: ${meterWidth};"></div>
            </div>
            <div class="hazard-meter-meta">
              <span>Risk Score: <strong>${alert.score}/100</strong></span>
              <span>${alert.score > 60 ? 'Immediate Action' : 'Monitoring'}</span>
            </div>
          </div>

          <p class="hazard-desc">${alert.desc}</p>
          <p class="hazard-desc-urdu">${alert.descUrdu}</p>

          <div class="hazard-tip-box">
            <i class="fa-solid fa-lightbulb"></i>
            <div>
              <strong>Safety Protocol:</strong> ${alert.safetyTip}
              <div class="tip-urdu">${alert.safetyTipUrdu}</div>
            </div>
          </div>
        </div>
      `;
    });

    hubContainer.innerHTML = `
      <div class="card disaster-hub-card">
        <div class="card-header">
          <div class="disaster-title-bar">
            <h3><i class="fa-solid fa-shield-cat"></i> Gilgit-Baltistan Disaster Alert System</h3>
            <span class="urdu-header-sub">گامزن ڈسائسٹر مینجمنٹ و الرٹ سسٹم</span>
          </div>
          <div class="disaster-controls">
            ${overallBadge}
            <button class="sim-toggle-btn ${this.simulationMode ? 'sim-active' : ''}" id="simToggleBtn" title="Test Emergency Scenario">
              <i class="fa-solid fa-flask"></i> ${this.simulationMode ? 'Exit Test Alert' : 'Test Emergency Alert'}
            </button>
          </div>
        </div>

        <div class="disaster-grid">
          ${cardsHtml}
        </div>

        <!-- Emergency Helplines Quick Panel -->
        <div class="emergency-contacts-strip">
          <div class="strip-header">
            <i class="fa-solid fa-phone-volume"></i> Emergency Helplines (ہنگامی فون نمبرز):
          </div>
          <div class="contacts-grid">
            <a href="tel:1122" class="contact-card c-1122">
              <div class="c-num">1122</div>
              <div class="c-name">Rescue 1122 GB</div>
              <div class="c-sub">ریسکیو ہنگامی خدمت</div>
            </a>
            <a href="tel:05811920874" class="contact-card c-gbdma">
              <div class="c-num">05811-920874</div>
              <div class="c-name">GBDMA Control Room</div>
              <div class="c-sub">ڈسائسٹر مینجمنٹ گلگت</div>
            </a>
            <a href="tel:051111157157" class="contact-card c-ndma">
              <div class="c-num">051-111-157-157</div>
              <div class="c-name">NDMA Helpline</div>
              <div class="c-sub">قومی آفت مینجمنٹ</div>
            </a>
            <a href="tel:130" class="contact-card c-nhmp">
              <div class="c-num">130</div>
              <div class="c-name">National Highways Patrol</div>
              <div class="c-sub">موٹروے و شاہراہ پولیس</div>
            </a>
          </div>
        </div>
      </div>
    `;

    // Attach Event Listener for simulation toggle
    document.getElementById('simToggleBtn')?.addEventListener('click', () => {
      this.toggleSimulation(locationName);
    });
  }

  /* ------------------------------------------------------------------------
     Alert Simulator Toggle
     ------------------------------------------------------------------------ */
  toggleSimulation(locationName) {
    this.simulationMode = !this.simulationMode;
    
    if (this.simulationMode) {
      this.simulatedAlert = {
        overallLevel: 'severe',
        alerts: [
          {
            id: 'glof_sim',
            title: 'GLOF & Lake Outburst Emergency (SIMULATION)',
            titleUrdu: 'گلیشیر جھیل کے پھٹنے کا ہنگامی الرٹ (ٹیسٹ)',
            level: 'severe',
            score: 92,
            icon: 'fa-solid fa-water-overflow',
            desc: 'CRITICAL ALERT: Rapid expansion of glacial melt pond detected in Passu & Shimshal valley. Flash flooding risk along Hunza river.',
            descUrdu: 'شدید الرٹ: پاسو اور شمشال میں گلیشیر جھیل کا بہاؤ تیز ہو چکا ہے۔ وادیِ ہنزہ کے ندیاں ابل رہی ہیں۔ فوراً اونچی جگہ منتقل ہوں۔',
            safetyTip: 'Evacuate river bed settlements immediately. Follow GBDMA evacuation orders.',
            safetyTipUrdu: 'دریا کے ملحقہ علاقوں سے فوراً انخلاء کریں اور محفوظ مقام پر جائیں۔'
          },
          {
            id: 'landslide_sim',
            title: 'KKH Rockfall Blockage Warning (SIMULATION)',
            titleUrdu: 'شاہراہِ قراقرم چٹانیں گرنے کا الرٹ (ٹیسٹ)',
            level: 'severe',
            score: 88,
            icon: 'fa-solid fa-hill-rockslide',
            desc: 'Active landslides at Tatta Pani & Hunza Valley section of Karakoram Highway. Road closed for all traffic.',
            descUrdu: 'تتا پانی اور ہنزہ سیکشن میں شدید لینڈ سلائیڈنگ۔ شاہراہ قراقرم تمام قسم کی ٹریفک کے لیے بند ہے۔',
            safetyTip: 'Do not travel on KKH between Gilgit & Chilas until clearance is confirmed by NHMP.',
            safetyTipUrdu: 'این ایچ ایم پی کے کلیئرنس پیغام تک قراقرم ہائی وے پر سفر معطل رکھیں۔'
          }
        ]
      };
    } else {
      this.simulatedAlert = null;
    }

    if (window.app && window.app.weatherData) {
      const res = this.evaluateRisks(window.app.weatherData, window.app.currentLocation);
      this.renderBanner(res, locationName);
      this.renderHub(res, locationName);
    }
  }

  /* ------------------------------------------------------------------------
     Open Detailed Disaster Safety Modal
     ------------------------------------------------------------------------ */
  openSafetyModal(evalResult, locationName) {
    let modal = document.getElementById('disasterSafetyModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'disasterSafetyModal';
      modal.className = 'modal-overlay';
      document.body.appendChild(modal);
    }

    const { overallLevel, alerts } = evalResult;

    let alertItemsHtml = alerts.map(a => `
      <div class="modal-hazard-box box-${a.level}">
        <div class="m-box-title">
          <i class="${a.icon}"></i>
          <strong>${a.title}</strong> — <span class="urdu-text">${a.titleUrdu}</span>
          <span class="hazard-badge badge-${a.level}">${a.level.toUpperCase()}</span>
        </div>
        <p>${a.desc}</p>
        <p class="urdu-text">${a.descUrdu}</p>
        <div class="m-tip">
          <strong>Action Plan:</strong> ${a.safetyTip}
          <div class="urdu-text">${a.safetyTipUrdu}</div>
        </div>
      </div>
    `).join('');

    modal.innerHTML = `
      <div class="modal-card disaster-modal-card">
        <div class="modal-header">
          <div>
            <h3><i class="fa-solid fa-shield-halved"></i> GB Disaster Safety Protocol — ${locationName}</h3>
            <p class="urdu-modal-sub">گلگت بلتستان ہنگامی حفاظتی تدابیر و رہنمائی</p>
          </div>
          <button class="close-modal-btn" id="closeDisasterModalBtn"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <div class="modal-body">
          <div class="alert-summary-banner status-${overallLevel}">
            <i class="fa-solid fa-triangle-exclamation"></i>
            <div>
              <strong>Overall Regional Threat Level: ${overallLevel.toUpperCase()}</strong>
              <div>گلگت بلتستان کے لیے موجودہ آفت کا سطح: ${overallLevel === 'severe' ? 'شدید ہنگامی' : overallLevel === 'high' ? 'اعلیٰ خطرہ' : overallLevel === 'moderate' ? 'محتاط رہیں' : 'محفوظ'}</div>
            </div>
          </div>

          <div class="modal-hazard-list">
            ${alertItemsHtml}
          </div>

          <div class="guidelines-section">
            <h4><i class="fa-solid fa-list-check"></i> Standard Evacuation & Emergency Guidelines (حفاظتی ہدایات)</h4>
            <ul>
              <li><strong>GLOF & Rivers:</strong> Keep 200m distance from Hunza, Gilgit & Shyok rivers during peak heatwaves or rain spells.</li>
              <li><strong>Mountain Driving:</strong> Carry 4WD tire chains, emergency flashlight, extra fuel, and warm clothing on KKH or Skardu road.</li>
              <li><strong>Helpline Direct Dialing:</strong> Call <strong>1122</strong> for emergency medical or landslide rescue.</li>
            </ul>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" id="dismissDisasterModalBtn">Close (بند کریں)</button>
          <a href="tel:1122" class="btn btn-danger"><i class="fa-solid fa-phone"></i> Call Rescue 1122 Now</a>
        </div>
      </div>
    `;

    modal.classList.add('active');

    const closeModal = () => modal.classList.remove('active');
    document.getElementById('closeDisasterModalBtn')?.addEventListener('click', closeModal);
    document.getElementById('dismissDisasterModalBtn')?.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  }
}

// Make globally accessible
window.DisasterAlertManager = DisasterAlertManager;

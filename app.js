/* ==========================================================================
   SkyCast - Main Application Engine
   Integrates Open-Meteo Weather APIs, DOM updates, State & User Interactions
   ========================================================================== */

class SkyCastApp {
  constructor() {
    this.unit = localStorage.getItem('skycast_unit') || 'C';
    this.currentLocation = {
      name: 'Gilgit',
      country: 'Gilgit-Baltistan, Pakistan',
      lat: 35.9187,
      lon: 74.3125
    };
    this.weatherData = null;
    this.airQualityData = null;
    this.hourlyTab = 'temperature';
    this.favorites = JSON.parse(localStorage.getItem('skycast_favorites') || '[]');

    this.chartManager = null;
    this.mapManager = null;
    this.disasterAlertManager = null;
    this.predictionEngine = null;
    this.urduVoiceAssistant = null;
    this.searchDebounceTimer = null;

    this.init();
  }

  async init() {
    // Initialize Managers
    this.chartManager = new ChartManager('hourlyChart');
    this.mapManager = new MapManager('weatherMap');
    if (window.DisasterAlertManager) this.disasterAlertManager = new DisasterAlertManager('disasterAlertHub');
    if (window.PredictionEngine) this.predictionEngine = new PredictionEngine('predictionEngineSection');
    if (window.UrduVoiceAssistant) this.urduVoiceAssistant = new UrduVoiceAssistant();

    // Sync unit toggle button UI
    const unitBtns = document.querySelectorAll('.unit-btn');
    unitBtns.forEach(btn => {
      if (btn.dataset.unit === this.unit) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Attach Event Listeners
    this.setupEventListeners();

    // Render Favorites
    this.renderFavoritesBar();

    // Load initial default weather or user's last saved location
    const savedLoc = localStorage.getItem('skycast_last_location');
    if (savedLoc) {
      try {
        this.currentLocation = JSON.parse(savedLoc);
      } catch (e) {
        console.error('Error parsing saved location', e);
      }
    }

    await this.loadWeatherForLocation(this.currentLocation);
  }

  /* ------------------------------------------------------------------------
     WMO Weather Codes Mapping
     ------------------------------------------------------------------------ */
  getWeatherInfo(code, isDay = 1) {
    const codes = {
      0: { text: isDay ? 'Clear Sky' : 'Clear Night', icon: isDay ? 'fa-sun' : 'fa-moon', theme: isDay ? 'theme-sunny' : 'theme-night' },
      1: { text: 'Mainly Clear', icon: isDay ? 'fa-cloud-sun' : 'fa-cloud-moon', theme: isDay ? 'theme-sunny' : 'theme-night' },
      2: { text: 'Partly Cloudy', icon: isDay ? 'fa-cloud-sun' : 'fa-cloud-moon', theme: 'theme-cloudy' },
      3: { text: 'Overcast', icon: 'fa-cloud', theme: 'theme-cloudy' },
      45: { text: 'Foggy', icon: 'fa-smog', theme: 'theme-foggy' },
      48: { text: 'Depositing Rime Fog', icon: 'fa-smog', theme: 'theme-foggy' },
      51: { text: 'Light Drizzle', icon: 'fa-cloud-rain', theme: 'theme-rainy' },
      53: { text: 'Moderate Drizzle', icon: 'fa-cloud-rain', theme: 'theme-rainy' },
      55: { text: 'Heavy Drizzle', icon: 'fa-cloud-showers-heavy', theme: 'theme-rainy' },
      56: { text: 'Freezing Drizzle', icon: 'fa-snowflake', theme: 'theme-snowy' },
      57: { text: 'Dense Freezing Drizzle', icon: 'fa-snowflake', theme: 'theme-snowy' },
      61: { text: 'Slight Rain', icon: 'fa-cloud-rain', theme: 'theme-rainy' },
      63: { text: 'Moderate Rain', icon: 'fa-cloud-rain', theme: 'theme-rainy' },
      65: { text: 'Heavy Rain', icon: 'fa-cloud-showers-heavy', theme: 'theme-rainy' },
      66: { text: 'Light Freezing Rain', icon: 'fa-icicles', theme: 'theme-snowy' },
      67: { text: 'Heavy Freezing Rain', icon: 'fa-icicles', theme: 'theme-snowy' },
      71: { text: 'Slight Snowfall', icon: 'fa-snowflake', theme: 'theme-snowy' },
      73: { text: 'Moderate Snowfall', icon: 'fa-snowflake', theme: 'theme-snowy' },
      75: { text: 'Heavy Snowfall', icon: 'fa-snowflake', theme: 'theme-snowy' },
      77: { text: 'Snow Grains', icon: 'fa-snowflake', theme: 'theme-snowy' },
      80: { text: 'Slight Rain Showers', icon: 'fa-cloud-sun-rain', theme: 'theme-rainy' },
      81: { text: 'Moderate Rain Showers', icon: 'fa-cloud-showers-heavy', theme: 'theme-rainy' },
      82: { text: 'Violent Rain Showers', icon: 'fa-cloud-showers-water', theme: 'theme-rainy' },
      85: { text: 'Slight Snow Showers', icon: 'fa-snowflake', theme: 'theme-snowy' },
      86: { text: 'Heavy Snow Showers', icon: 'fa-snowflake', theme: 'theme-snowy' },
      95: { text: 'Thunderstorm', icon: 'fa-cloud-bolt', theme: 'theme-thunderstorm' },
      96: { text: 'Thunderstorm & Hail', icon: 'fa-cloud-bolt', theme: 'theme-thunderstorm' },
      99: { text: 'Heavy Hail Thunderstorm', icon: 'fa-cloud-bolt', theme: 'theme-thunderstorm' }
    };

    return codes[code] || { text: 'Unknown', icon: 'fa-cloud-sun', theme: 'theme-sunny' };
  }

  /* ------------------------------------------------------------------------
     API Data Fetching
     ------------------------------------------------------------------------ */
  async loadWeatherForLocation(location) {
    this.showLoading(true);
    this.currentLocation = location;
    localStorage.setItem('skycast_last_location', JSON.stringify(location));

    try {
      // Parallel API Fetch: Weather Forecast + Air Quality
      const forecastUrl = `https://api.open-meteo.com/v1/forecast?latitude=${location.lat}&longitude=${location.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,cloud_cover,pressure_msl,wind_speed_10m,wind_direction_10m,wind_gusts_10m&hourly=temperature_2m,relative_humidity_2m,dew_point_2m,apparent_temperature,precipitation_probability,weather_code,pressure_msl,cloud_cover,wind_speed_10m,uv_index,visibility&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,uv_index_max,precipitation_sum,precipitation_probability_max,wind_speed_10m_max&timezone=auto`;
      const aqUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${location.lat}&longitude=${location.lon}&current=us_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone`;

      const [weatherRes, aqRes] = await Promise.all([
        fetch(forecastUrl).then(r => r.json()),
        fetch(aqUrl).then(r => r.json()).catch(() => null)
      ]);

      this.weatherData = weatherRes;
      this.airQualityData = aqRes;

      // Update UI Components
      this.renderAll();
    } catch (error) {
      console.error('Failed to load weather data:', error);
      alert('Unable to fetch weather data. Please check your internet connection or search query.');
    } finally {
      this.showLoading(false);
    }
  }

  async searchCities(query) {
    if (!query || query.trim().length < 2) {
      this.hideSearchResults();
      return;
    }

    try {
      const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=6&language=en&format=json`;
      const res = await fetch(url);
      const data = await res.json();

      if (data && data.results && data.results.length > 0) {
        this.renderSearchResults(data.results);
      } else {
        this.renderNoResults();
      }
    } catch (e) {
      console.error('Geocoding search failed:', e);
    }
  }

  /* ------------------------------------------------------------------------
     Rendering Engine
     ------------------------------------------------------------------------ */
  renderAll() {
    if (!this.weatherData) return;

    const current = this.weatherData.current;
    const daily = this.weatherData.daily;
    const weatherInfo = this.getWeatherInfo(current.weather_code, current.is_day);

    // Apply Theme
    document.body.className = weatherInfo.theme;

    // 1. Render Hero Section
    document.getElementById('cityName').textContent = this.currentLocation.name;
    document.getElementById('cityMeta').textContent = `${this.currentLocation.country || ''}`;
    
    const displayTemp = this.formatTemp(current.temperature_2m);
    document.getElementById('currentTemp').textContent = displayTemp;
    document.getElementById('tempUnit').textContent = `°${this.unit}`;
    document.getElementById('weatherCondition').textContent = weatherInfo.text;
    
    // Hero Weather Icon
    document.getElementById('heroWeatherIcon').innerHTML = `<i class="fa-solid ${weatherInfo.icon} weather-glow-icon"></i>`;
    
    // Hero High/Low & Feels Like
    const highToday = daily ? this.formatTemp(daily.temperature_2m_max[0]) : '--';
    const lowToday = daily ? this.formatTemp(daily.temperature_2m_min[0]) : '--';
    const feelsLikeTemp = this.formatTemp(current.apparent_temperature);

    document.getElementById('highTemp').textContent = `${highToday}°`;
    document.getElementById('lowTemp').textContent = `${lowToday}°`;
    document.getElementById('feelsLike').textContent = `${feelsLikeTemp}°`;

    document.getElementById('heroWind').textContent = `${Math.round(current.wind_speed_10m)} km/h`;
    document.getElementById('heroHumidity').textContent = `${current.relative_humidity_2m}%`;

    const hourlyUv = this.weatherData.hourly ? this.weatherData.hourly.uv_index[0] : 0;
    document.getElementById('heroUv').textContent = Math.round(hourlyUv);

    // Update Favorite Icon state
    this.updateFavoriteButtonState();

    // 2. Render Solar Arc
    this.renderSolarArc();

    // 3. Render Air Quality
    this.renderAirQuality();

    // 4. Render Hourly Cards & Chart
    this.renderHourlyCards();
    this.chartManager.update(this.weatherData.hourly, this.hourlyTab, this.unit === 'F');

    // 5. Render 7-Day Forecast
    this.renderDailyForecast();

    // 6. Render Weather Metrics Grid
    this.renderMetricsGrid();

    // 7. Render Disaster Alert System & Banner
    if (this.disasterAlertManager) {
      const evalRes = this.disasterAlertManager.evaluateRisks(this.weatherData, this.currentLocation);
      this.disasterAlertManager.renderBanner(evalRes, this.currentLocation.name);
      this.disasterAlertManager.renderHub(evalRes, this.currentLocation.name);
    }

    // 8. Render 14-Day Microclimate Prediction Engine
    if (this.predictionEngine) {
      this.predictionEngine.render(this.weatherData, this.currentLocation);
    }

    // 9. Render Interactive Map
    const tempStr = `${displayTemp}°${this.unit}`;
    this.mapManager.updateLocation(
      this.currentLocation.lat,
      this.currentLocation.lon,
      this.currentLocation.name,
      tempStr,
      weatherInfo.text
    );
  }

  renderSolarArc() {
    if (!this.weatherData.daily) return;

    const sunriseIso = this.weatherData.daily.sunrise[0];
    const sunsetIso = this.weatherData.daily.sunset[0];

    const sunrise = new Date(sunriseIso);
    const sunset = new Date(sunsetIso);
    const now = new Date();

    const formatTime = d => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    document.getElementById('sunriseTime').textContent = formatTime(sunrise);
    document.getElementById('sunsetTime').textContent = formatTime(sunset);

    // Calculate progression percentage
    const totalDaylight = sunset.getTime() - sunrise.getTime();
    const elapsed = now.getTime() - sunrise.getTime();
    let pct = elapsed / totalDaylight;
    pct = Math.max(0, Math.min(1, pct));

    // SVG arc stroke-dashoffset (total length = 283)
    const strokeDash = 283;
    const offset = strokeDash * (1 - pct);
    const arcPath = document.getElementById('solarArcProgress');
    if (arcPath) {
      arcPath.style.strokeDashoffset = offset;
    }

    // Sun Marker Position along Arc (semi-circle radius 90, center 100, 90)
    // Angle varies from PI (180deg - sunrise) to 0 (sunset)
    const angle = Math.PI * (1 - pct);
    const r = 90;
    const cx = 100 + r * Math.cos(angle);
    const cy = 90 - r * Math.sin(angle);

    const sunMarker = document.getElementById('sunMarker');
    if (sunMarker) {
      sunMarker.setAttribute('cx', cx);
      sunMarker.setAttribute('cy', cy);
    }
  }

  renderAirQuality() {
    if (!this.airQualityData || !this.airQualityData.current) {
      document.getElementById('aqiValue').textContent = 'N/A';
      return;
    }

    const currentAQ = this.airQualityData.current;
    const aqi = currentAQ.us_aqi || 30;

    document.getElementById('aqiValue').textContent = Math.round(aqi);
    document.getElementById('pm25').textContent = `${Math.round(currentAQ.pm2_5 || 0)} µg/m³`;
    document.getElementById('pm10').textContent = `${Math.round(currentAQ.pm10 || 0)} µg/m³`;
    document.getElementById('o3').textContent = `${Math.round(currentAQ.ozone || 0)} µg/m³`;
    document.getElementById('no2').textContent = `${Math.round(currentAQ.nitrogen_dioxide || 0)} µg/m³`;

    // AQI Indicator Position (scale 0-200+)
    const meterPct = Math.min(100, (aqi / 200) * 100);
    document.getElementById('aqiMeterIndicator').style.left = `${meterPct}%`;

    const badge = document.getElementById('aqiStatusBadge');
    if (aqi <= 50) {
      badge.textContent = 'Good';
      badge.className = 'aqi-badge status-good';
    } else if (aqi <= 100) {
      badge.textContent = 'Moderate';
      badge.className = 'aqi-badge status-moderate';
    } else if (aqi <= 150) {
      badge.textContent = 'Unhealthy';
      badge.className = 'aqi-badge status-unhealthy';
    } else {
      badge.textContent = 'Hazardous';
      badge.className = 'aqi-badge status-hazardous';
    }
  }

  renderHourlyCards() {
    const hourlyContainer = document.getElementById('hourlyCards');
    if (!hourlyContainer || !this.weatherData.hourly) return;

    hourlyContainer.innerHTML = '';
    const hourly = this.weatherData.hourly;
    const limit = 24;

    for (let i = 0; i < limit; i++) {
      const timeStr = new Date(hourly.time[i]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const temp = this.formatTemp(hourly.temperature_2m[i]);
      const pop = hourly.precipitation_probability[i];
      const code = hourly.weather_code[i];
      const isDay = hourly.is_day ? hourly.is_day[i] : 1;
      const weatherInfo = this.getWeatherInfo(code, isDay);

      const cardHtml = `
        <div class="hourly-card ${i === 0 ? 'active' : ''}">
          <span class="hour-time">${i === 0 ? 'Now' : timeStr}</span>
          <i class="fa-solid ${weatherInfo.icon} hour-icon"></i>
          <span class="hour-temp">${temp}°</span>
          <span class="hour-pop"><i class="fa-solid fa-droplet"></i> ${pop}%</span>
        </div>
      `;
      hourlyContainer.insertAdjacentHTML('beforeend', cardHtml);
    }
  }

  renderDailyForecast() {
    const dailyContainer = document.getElementById('dailyList');
    if (!dailyContainer || !this.weatherData.daily) return;

    dailyContainer.innerHTML = '';
    const daily = this.weatherData.daily;
    const count = daily.time.length;

    // Find global min and max for range bars
    const allMins = daily.temperature_2m_min;
    const allMaxs = daily.temperature_2m_max;
    const globMin = Math.min(...allMins);
    const globMax = Math.max(...allMaxs);
    const totalRange = globMax - globMin || 1;

    for (let i = 0; i < count; i++) {
      const dateObj = new Date(daily.time[i]);
      const dayName = i === 0 ? 'Today' : dateObj.toLocaleDateString([], { weekday: 'short' });
      const dateStr = dateObj.toLocaleDateString([], { month: 'short', day: 'numeric' });
      
      const code = daily.weather_code[i];
      const weatherInfo = this.getWeatherInfo(code, 1);

      const minTemp = this.formatTemp(daily.temperature_2m_min[i]);
      const maxTemp = this.formatTemp(daily.temperature_2m_max[i]);
      const popMax = daily.precipitation_probability_max[i] || 0;

      // Range fill calculation
      const leftPct = ((daily.temperature_2m_min[i] - globMin) / totalRange) * 100;
      const widthPct = ((daily.temperature_2m_max[i] - daily.temperature_2m_min[i]) / totalRange) * 100;

      const rowHtml = `
        <div class="daily-row">
          <div class="daily-day">
            <span class="day-name">${dayName}</span>
            <span class="day-date">${dateStr}</span>
          </div>
          <div class="daily-icon-box">
            <i class="fa-solid ${weatherInfo.icon}"></i>
            ${popMax > 20 ? `<span class="daily-pop">${popMax}%</span>` : ''}
          </div>
          <div class="daily-range-bar-wrapper">
            <div class="daily-range-bar">
              <div class="daily-range-fill" style="left: ${leftPct}%; width: ${Math.max(10, widthPct)}%;"></div>
            </div>
          </div>
          <div class="daily-temp-values">
            <span class="daily-min">${minTemp}°</span>
            <span class="daily-max">${maxTemp}°</span>
          </div>
        </div>
      `;
      dailyContainer.insertAdjacentHTML('beforeend', rowHtml);
    }
  }

  renderMetricsGrid() {
    const current = this.weatherData.current;
    const hourly = this.weatherData.hourly;

    // Wind Compass
    const windDir = current.wind_direction_10m || 0;
    const windSpd = Math.round(current.wind_speed_10m || 0);
    const windGust = Math.round(current.wind_gusts_10m || 0);

    document.getElementById('windSpeed').textContent = `${windSpd} km/h`;
    document.getElementById('windDirectionText').textContent = `Direction: ${windDir}°`;
    document.getElementById('windGusts').textContent = `${windGust} km/h`;
    
    const compassNeedle = document.getElementById('compassNeedle');
    if (compassNeedle) {
      compassNeedle.style.transform = `translate(-50%, -50%) rotate(${windDir}deg)`;
    }

    // UV Index
    const uvVal = hourly ? hourly.uv_index[0] : 0;
    const uvRounded = Math.round(uvVal);
    document.getElementById('uvValue').textContent = uvRounded;
    
    const uvFillPct = Math.min(100, (uvVal / 11) * 100);
    document.getElementById('uvBarFill').style.width = `${uvFillPct}%`;

    const uvCat = document.getElementById('uvCategory');
    const uvAdv = document.getElementById('uvAdvice');
    if (uvVal <= 2) {
      uvCat.textContent = 'Low';
      uvCat.className = 'uv-category cat-low';
      uvAdv.textContent = 'No sun protection required.';
    } else if (uvVal <= 5) {
      uvCat.textContent = 'Moderate';
      uvCat.className = 'uv-category cat-moderate';
      uvAdv.textContent = 'Wear sunglasses and SPF 30+.';
    } else if (uvVal <= 7) {
      uvCat.textContent = 'High';
      uvCat.className = 'uv-category cat-high';
      uvAdv.textContent = 'Seek shade during midday hours.';
    } else if (uvVal <= 10) {
      uvCat.textContent = 'Very High';
      uvCat.className = 'uv-category cat-very-high';
      uvAdv.textContent = 'Extra protection required.';
    } else {
      uvCat.textContent = 'Extreme';
      uvCat.className = 'uv-category cat-extreme';
      uvAdv.textContent = 'Avoid outdoors during peak sun.';
    }

    // Humidity & Dew Point
    const humidity = current.relative_humidity_2m || 0;
    document.getElementById('humidityValue').textContent = `${humidity}%`;
    document.getElementById('humidityBar').style.width = `${humidity}%`;

    const dewPoint = hourly ? this.formatTemp(hourly.dew_point_2m[0]) : '--';
    document.getElementById('dewPointText').textContent = `Dew point: ${dewPoint}°${this.unit}`;

    // Pressure
    const pressure = Math.round(current.pressure_msl || 1013);
    document.getElementById('pressureValue').textContent = `${pressure} hPa`;
    document.getElementById('pressureStatus').textContent = pressure > 1013 ? 'High pressure area' : 'Low pressure area';

    // Visibility
    const visMeters = hourly ? hourly.visibility[0] : 10000;
    const visKm = (visMeters / 1000).toFixed(1);
    document.getElementById('visibilityValue').textContent = `${visKm} km`;
    document.getElementById('visibilityStatus').textContent = visKm >= 10 ? 'Clear visibility' : 'Reduced visibility';

    // Cloud Cover
    const cloud = current.cloud_cover || 0;
    document.getElementById('cloudCoverValue').textContent = `${cloud}%`;
    document.getElementById('cloudBar').style.width = `${cloud}%`;
    document.getElementById('cloudStatus').textContent = cloud > 80 ? 'Overcast' : cloud > 40 ? 'Partly cloudy' : 'Clear skies';
  }

  /* ------------------------------------------------------------------------
     Favorites System
     ------------------------------------------------------------------------ */
  updateFavoriteButtonState() {
    const isFav = this.favorites.some(f => f.name.toLowerCase() === this.currentLocation.name.toLowerCase());
    const favIcon = document.getElementById('favoriteIcon');
    const favBtn = document.getElementById('favoriteBtn');

    if (isFav) {
      favIcon.className = 'fa-solid fa-star';
      favBtn.classList.add('active');
    } else {
      favIcon.className = 'fa-regular fa-star';
      favBtn.classList.remove('active');
    }
  }

  toggleFavorite() {
    const index = this.favorites.findIndex(f => f.name.toLowerCase() === this.currentLocation.name.toLowerCase());
    if (index >= 0) {
      this.favorites.splice(index, 1);
    } else {
      this.favorites.push({ ...this.currentLocation });
    }
    localStorage.setItem('skycast_favorites', JSON.stringify(this.favorites));
    this.updateFavoriteButtonState();
    this.renderFavoritesBar();
  }

  renderFavoritesBar() {
    const bar = document.getElementById('favoritesBar');
    const list = document.getElementById('favoritesList');

    if (!this.favorites || this.favorites.length === 0) {
      bar.classList.add('hidden');
      return;
    }

    bar.classList.remove('hidden');
    list.innerHTML = '';

    this.favorites.forEach(fav => {
      const chip = document.createElement('div');
      chip.className = 'fav-chip';
      chip.innerHTML = `
        <span>${fav.name}</span>
        <i class="fa-solid fa-xmark remove-fav" title="Remove"></i>
      `;

      chip.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-fav')) {
          e.stopPropagation();
          this.favorites = this.favorites.filter(f => f.name !== fav.name);
          localStorage.setItem('skycast_favorites', JSON.stringify(this.favorites));
          this.renderFavoritesBar();
          this.updateFavoriteButtonState();
        } else {
          this.loadWeatherForLocation(fav);
        }
      });

      list.appendChild(chip);
    });
  }

  /* ------------------------------------------------------------------------
     Event Handlers & Helpers
     ------------------------------------------------------------------------ */
  setupEventListeners() {
    // Search Input Typing with Debounce
    const searchInput = document.getElementById('searchInput');
    const clearBtn = document.getElementById('clearSearchBtn');

    searchInput.addEventListener('input', (e) => {
      const val = e.target.value;
      if (val.length > 0) {
        clearBtn.classList.remove('hidden');
      } else {
        clearBtn.classList.add('hidden');
      }

      clearTimeout(this.searchDebounceTimer);
      this.searchDebounceTimer = setTimeout(() => {
        this.searchCities(val);
      }, 350);
    });

    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const results = document.querySelectorAll('.result-item');
        if (results.length > 0) {
          results[0].click();
        } else if (searchInput.value.trim().length >= 2) {
          this.searchCities(searchInput.value.trim()).then(() => {
            const res = document.querySelectorAll('.result-item');
            if (res.length > 0) res[0].click();
          });
        }
      }
    });

    clearBtn.addEventListener('click', () => {
      searchInput.value = '';
      clearBtn.classList.add('hidden');
      this.hideSearchResults();
      searchInput.focus();
    });

    // Quick Location Buttons
    const quickLocBtns = document.querySelectorAll('.quick-loc-btn');
    quickLocBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const loc = {
          name: btn.dataset.name,
          country: btn.dataset.country,
          lat: parseFloat(btn.dataset.lat),
          lon: parseFloat(btn.dataset.lon)
        };
        this.loadWeatherForLocation(loc);
      });
    });

    // Close search results when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.search-wrapper')) {
        this.hideSearchResults();
      }
    });

    // Geolocation Button
    document.getElementById('geoBtn').addEventListener('click', () => {
      this.getUserLocation();
    });

    // Favorite Button
    document.getElementById('favoriteBtn').addEventListener('click', () => {
      this.toggleFavorite();
    });

    // Unit Toggle Buttons (°C / °F)
    const unitBtns = document.querySelectorAll('.unit-btn');
    unitBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const selectedUnit = btn.dataset.unit;
        if (this.unit !== selectedUnit) {
          this.unit = selectedUnit;
          localStorage.setItem('skycast_unit', selectedUnit);
          
          unitBtns.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');

          this.renderAll();
        }
      });
    });

    // Hourly Forecast Tabs (Temp, Rain, Wind)
    const tabBtns = document.querySelectorAll('#hourlyTabs .tab-btn');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.hourlyTab = btn.dataset.tab;
        
        if (this.weatherData && this.weatherData.hourly) {
          this.chartManager.update(this.weatherData.hourly, this.hourlyTab, this.unit === 'F');
        }
      });
    });

    // Urdu Voice Assistant Button Triggers
    const urduVoiceBtn = document.getElementById('urduVoiceBtn');
    const floatingMicBtn = document.getElementById('floatingUrduMicBtn');

    const handleUrduVoiceClick = () => {
      if (this.urduVoiceAssistant) {
        this.urduVoiceAssistant.startListening();
      }
    };

    if (urduVoiceBtn) urduVoiceBtn.addEventListener('click', handleUrduVoiceClick);
    if (floatingMicBtn) floatingMicBtn.addEventListener('click', handleUrduVoiceClick);
  }

  renderSearchResults(results) {
    const container = document.getElementById('searchResults');
    container.innerHTML = '';
    container.classList.remove('hidden');

    results.forEach(item => {
      const div = document.createElement('div');
      div.className = 'result-item';
      div.innerHTML = `
        <div>
          <span class="result-main">${item.name}</span>
          <span class="result-sub">${item.admin1 ? item.admin1 + ', ' : ''}${item.country || ''}</span>
        </div>
        <i class="fa-solid fa-chevron-right" style="font-size: 0.75rem; color: #64748b;"></i>
      `;

      div.addEventListener('click', () => {
        const location = {
          name: item.name,
          country: `${item.admin1 ? item.admin1 + ', ' : ''}${item.country || ''}`,
          lat: item.latitude,
          lon: item.longitude
        };

        document.getElementById('searchInput').value = '';
        document.getElementById('clearSearchBtn').classList.add('hidden');
        this.hideSearchResults();
        this.loadWeatherForLocation(location);
      });

      container.appendChild(div);
    });
  }

  renderNoResults() {
    const container = document.getElementById('searchResults');
    container.innerHTML = `
      <div style="padding: 1rem; text-align: center; color: #94a3b8; font-size: 0.9rem;">
        No matching cities found. Try another search.
      </div>
    `;
    container.classList.remove('hidden');
  }

  hideSearchResults() {
    const container = document.getElementById('searchResults');
    if (container) container.classList.add('hidden');
  }

  getUserLocation() {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    this.showLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;

        // Reverse Geocode using Open-Meteo or fallback
        try {
          const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${lat.toFixed(2)},${lon.toFixed(2)}&count=1`);
          const data = await res.json();
          let name = 'Your Location';
          let country = '';

          if (data && data.results && data.results.length > 0) {
            name = data.results[0].name;
            country = data.results[0].country || '';
          }

          await this.loadWeatherForLocation({ name, country, lat, lon });
        } catch (e) {
          await this.loadWeatherForLocation({ name: 'Your Location', country: '', lat, lon });
        }
      },
      (err) => {
        this.showLoading(false);
        alert('Unable to retrieve your location. Please ensure location permissions are enabled.');
      }
    );
  }

  formatTemp(celsius) {
    if (celsius === undefined || celsius === null) return '--';
    if (this.unit === 'F') {
      return Math.round((celsius * 9/5) + 32);
    }
    return Math.round(celsius);
  }

  showLoading(show) {
    const spinner = document.getElementById('loadingSpinner');
    if (spinner) {
      if (show) spinner.classList.remove('hidden');
      else spinner.classList.add('hidden');
    }
  }
}

// Initialize Application when DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.app = new SkyCastApp();
});

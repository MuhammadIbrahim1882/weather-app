/* ==========================================================================
   SkyCast - Map Manager
   Handles Leaflet.js interactive dark map initialization and marker updates
   ========================================================================== */

class MapManager {
  constructor(mapContainerId) {
    this.containerId = mapContainerId;
    this.map = null;
    this.marker = null;
    this.initMap();
  }

  initMap() {
    const container = document.getElementById(this.containerId);
    if (!container || typeof L === 'undefined') return;

    // Initialize Leaflet map with dark theme tiles
    this.map = L.map(this.containerId, {
      zoomControl: true,
      scrollWheelZoom: false
    }).setView([35.9187, 74.3125], 11);

    // CartoDB Dark Matter tiles for sleek modern dark aesthetics
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(this.map);
  }

  updateLocation(lat, lon, cityName, tempStr, conditionText) {
    if (!this.map) return;

    const coords = [lat, lon];
    this.map.setView(coords, 10);

    // Custom HTML Marker Icon
    const customIcon = L.divIcon({
      className: 'custom-map-marker',
      html: `
        <div style="
          background: linear-gradient(135deg, #f59e0b, #6366f1);
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 3px solid #ffffff;
          box-shadow: 0 0 15px rgba(245, 158, 11, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 14px;
        ">
          <i class="fa-solid fa-location-dot"></i>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -16]
    });

    if (this.marker) {
      this.marker.setLatLng(coords);
    } else {
      this.marker = L.marker(coords, { icon: customIcon }).addTo(this.map);
    }

    const popupContent = `
      <div style="font-family: 'Plus Jakarta Sans', sans-serif; padding: 4px;">
        <h4 style="margin: 0; font-size: 14px; font-weight: 700;">${cityName}</h4>
        <p style="margin: 4px 0 0 0; font-size: 13px; color: #fbbf24; font-weight: 800;">${tempStr} • ${conditionText}</p>
      </div>
    `;

    this.marker.bindPopup(popupContent).openPopup();

    // Update coordinate text label
    const coordsLabel = document.getElementById('mapCoordsLabel');
    if (coordsLabel) {
      coordsLabel.textContent = `Lat: ${lat.toFixed(4)}°, Lon: ${lon.toFixed(4)}°`;
    }

    // Trigger window resize event to prevent rendering glitches
    setTimeout(() => {
      this.map.invalidateSize();
    }, 200);
  }
}

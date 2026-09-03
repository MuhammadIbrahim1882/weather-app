/* ==========================================================================
   SkyCast - Chart Manager
   Handles Chart.js initialization, gradient rendering, and dataset updates
   ========================================================================== */

class ChartManager {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    this.chart = null;
    this.initChart();
  }

  initChart() {
    if (!this.ctx) return;

    this.chart = new Chart(this.ctx, {
      type: 'line',
      data: {
        labels: [],
        datasets: []
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            titleFont: { family: 'Plus Jakarta Sans', size: 14, weight: '700' },
            bodyFont: { family: 'Plus Jakarta Sans', size: 13 },
            borderColor: 'rgba(255, 255, 255, 0.15)',
            borderWidth: 1,
            padding: 12,
            cornerRadius: 10,
            displayColors: false,
            callbacks: {
              label: (context) => {
                const unit = context.dataset.unit || '';
                return `${context.dataset.label}: ${context.parsed.y}${unit}`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: {
              color: 'rgba(255, 255, 255, 0.05)',
              drawBorder: false
            },
            ticks: {
              color: '#94a3b8',
              font: { family: 'Plus Jakarta Sans', size: 11 },
              maxRotation: 0
            }
          },
          y: {
            grid: {
              color: 'rgba(255, 255, 255, 0.05)',
              drawBorder: false
            },
            ticks: {
              color: '#94a3b8',
              font: { family: 'Plus Jakarta Sans', size: 11 }
            }
          }
        },
        animations: {
          tension: {
            duration: 1000,
            easing: 'easeInOutCubic'
          }
        }
      }
    });
  }

  createGradient(colorStart, colorEnd) {
    if (!this.ctx) return colorStart;
    const gradient = this.ctx.createLinearGradient(0, 0, 0, 200);
    gradient.addColorStop(0, colorStart);
    gradient.addColorStop(1, colorEnd);
    return gradient;
  }

  update(hourlyData, mode = 'temperature', isFahrenheit = false) {
    if (!this.chart || !hourlyData || !hourlyData.time) return;

    // Take next 24 hours starting from current hour
    const limit = 24;
    const labels = hourlyData.time.slice(0, limit).map(t => {
      const date = new Date(t);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    });

    let dataValues = [];
    let label = 'Temperature';
    let unit = isFahrenheit ? '°F' : '°C';
    let gradientStart = 'rgba(245, 158, 11, 0.4)';
    let gradientEnd = 'rgba(245, 158, 11, 0.0)';
    let borderColor = '#f59e0b';
    let chartType = 'line';

    if (mode === 'temperature') {
      label = 'Temperature';
      unit = isFahrenheit ? '°F' : '°C';
      dataValues = hourlyData.temperature_2m.slice(0, limit).map(val => {
        return isFahrenheit ? Math.round((val * 9/5) + 32) : Math.round(val);
      });
      gradientStart = 'rgba(245, 158, 11, 0.4)';
      gradientEnd = 'rgba(245, 158, 11, 0.0)';
      borderColor = '#fbbf24';
    } else if (mode === 'precipitation') {
      label = 'Rain Probability';
      unit = '%';
      dataValues = hourlyData.precipitation_probability.slice(0, limit);
      gradientStart = 'rgba(56, 189, 248, 0.4)';
      gradientEnd = 'rgba(56, 189, 248, 0.0)';
      borderColor = '#38bdf8';
    } else if (mode === 'wind') {
      label = 'Wind Speed';
      unit = ' km/h';
      dataValues = hourlyData.wind_speed_10m.slice(0, limit).map(v => Math.round(v));
      gradientStart = 'rgba(168, 85, 247, 0.4)';
      gradientEnd = 'rgba(168, 85, 247, 0.0)';
      borderColor = '#c084fc';
    }

    const fillGradient = this.createGradient(gradientStart, gradientEnd);

    this.chart.data.labels = labels;
    this.chart.data.datasets = [{
      label: label,
      data: dataValues,
      unit: unit,
      borderColor: borderColor,
      borderWidth: 3,
      backgroundColor: fillGradient,
      fill: true,
      tension: 0.4,
      pointBackgroundColor: borderColor,
      pointBorderColor: '#ffffff',
      pointBorderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6
    }];

    this.chart.update();
  }
}

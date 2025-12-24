const API_URL = 'https://hadab-calendar-api.workers.dev';

const HADAB_DAY_SECONDS = 94180.23;
const HADAB_TEMS_PER_DAY = 26;
const HADAB_MINUTS_PER_TEM = 100;
const HADAB_SEGUNS_PER_MINUT = 100;

const MONTHS = [
  "Helkatom", "Stabom", "Prairom", "Arsom", "Balom", "Nûle", 
  "Airûle", "Frostûle", "Astûle", "Zoris", "Curis", "Traris", "Biris"
];

const WEEKDAYS = [
  "Suldas", "Stabdas", "Cultas", "Prasdas", "Gardas", "Flardas", "Krindas"
];

let syncData = null;
let lastSyncTime = 0;
let updateInterval = null;

function pad(num, size = 2) {
  return String(num).padStart(size, '0');
}

function calculateLocalHadabTime() {
  if (!syncData) return null;

  const now = Date.now();
  const timeSinceSync = (now - lastSyncTime) / 1000;
  const hadabDaysSinceSync = timeSinceSync / HADAB_DAY_SECONDS;

  const syncDayFraction = 
    (parseInt(syncData.time.tems) / HADAB_TEMS_PER_DAY) +
    (parseInt(syncData.time.minuts) / (HADAB_TEMS_PER_DAY * HADAB_MINUTS_PER_TEM)) +
    (parseInt(syncData.time.seguns) / (HADAB_TEMS_PER_DAY * HADAB_MINUTS_PER_TEM * HADAB_SEGUNS_PER_MINUT));

  let currentDayFraction = syncDayFraction + hadabDaysSinceSync;
  
  const daysElapsed = Math.floor(currentDayFraction);
  currentDayFraction = currentDayFraction - daysElapsed;

  if (currentDayFraction >= 1) {
    currentDayFraction -= 1;
  }

  const totalTems = currentDayFraction * HADAB_TEMS_PER_DAY;
  const tems = Math.floor(totalTems);
  const totalMinuts = (totalTems - tems) * HADAB_MINUTS_PER_TEM;
  const minuts = Math.floor(totalMinuts);
  const seguns = Math.floor((totalMinuts - minuts) * HADAB_SEGUNS_PER_MINUT);

  return {
    tems: pad(tems),
    minuts: pad(minuts),
    seguns: pad(seguns),
    daysElapsed
  };
}

function renderHadabTime() {
  const localTime = calculateLocalHadabTime();
  
  if (!localTime || !syncData) {
    document.getElementById('content').innerHTML = '<div class="error">Erro de sincronização</div>';
    return;
  }

  let content = '';

  if (syncData.isEvriom) {
    content += `<div class="evriom-badge">Evriom de ${syncData.evriomType}</div>`;
  }

  content += `
    <div class="time-display">
      <div class="time">${localTime.tems}:${localTime.minuts}:${localTime.seguns}</div>
      <div class="date">${syncData.day} ${syncData.month}, ${syncData.year} ${syncData.erion.suffix}</div>
      ${!syncData.isEvriom ? `<div class="weekday">${syncData.weekday}</div>` : ''}
    </div>
  `;

  content += `
    <div class="info-grid">
      <div class="info-card">
        <div class="label">Estação</div>
        <div class="value">${syncData.season.name}</div>
      </div>
      <div class="info-card">
        <div class="label">Dia do Ano</div>
        <div class="value">${syncData.dayOfYear}/${syncData.isLeapYear ? 366 : 365}</div>
      </div>
      <div class="info-card">
        <div class="label">Érion</div>
        <div class="value">${syncData.erion.name}</div>
      </div>
      <div class="info-card">
        <div class="label">Tipo de Ano</div>
        <div class="value">${syncData.isLeapYear ? 'Bissexto' : 'Comum'}</div>
      </div>
    </div>
  `;

  if (syncData.specialYearInfo) {
    content += `
      <div class="special-year">
        <div class="status">${syncData.specialYearInfo.designation}</div>
      </div>
    `;
  }

  document.getElementById('content').innerHTML = content;
}

async function syncWithAPI() {
  try {
    const response = await fetch(`${API_URL}/api/current?metadata=true`);
    
    if (!response.ok) {
      throw new Error('API response not ok');
    }

    const data = await response.json();
    syncData = data.hadab;
    lastSyncTime = Date.now();

    document.getElementById('api-status').style.color = '#28a745';
    
    renderHadabTime();

    if (!updateInterval) {
      updateInterval = setInterval(renderHadabTime, 362);
    }

  } catch (error) {
    console.error('Sync error:', error);
    document.getElementById('api-status').style.color = '#dc3545';
    document.getElementById('content').innerHTML = `
      <div class="error">
        Erro ao conectar com a API<br>
        <small>${error.message}</small>
      </div>
    `;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  syncWithAPI();
  
  setInterval(syncWithAPI, 60000);
});

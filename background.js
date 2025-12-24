const API_URL = 'https://hadab-calendar-api.workers.dev';

chrome.runtime.onInstalled.addListener(() => {
  console.log('Hadab Calendar Extension installed');
  syncTime();
});

async function syncTime() {
  try {
    const response = await fetch(`${API_URL}/api/current`);
    const data = await response.json();
    
    await chrome.storage.local.set({
      lastSync: Date.now(),
      hadabData: data.hadab
    });

  } catch (error) {
    console.error('Background sync error:', error);
  }
}

chrome.alarms.create('syncHadabTime', { periodInMinutes: 60 });

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'syncHadabTime') {
    syncTime();
  }
});

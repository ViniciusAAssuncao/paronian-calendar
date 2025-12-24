import {
  calculateHadabDate,
  calculateNextEvriom,
  hadabDateToTimestamp,
  getYearMetadata,
  convertEarthToHadab,
  convertHadabToEarth,
  getCurrentHadabTime,
  getTimeUntilNextDay,
  isLeapYear,
  MONTHS,
  WEEKDAYS,
  SEASONS
} from '../calendar-core.js';

const CACHE_TTL = 60;
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json'
};

async function fetchCalendarData(env) {
  if (env.CALENDAR_DATA_CACHE) {
    try {
      const cached = await env.CALENDAR_DATA_CACHE.get('calendar-data', { type: 'json' });
      if (cached) return cached;
    } catch (e) {}
  }
  
  const defaultData = {
    specialYears: {
      2025: {
        status: "lost",
        name: "Ano Perdido",
        description: "Ano Incorrido de péssimo augúrio",
        designation: "Perdido"
      },
      2027: {
        status: "blessed",
        name: "Ano de Colheita Espiritual",
        description: "Ano de graça abundante esperada",
        designation: "Colheita"
      }
    },
    holidays: [],
    liturgicalCycle: {}
  };
  
  if (env.GITHUB_DATA_URL) {
    try {
      const response = await fetch(env.GITHUB_DATA_URL);
      if (response.ok) {
        const githubData = await response.json();
        const mergedData = { ...defaultData, ...githubData };
        
        if (env.CALENDAR_DATA_CACHE) {
          await env.CALENDAR_DATA_CACHE.put('calendar-data', JSON.stringify(mergedData), {
            expirationTtl: 3600
          });
        }
        
        return mergedData;
      }
    } catch (e) {}
  }
  
  return defaultData;
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: CORS_HEADERS
  });
}

function errorResponse(message, status = 400) {
  return jsonResponse({ error: message, status }, status);
}

async function handleCurrentTime(request, env) {
  const url = new URL(request.url);
  const includeMetadata = url.searchParams.get('metadata') === 'true';
  
  const current = getCurrentHadabTime();
  const calendarData = await fetchCalendarData(env);
  
  const response = {
    timestamp: Date.now(),
    hadab: current,
    nextDay: getTimeUntilNextDay()
  };
  
  if (includeMetadata) {
    response.yearMetadata = getYearMetadata(current.year, calendarData.specialYears);
    response.specialYearInfo = calendarData.specialYears[current.year] || null;
  }
  
  return jsonResponse(response);
}

async function handleConvertToHadab(request, env) {
  const url = new URL(request.url);
  const timestamp = url.searchParams.get('timestamp');
  const date = url.searchParams.get('date');
  
  let timestampMs;
  
  if (timestamp) {
    timestampMs = parseInt(timestamp);
    if (timestamp.length === 10) {
      timestampMs *= 1000;
    }
  } else if (date) {
    timestampMs = new Date(date).getTime();
  } else {
    timestampMs = Date.now();
  }
  
  if (isNaN(timestampMs)) {
    return errorResponse('Invalid timestamp or date format');
  }
  
  const hadabDate = convertEarthToHadab(timestampMs);
  const calendarData = await fetchCalendarData(env);
  
  return jsonResponse({
    input: {
      timestamp: timestampMs,
      earthDate: new Date(timestampMs).toISOString()
    },
    hadab: hadabDate,
    specialYearInfo: calendarData.specialYears[hadabDate.year] || null
  });
}

async function handleConvertToEarth(request, env) {
  const url = new URL(request.url);
  const year = parseInt(url.searchParams.get('year'));
  const month = url.searchParams.get('month');
  const day = parseInt(url.searchParams.get('day'));
  const tems = parseInt(url.searchParams.get('tems') || '0');
  const minuts = parseInt(url.searchParams.get('minuts') || '0');
  const seguns = parseInt(url.searchParams.get('seguns') || '0');
  
  if (!year || !month || !day) {
    return errorResponse('Missing required parameters: year, month, day');
  }
  
  if (!MONTHS.includes(month)) {
    return errorResponse(`Invalid month. Must be one of: ${MONTHS.join(', ')}`);
  }
  
  try {
    const timestampMs = convertHadabToEarth(year, month, day, tems, minuts, seguns);
    
    return jsonResponse({
      input: {
        year,
        month,
        day,
        time: `${tems}:${minuts}:${seguns}`
      },
      earth: {
        timestamp: timestampMs,
        date: new Date(timestampMs).toISOString(),
        unix: Math.floor(timestampMs / 1000)
      }
    });
  } catch (error) {
    return errorResponse(error.message);
  }
}

async function handleYearInfo(request, env) {
  const url = new URL(request.url);
  const yearParam = url.searchParams.get('year');
  const year = yearParam ? parseInt(yearParam) : getCurrentHadabTime().year;
  
  if (isNaN(year)) {
    return errorResponse('Invalid year parameter');
  }
  
  const calendarData = await fetchCalendarData(env);
  const metadata = getYearMetadata(year, calendarData.specialYears);
  
  return jsonResponse(metadata);
}

async function handleEvriomInfo(request, env) {
  const timestamp = Date.now();
  const evriomInfo = calculateNextEvriom(timestamp);
  
  return jsonResponse({
    timestamp,
    current: getCurrentHadabTime(),
    evriom: evriomInfo
  });
}

async function handleCalendarConstants(request, env) {
  return jsonResponse({
    months: MONTHS,
    weekdays: WEEKDAYS,
    seasons: SEASONS,
    constants: {
      hadabDaySeconds: 94180.23,
      hadabYearDays: 365.24219,
      temsPerDay: 26,
      minutsPerTem: 100,
      segunsPerMinut: 100
    },
    leapYearRules: {
      description: "Divisible by 4, except divisible by 128",
      precision: "1 day error every ~52,000 years",
      exampleLeap: 2024,
      exampleNonLeap: 2128
    }
  });
}

async function handleBatchConvert(request, env) {
  if (request.method !== 'POST') {
    return errorResponse('Method not allowed. Use POST', 405);
  }
  
  try {
    const body = await request.json();
    const timestamps = body.timestamps || [];
    
    if (!Array.isArray(timestamps) || timestamps.length === 0) {
      return errorResponse('Request body must contain an array of timestamps');
    }
    
    if (timestamps.length > 100) {
      return errorResponse('Maximum 100 timestamps per request');
    }
    
    const results = timestamps.map(ts => {
      try {
        const timestampMs = typeof ts === 'string' ? new Date(ts).getTime() : ts;
        return {
          input: ts,
          hadab: convertEarthToHadab(timestampMs),
          success: true
        };
      } catch (error) {
        return {
          input: ts,
          error: error.message,
          success: false
        };
      }
    });
    
    return jsonResponse({
      total: timestamps.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results
    });
  } catch (error) {
    return errorResponse('Invalid JSON body');
  }
}

async function handleHealthCheck(request, env) {
  const current = getCurrentHadabTime();
  
  return jsonResponse({
    status: 'healthy',
    timestamp: Date.now(),
    hadabTime: current.formatted.long,
    version: '1.0.0',
    endpoints: {
      current: '/api/current',
      convertToHadab: '/api/convert/to-hadab',
      convertToEarth: '/api/convert/to-earth',
      yearInfo: '/api/year',
      evriom: '/api/evriom',
      constants: '/api/constants',
      batch: '/api/batch',
      health: '/api/health'
    }
  });
}

async function handleRequest(request, env) {
  const url = new URL(request.url);
  const path = url.pathname;
  
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: CORS_HEADERS
    });
  }
  
  try {
    switch (path) {
      case '/':
      case '/api':
      case '/api/':
        return handleHealthCheck(request, env);
      
      case '/api/current':
      case '/api/now':
        return handleCurrentTime(request, env);
      
      case '/api/convert/to-hadab':
      case '/api/to-hadab':
        return handleConvertToHadab(request, env);
      
      case '/api/convert/to-earth':
      case '/api/to-earth':
        return handleConvertToEarth(request, env);
      
      case '/api/year':
      case '/api/year-info':
        return handleYearInfo(request, env);
      
      case '/api/evriom':
        return handleEvriomInfo(request, env);
      
      case '/api/constants':
      case '/api/info':
        return handleCalendarConstants(request, env);
      
      case '/api/batch':
        return handleBatchConvert(request, env);
      
      case '/api/health':
        return handleHealthCheck(request, env);
      
      default:
        return errorResponse('Endpoint not found', 404);
    }
  } catch (error) {
    console.error('Request error:', error);
    return errorResponse('Internal server error: ' + error.message, 500);
  }
}

export default {
  async fetch(request, env, ctx) {
    return handleRequest(request, env);
  }
};

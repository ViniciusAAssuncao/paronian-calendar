const HADAB_DAY_SECONDS = 94180.23;
const EARTH_SECONDS_PER_DAY = 86400;
const HADAB_YEAR_DAYS = 365.24219;
const HADAB_TEMS_PER_DAY = 26;
const HADAB_MINUTS_PER_TEM = 100;
const HADAB_SEGUNS_PER_MINUT = 100;

const GREGORIAN_EPOCH_MS = new Date("2000-11-21T22:20:38Z").getTime();
const HADAB_EPOCH_YEAR = 2004;

const MONTHS = [
  "Helkatom",
  "Stabom",
  "Prairom",
  "Arsom",
  "Balom",
  "Nûle",
  "Airûle",
  "Frostûle",
  "Astûle",
  "Zoris",
  "Curis",
  "Traris",
  "Biris",
];

const WEEKDAYS = [
  "Suldas",
  "Stabdas",
  "Cultas",
  "Prasdas",
  "Gardas",
  "Flardas",
  "Krindas",
];

const SEASONS = [
  { name: "Helkaper", krimlog: "Helkaper", start: 1, duration: 91 },
  { name: "Balansper", krimlog: "Balansper", start: 92, duration: 91 },
  { name: "Frosper", krimlog: "Frosper", start: 183, duration: 91 },
  { name: "Nodper", krimlog: "Nodper", start: 274, duration: 92.242 },
];

const ERIONS = {
  "pre-edic": {
    start: -Infinity,
    end: -13025,
    multiplier: 1,
    suffix: "Pré-AH",
  },
  edic: { start: -13025, end: 0, multiplier: 3, suffix: "AHE" },
  ancient: { start: 0, end: 1000, multiplier: 1, suffix: "AHA" },
  current: { start: 1000, end: Infinity, multiplier: 1, suffix: "AH" },
};

function isLeapYear(year) {
  if (year % 128 === 0) return false;
  if (year % 4 === 0) return true;
  return false;
}

function getDaysInYear(year) {
  return isLeapYear(year) ? 366 : 365;
}

function getYearStartDay(year) {
  let totalDays = 0;
  const startYear = HADAB_EPOCH_YEAR;

  if (year >= startYear) {
    for (let y = startYear; y < year; y++) {
      totalDays += getDaysInYear(y);
    }
  } else {
    for (let y = year; y < startYear; y++) {
      totalDays -= getDaysInYear(y);
    }
  }

  return totalDays;
}

function earthSecondsToHadabDays(earthSeconds) {
  return earthSeconds / HADAB_DAY_SECONDS;
}

function hadabDaysToEarthSeconds(hadabDays) {
  return hadabDays * HADAB_DAY_SECONDS;
}

function getErionInfo(year) {
  for (const [key, erion] of Object.entries(ERIONS)) {
    if (year >= erion.start && year < erion.end) {
      return {
        name: key,
        suffix: erion.suffix || "AH",
        multiplier: erion.multiplier || 1,
        yearInErion: year - erion.start,
      };
    }
  }
  return {
    name: "current",
    suffix: "AH",
    multiplier: 1,
    yearInErion: year - 26050,
  };
}

function calculateHadabDate(timestampMs) {
  const earthSecondsSinceEpoch = (timestampMs - GREGORIAN_EPOCH_MS) / 1000;
  const hadabDaysSinceEpoch = earthSecondsToHadabDays(earthSecondsSinceEpoch);

  let year = HADAB_EPOCH_YEAR;
  let remainingDays = hadabDaysSinceEpoch;

  if (remainingDays >= 0) {
    while (remainingDays >= getDaysInYear(year)) {
      remainingDays -= getDaysInYear(year);
      year++;
    }
  } else {
    while (remainingDays < 0) {
      year--;
      remainingDays += getDaysInYear(year);
    }
  }

  const isLeap = isLeapYear(year);
  const dayOfYear = Math.floor(remainingDays) + 1;
  const dayFraction = remainingDays - Math.floor(remainingDays);

  let month = 0;
  let dayOfMonth = dayOfYear;
  let isEvriom = false;
  let evriomType = null;

  if (dayOfYear === 1) {
    isEvriom = true;
    evriomType = "Helkatom";
    month = 0;
    dayOfMonth = 0;
  } else if (isLeap && dayOfYear === 366) {
    isEvriom = true;
    evriomType = "Biris";
    month = 12;
    dayOfMonth = 29;
  } else {
    let adjustedDay = dayOfYear - (isEvriom ? 0 : 1);

    if (isLeap && adjustedDay > 364) {
      adjustedDay = 364;
    }

    month = Math.floor((adjustedDay - 1) / 28);
    dayOfMonth = ((adjustedDay - 1) % 28) + 1;

    if (month >= 13) {
      month = 12;
      dayOfMonth = 28;
    }
  }

  const weekdayIndex = (dayOfYear - 1) % 7;
  const weekday = isEvriom ? null : WEEKDAYS[weekdayIndex];

  const totalTems = dayFraction * HADAB_TEMS_PER_DAY;
  const tems = Math.floor(totalTems);
  const totalMinuts = (totalTems - tems) * HADAB_MINUTS_PER_TEM;
  const minuts = Math.floor(totalMinuts);
  const seguns = Math.floor((totalMinuts - minuts) * HADAB_SEGUNS_PER_MINUT);

  let seasonIndex = 0;
  let dayInSeason = dayOfYear;
  for (let i = 0; i < SEASONS.length; i++) {
    if (
      dayOfYear >= SEASONS[i].start &&
      (i === SEASONS.length - 1 || dayOfYear < SEASONS[i + 1].start)
    ) {
      seasonIndex = i;
      dayInSeason = dayOfYear - SEASONS[i].start + 1;
      break;
    }
  }

  const erionInfo = getErionInfo(year);

  return {
    year,
    month: MONTHS[month],
    monthIndex: month,
    day: isEvriom ? 0 : dayOfMonth,
    dayOfYear,
    weekday,
    weekdayIndex,
    isEvriom,
    evriomType,
    isLeapYear: isLeap,
    time: {
      tems: String(tems).padStart(2, "0"),
      minuts: String(minuts).padStart(2, "0"),
      seguns: String(seguns).padStart(2, "0"),
      formatted: `${String(tems).padStart(2, "0")}:${String(minuts).padStart(
        2,
        "0"
      )}:${String(seguns).padStart(2, "0")}`,
    },
    season: {
      name: SEASONS[seasonIndex].name,
      krimlog: SEASONS[seasonIndex].krimlog,
      dayInSeason,
      totalDays: SEASONS[seasonIndex].duration,
    },
    erion: erionInfo,
    formatted: {
      short: isEvriom
        ? `Evriom de ${evriomType}, ${year} ${erionInfo.suffix}`
        : `${dayOfMonth} ${MONTHS[month]}, ${year} ${erionInfo.suffix}`,
      long: isEvriom
        ? `Evriom de ${evriomType}, ${year} ${erionInfo.suffix} (Dia Intercalar)`
        : `${WEEKDAYS[weekdayIndex]}, ${dayOfMonth} ${MONTHS[month]}, ${year} ${erionInfo.suffix}`,
      numeric: `${year}-${String(month + 1).padStart(2, "0")}-${String(
        dayOfMonth
      ).padStart(2, "0")}`,
    },
  };
}

function calculateNextEvriom(timestampMs) {
  let currentDate = calculateHadabDate(timestampMs);
  let searchYear = currentDate.year;

  if (currentDate.isEvriom) {
    return {
      isNow: true,
      date: currentDate,
    };
  }

  const yearStartMs =
    GREGORIAN_EPOCH_MS + getYearStartDay(searchYear) * HADAB_DAY_SECONDS * 1000;
  const nextEvriomMs = yearStartMs + HADAB_DAY_SECONDS * 1000;

  if (timestampMs < nextEvriomMs) {
    return {
      isNow: false,
      nextDate: calculateHadabDate(nextEvriomMs),
      daysUntil: Math.floor(
        (nextEvriomMs - timestampMs) / (HADAB_DAY_SECONDS * 1000)
      ),
    };
  }

  searchYear++;
  const nextYearStartMs =
    GREGORIAN_EPOCH_MS + getYearStartDay(searchYear) * HADAB_DAY_SECONDS * 1000;

  return {
    isNow: false,
    nextDate: calculateHadabDate(nextYearStartMs),
    daysUntil: Math.floor(
      (nextYearStartMs - timestampMs) / (HADAB_DAY_SECONDS * 1000)
    ),
  };
}

function hadabDateToTimestamp(
  year,
  month,
  day,
  tems = 0,
  minuts = 0,
  seguns = 0
) {
  const daysSinceEpoch = getYearStartDay(year);
  const monthIndex = MONTHS.indexOf(month);

  if (monthIndex === -1) {
    throw new Error(`Invalid month: ${month}`);
  }

  const dayOfYear = monthIndex * 28 + day;
  const totalDays = daysSinceEpoch + dayOfYear;

  const dayFraction =
    tems / HADAB_TEMS_PER_DAY +
    minuts / (HADAB_TEMS_PER_DAY * HADAB_MINUTS_PER_TEM) +
    seguns /
      (HADAB_TEMS_PER_DAY * HADAB_MINUTS_PER_TEM * HADAB_SEGUNS_PER_MINUT);

  const earthSeconds = hadabDaysToEarthSeconds(totalDays + dayFraction);
  return GREGORIAN_EPOCH_MS + earthSeconds * 1000;
}

function getYearMetadata(year, specialYears = {}) {
  const isLeap = isLeapYear(year);
  const erionInfo = getErionInfo(year);
  const special = specialYears[year] || null;

  return {
    year,
    isLeapYear: isLeap,
    totalDays: getDaysInYear(year),
    erion: erionInfo,
    special,
    months: MONTHS.map((name, index) => ({
      name,
      index,
      days: 28,
      startDay: index * 28 + 2,
    })),
    evrioms: isLeap
      ? [
          { type: "Helkatom", day: 1 },
          { type: "Biris", day: 366 },
        ]
      : [{ type: "Helkatom", day: 1 }],
  };
}

function convertEarthToHadab(earthTimestampMs) {
  return calculateHadabDate(earthTimestampMs);
}

function convertHadabToEarth(
  year,
  month,
  day,
  tems = 0,
  minuts = 0,
  seguns = 0
) {
  return hadabDateToTimestamp(year, month, day, tems, minuts, seguns);
}

function getCurrentHadabTime() {
  return calculateHadabDate(Date.now());
}

function getTimeUntilNextDay() {
  const now = Date.now();
  const currentDate = calculateHadabDate(now);
  const nextDayTimestamp = hadabDateToTimestamp(
    currentDate.year,
    currentDate.month,
    currentDate.day + 1,
    0,
    0,
    0
  );

  return {
    milliseconds: nextDayTimestamp - now,
    seconds: (nextDayTimestamp - now) / 1000,
    hadabTime: calculateHadabDate(nextDayTimestamp),
  };
}

export {
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
  SEASONS,
  ERIONS,
};

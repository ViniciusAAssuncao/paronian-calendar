import {
  calculateHadabDate,
  isLeapYear,
  hadabDateToTimestamp,
  convertEarthToHadab,
  convertHadabToEarth,
  MONTHS
} from '../src/calendar-core.js';

function assert(condition, message) {
  if (!condition) {
    throw new Error(`Test failed: ${message}`);
  }
}

function testLeapYearRules() {
  console.log('Testing leap year rules...');
  
  assert(isLeapYear(2024) === true, '2024 should be leap (divisible by 4)');
  assert(isLeapYear(2025) === false, '2025 should not be leap');
  assert(isLeapYear(2128) === false, '2128 should not be leap (divisible by 128)');
  assert(isLeapYear(2132) === true, '2132 should be leap (divisible by 4, not by 128)');
  assert(isLeapYear(2000) === true, '2000 should be leap');
  
  console.log('✓ Leap year rules correct');
}

function testDateConversion() {
  console.log('Testing date conversions...');
  
  const epoch = new Date('2000-01-01T12:00:00Z').getTime();
  const hadabEpoch = calculateHadabDate(epoch);
  
  assert(hadabEpoch.year === 2000, 'Epoch year should be 2000');
  assert(hadabEpoch.day === 0 || hadabEpoch.day === 1, 'Epoch day should be at start');
  
  console.log('✓ Date conversion working');
}

function testRoundTrip() {
  console.log('Testing round-trip conversion...');
  
  const originalTimestamp = Date.now();
  const hadabDate = convertEarthToHadab(originalTimestamp);
  
  if (!hadabDate.isEvriom) {
    const backToEarth = convertHadabToEarth(
      hadabDate.year,
      hadabDate.month,
      hadabDate.day,
      parseInt(hadabDate.time.tems),
      parseInt(hadabDate.time.minuts),
      parseInt(hadabDate.time.seguns)
    );
    
    const diff = Math.abs(backToEarth - originalTimestamp);
    const tolerance = 1000;
    
    assert(diff < tolerance, `Round-trip should be accurate (diff: ${diff}ms)`);
  }
  
  console.log('✓ Round-trip conversion accurate');
}

function testMonthStructure() {
  console.log('Testing month structure...');
  
  assert(MONTHS.length === 13, 'Should have 13 months');
  assert(MONTHS[0] === 'Helkatom', 'First month should be Helkatom');
  assert(MONTHS[12] === 'Biris', 'Last month should be Biris');
  
  console.log('✓ Month structure correct');
}

function testEvriomDetection() {
  console.log('Testing Evriom detection...');
  
  const year2024Start = new Date('2000-01-01T12:00:00Z').getTime();
  const hadabAtStart = calculateHadabDate(year2024Start);
  
  assert(hadabAtStart.isEvriom === true, 'Start of year should be Evriom');
  assert(hadabAtStart.evriomType === 'Helkatom', 'Should be Evriom de Helkatom');
  
  console.log('✓ Evriom detection working');
}

function testTimeAccuracy() {
  console.log('Testing time accuracy...');
  
  const now = Date.now();
  const hadabNow = calculateHadabDate(now);
  
  assert(hadabNow.time.tems !== undefined, 'Should have Tems');
  assert(hadabNow.time.minuts !== undefined, 'Should have Minuts');
  assert(hadabNow.time.seguns !== undefined, 'Should have Seguns');
  
  const tems = parseInt(hadabNow.time.tems);
  const minuts = parseInt(hadabNow.time.minuts);
  const seguns = parseInt(hadabNow.time.seguns);
  
  assert(tems >= 0 && tems < 26, `Tems should be 0-25 (got ${tems})`);
  assert(minuts >= 0 && minuts < 100, `Minuts should be 0-99 (got ${minuts})`);
  assert(seguns >= 0 && seguns < 100, `Seguns should be 0-99 (got ${seguns})`);
  
  console.log('✓ Time accuracy validated');
}

function testSeasonMapping() {
  console.log('Testing season mapping...');
  
  const now = Date.now();
  const hadabNow = calculateHadabDate(now);
  
  assert(hadabNow.season !== undefined, 'Should have season info');
  assert(hadabNow.season.name !== undefined, 'Should have season name');
  assert(hadabNow.season.dayInSeason > 0, 'Should have day in season');
  
  console.log('✓ Season mapping correct');
}

function testErionInfo() {
  console.log('Testing Erion information...');
  
  const now = Date.now();
  const hadabNow = calculateHadabDate(now);
  
  assert(hadabNow.erion !== undefined, 'Should have Erion info');
  assert(hadabNow.erion.suffix === 'AH', 'Current era should be AH');
  
  console.log('✓ Erion information correct');
}

function runAllTests() {
  console.log('=== Running Hadab Calendar Tests ===\n');
  
  try {
    testLeapYearRules();
    testDateConversion();
    testRoundTrip();
    testMonthStructure();
    testEvriomDetection();
    testTimeAccuracy();
    testSeasonMapping();
    testErionInfo();
    
    console.log('\n=== All tests passed! ===');
  } catch (error) {
    console.error('\n=== Test failed ===');
    console.error(error.message);
    process.exit(1);
  }
}

runAllTests();

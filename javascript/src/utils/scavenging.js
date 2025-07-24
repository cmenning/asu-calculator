// Scavenging calculation functions ported from python/utils.py

import { SCAVENGING, SYN_RATE, SCAV_ZONES } from '../config/gameConfig.js';

/**
 * Get the best scav zone for maximum med tech collection
 * @param {number} maxLevel - Maximum scav level available
 * @returns {Object} Best zone data with level, medTech, chance, expectedYield
 */
export function getBestScavZone(maxLevel) {
  let bestZone = SCAV_ZONES.get(1);
  let bestLevel = 1;
  
  for (const [level, zone] of SCAV_ZONES) {
    if (level <= maxLevel && zone.expectedYield > bestZone.expectedYield) {
      bestZone = zone;
      bestLevel = level;
    }
  }
  
  return { ...bestZone, level: bestLevel };
}

/**
 * Calculate expected med tech per scavenging run
 * @param {number} scavLevel - User's scav level
 * @returns {number} Expected med tech per run
 */
export function calculateExpectedMedTechPerRun(scavLevel = 1) {
  const bestZone = getBestScavZone(scavLevel);
  return SCAVENGING.max_units_per_run * bestZone.expectedYield;
}

/**
 * Convert hours to days
 * @param {number} hours - Hours to convert
 * @returns {number} Days
 */
export function hoursToDays(hours) {
  return hours / 24;
}

/**
 * Calculate scavenging time needed for given med tech amount
 * @param {number} medTechNeeded - Amount of med tech needed
 * @param {number} scavLevel - User's scav level
 * @returns {Object} Scav time data structure with hours and days for both syn states
 */
export function calculateScavTime(medTechNeeded, scavLevel = 1) {
  if (medTechNeeded <= 0) {
    return {
      hours_no_syn: 0,
      days_no_syn: 0,
      hours_with_syn: 0,
      days_with_syn: 0
    };
  }
  
  const expectedPerRun = calculateExpectedMedTechPerRun(scavLevel);
  const runsNeeded = medTechNeeded / expectedPerRun;
  
  const hoursNoSyn = runsNeeded * SCAVENGING.run_time_hours;
  const daysNoSyn = hoursToDays(hoursNoSyn);
  
  const hoursWithSyn = hoursNoSyn * SYN_RATE;
  const daysWithSyn = hoursToDays(hoursWithSyn);
  
  return {
    hours_no_syn: hoursNoSyn,
    days_no_syn: daysNoSyn,
    hours_with_syn: hoursWithSyn,
    days_with_syn: daysWithSyn
  };
}

// Scavenging calculation functions ported from python/utils.py

import { SCAVENGING, SYN_RATE } from '../config/gameConfig.js';

/**
 * Calculate expected med tech per scavenging run
 * @returns {number} Expected med tech per run
 */
export function calculateExpectedMedTechPerRun() {
  return (SCAVENGING.max_units_per_run * 
          SCAVENGING.med_tech_drop_chance * 
          SCAVENGING.med_tech_per_drop);
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
 * @returns {Object} Scav time data structure with hours and days for both syn states
 */
export function calculateScavTime(medTechNeeded) {
  if (medTechNeeded <= 0) {
    return {
      hours_no_syn: 0,
      days_no_syn: 0,
      hours_with_syn: 0,
      days_with_syn: 0
    };
  }
  
  const expectedPerRun = calculateExpectedMedTechPerRun();
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

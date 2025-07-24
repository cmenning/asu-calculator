// Main calculator logic that orchestrates all calculations
// Ported from python/asu_calculator.py calculateResultsData method

import { CONVERSIONS, CRAFTING_CHAIN, SYN_RATE } from '../config/gameConfig.js';
import { 
  calculateTotalRequirements, 
  calculateTechScrapEquivalentFromInventory,
  calculateEocEquivalentFromInventory 
} from './calculations.js';
import { calculateScavTime, calculateExpectedMedTechPerRun, hoursToDays } from './scavenging.js';
import { calculateRemainingBagsToCraft, calculateCraftableBagsFromResources } from './bagCrafting.js';
import { calculateDaysElapsed, estimateCompletionDate } from './dateUtils.js';

/**
 * Calculate collection rate based on start date and current inventory
 * @param {Object} inventory - Current inventory
 * @returns {Object|null} Collection rate data or null if no start date
 */
export function calculateCollectionRate(inventory) {
  if (!inventory.start_date) {
    return null;
  }
  
  const daysElapsed = calculateDaysElapsed(inventory.start_date);
  if (daysElapsed <= 0) {
    return null;
  }
  
  const techScrapCollected = calculateTechScrapEquivalentFromInventory(inventory);
  const dailyRate = techScrapCollected / daysElapsed;
  
  // Calculate scav runs per day
  const expectedPerRun = calculateExpectedMedTechPerRun(inventory.scav_level);
  const scavRunsPerDay = dailyRate / (expectedPerRun * CONVERSIONS.recycle_ratio);
  
  return {
    days_elapsed: daysElapsed,
    tech_scrap_collected: techScrapCollected,
    daily_rate: dailyRate,
    scav_runs_per_day: scavRunsPerDay
  };
}

/**
 * Calculate all results data without any display logic
 * @param {Object} inventory - Current inventory
 * @returns {Object} Complete results data structure
 */
export function calculateResultsData(inventory) {
  const totalReq = calculateTotalRequirements();
  const collectionRate = calculateCollectionRate(inventory);
  const eocProgress = calculateEocEquivalentFromInventory(inventory);
  
  // Remaining gathering requirements
  const remainingEocs = Math.max(0, totalReq.employee_office_cases - eocProgress);
  const remainingTechScraps = Math.max(0, totalReq.tech_scraps - calculateTechScrapEquivalentFromInventory(inventory));
  
  const currentMedTechTotal = (inventory.med_tech || 0) + 
                             (inventory.med_tech_clusters || 0) * CONVERSIONS.med_tech_per_cluster;
  const medTechNeededForRemaining = remainingTechScraps / CONVERSIONS.recycle_ratio;
  const remainingMtcNeeded = Math.max(0, medTechNeededForRemaining - currentMedTechTotal) / CONVERSIONS.med_tech_per_cluster;
  
  // Scav time for gathering requirements
  let scavTimeGathering = null;
  if (remainingMtcNeeded > 0) {
    const medTechNeeded = remainingMtcNeeded * CONVERSIONS.med_tech_per_cluster;
    scavTimeGathering = calculateScavTime(medTechNeeded, inventory.scav_level);
  }
  
  // Remaining bags to craft
  const remainingBags = calculateRemainingBagsToCraft(inventory);
  
  // Crafting time and BTC calculations
  const totalCraftingTimeMinutes = (
    remainingBags.old_pouches * CRAFTING_CHAIN.old_pouch.crafting_time_minutes +
    remainingBags.fanny_packs * CRAFTING_CHAIN.fanny_pack.crafting_time_minutes +
    remainingBags.explorer_backpacks * CRAFTING_CHAIN.explorer_backpack.crafting_time_minutes +
    remainingBags.employee_office_cases * CRAFTING_CHAIN.employee_office_case.crafting_time_minutes +
    remainingBags.asus * CRAFTING_CHAIN.asu.crafting_time_minutes
  );
  
  const totalCraftingBtc = (
    remainingBags.old_pouches * CRAFTING_CHAIN.old_pouch.bitcoin +
    remainingBags.fanny_packs * CRAFTING_CHAIN.fanny_pack.bitcoin +
    remainingBags.explorer_backpacks * CRAFTING_CHAIN.explorer_backpack.bitcoin +
    remainingBags.employee_office_cases * CRAFTING_CHAIN.employee_office_case.bitcoin +
    remainingBags.asus * CRAFTING_CHAIN.asu.bitcoin
  );
  
  const totalCraftingTimeHours = totalCraftingTimeMinutes / 60;
  const totalCraftingTimeDays = hoursToDays(totalCraftingTimeHours);
  const totalCraftingTimeHoursSyn = totalCraftingTimeHours * SYN_RATE;
  const totalCraftingTimeDaysSyn = hoursToDays(totalCraftingTimeHoursSyn);
  
  // Bag crafter service calculations
  const craftableResources = calculateCraftableBagsFromResources(inventory);
  const dorasStillNeeded = remainingBags.explorer_backpacks;
  const dorasYouCanCraft = craftableResources.total_craftable_doras;
  const dorasToBuy = Math.max(0, dorasStillNeeded - dorasYouCanCraft);
  
  const doraCost = inventory.dora_cost_mtc || 15;
  const mtcCostForDoras = dorasToBuy * doraCost;
  const btcForClustering = mtcCostForDoras * CONVERSIONS.cluster_cost_mtc;
  
  // Scav time for bag crafter service
  let scavTimeBagCrafter = null;
  if (mtcCostForDoras > 0) {
    const medTechForPurchase = mtcCostForDoras * CONVERSIONS.med_tech_per_cluster;
    scavTimeBagCrafter = calculateScavTime(medTechForPurchase, inventory.scav_level);
  }
  
  // After buying Doras calculations
  let afterBuyingDoras = null;
  if (dorasToBuy > 0) {
    const currentBtc = inventory.bitcoin || 0;
    const remainingEocsAfterPurchase = remainingBags.employee_office_cases;
    const remainingBtcAfterDoras = (remainingEocsAfterPurchase * CRAFTING_CHAIN.employee_office_case.bitcoin + 
                                   CRAFTING_CHAIN.asu.bitcoin - currentBtc + btcForClustering);
    
    const eocCraftingTime = remainingEocsAfterPurchase * CRAFTING_CHAIN.employee_office_case.crafting_time_minutes;
    const asuCraftingTime = CRAFTING_CHAIN.asu.crafting_time_minutes;
    const totalCraftingTimeHoursAfter = (eocCraftingTime + asuCraftingTime) / 60;
    const totalCraftingTimeHoursSynAfter = totalCraftingTimeHoursAfter * SYN_RATE;
    
    afterBuyingDoras = {
      btc_needed: remainingBtcAfterDoras,
      crafting_time_hours: totalCraftingTimeHoursAfter,
      crafting_time_hours_syn: totalCraftingTimeHoursSynAfter
    };
  }
  
  // Completion estimate
  let completionEstimate = null;
  if (collectionRate && collectionRate.daily_rate > 0) {
    const daysToCompletion = remainingTechScraps / collectionRate.daily_rate;
    const completionDate = estimateCompletionDate(remainingTechScraps, collectionRate.daily_rate);
    completionEstimate = {
      days_to_completion: daysToCompletion,
      completion_date: completionDate
    };
  }
  
  return {
    total_requirements: totalReq,
    collection_rate: collectionRate,
    eoc_progress: eocProgress,
    remaining_gathering: {
      tech_scraps: remainingTechScraps,
      mtc_needed: remainingMtcNeeded,
      scav_time: scavTimeGathering
    },
    remaining_bags: remainingBags,
    crafting_totals: {
      time_hours: totalCraftingTimeHours,
      time_days: totalCraftingTimeDays,
      time_hours_syn: totalCraftingTimeHoursSyn,
      time_days_syn: totalCraftingTimeDaysSyn,
      btc: totalCraftingBtc
    },
    bag_crafter_service: {
      doras_still_needed: dorasStillNeeded,
      ops_from_tech_scraps: craftableResources.ops_from_tech_scraps,
      doras_you_can_craft: dorasYouCanCraft,
      doras_to_buy: dorasToBuy,
      mtc_cost: mtcCostForDoras,
      btc_for_clustering: btcForClustering,
      scav_time: scavTimeBagCrafter,
      after_buying_doras: afterBuyingDoras
    },
    completion_estimate: completionEstimate
  };
}

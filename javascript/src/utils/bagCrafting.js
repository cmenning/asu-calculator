// Bag crafting chain traversal functions ported from python/utils.py

import { CRAFTING_CHAIN, CONVERSIONS } from '../config/gameConfig.js';

/**
 * Calculate remaining bags needed working backwards from final requirements
 * @param {Object} inventory - Current inventory
 * @param {number} targetAsus - Target number of ASUs (default: 1)
 * @returns {Object} Remaining counts for each bag type
 */
export function calculateRemainingBagsToCraft(inventory, targetAsus = 1) {
  // Work backwards from final requirements
  const remainingAsus = Math.max(0, targetAsus - (inventory.asus || 0));
  const totalEocsNeeded = remainingAsus * CRAFTING_CHAIN.asu.employee_office_cases;
  const remainingEocs = Math.max(0, totalEocsNeeded - (inventory.employee_office_cases || 0));
  
  // Each EOC needs 20 Doras
  const dorasNeededForEocs = remainingEocs * CRAFTING_CHAIN.employee_office_case.explorer_backpacks;
  const remainingDoras = Math.max(0, dorasNeededForEocs - (inventory.explorer_backpacks || 0));
  
  // Each Dora needs 15 Fannys
  const fannysNeededForDoras = remainingDoras * CRAFTING_CHAIN.explorer_backpack.fanny_packs;
  const remainingFannys = Math.max(0, fannysNeededForDoras - (inventory.fanny_packs || 0));
  
  // Each Fanny needs 10 OPs
  const opsNeededForFannys = remainingFannys * CRAFTING_CHAIN.fanny_pack.old_pouches;
  const remainingOps = Math.max(0, opsNeededForFannys - (inventory.old_pouches || 0));
  
  return {
    old_pouches: remainingOps,
    fanny_packs: remainingFannys,
    explorer_backpacks: remainingDoras,
    employee_office_cases: remainingEocs,
    asus: remainingAsus
  };
}

/**
 * Calculate how many bags can be crafted from available tech scraps and existing bags
 * @param {Object} inventory - Current inventory
 * @returns {Object} Craftable counts for each bag type
 */
export function calculateCraftableBagsFromResources(inventory) {
  // Calculate how many OPs can be crafted from available tech scraps
  const currentTechScraps = inventory.tech_scraps || 0;
  const currentTsc = inventory.tech_scrap_clusters || 0;
  const totalTechScraps = currentTechScraps + (currentTsc * CONVERSIONS.tech_scrap_per_cluster);
  
  const techScrapsPerOp = CRAFTING_CHAIN.old_pouch.tech_scraps;
  const craftableOpsFromTechScraps = Math.floor(totalTechScraps / techScrapsPerOp);
  
  // Calculate craftable bags from existing inventory
  const currentOps = inventory.old_pouches || 0;
  const currentFannys = inventory.fanny_packs || 0;
  const currentDoras = inventory.explorer_backpacks || 0;
  
  // Total OPs available (current + craftable)
  const totalAvailableOps = currentOps + craftableOpsFromTechScraps;
  
  // How many Fannys can be made from total available OPs
  const opsPerFanny = CRAFTING_CHAIN.fanny_pack.old_pouches;
  const additionalFannysFromOps = Math.floor(totalAvailableOps / opsPerFanny);
  const totalAvailableFannys = currentFannys + additionalFannysFromOps;
  
  // How many Doras can be made from total available Fannys
  const fannysPerDora = CRAFTING_CHAIN.explorer_backpack.fanny_packs;
  const craftableDoras = Math.floor(totalAvailableFannys / fannysPerDora);
  
  return {
    ops_from_tech_scraps: craftableOpsFromTechScraps,
    total_craftable_doras: craftableDoras,
    total_available_ops: totalAvailableOps,
    total_available_fannys: totalAvailableFannys
  };
}

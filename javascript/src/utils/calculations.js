// Core calculation functions ported from python/utils.py

import { CRAFTING_CHAIN, CONVERSIONS } from '../config/gameConfig.js';

/**
 * Calculate total requirements for crafting one ASU
 * @returns {Object} Total requirements object
 */
export function calculateTotalRequirements() {
  // Calculate total bags needed for the complete chain
  const oldPouches = (CRAFTING_CHAIN.fanny_pack.old_pouches * 
                     CRAFTING_CHAIN.explorer_backpack.fanny_packs * 
                     CRAFTING_CHAIN.employee_office_case.explorer_backpacks * 
                     CRAFTING_CHAIN.asu.employee_office_cases);
  
  const fannyPacks = (CRAFTING_CHAIN.explorer_backpack.fanny_packs * 
                     CRAFTING_CHAIN.employee_office_case.explorer_backpacks * 
                     CRAFTING_CHAIN.asu.employee_office_cases);
  
  const explorerBackpacks = (CRAFTING_CHAIN.employee_office_case.explorer_backpacks * 
                            CRAFTING_CHAIN.asu.employee_office_cases);
  
  const employeeOfficeCases = CRAFTING_CHAIN.asu.employee_office_cases;
  
  // Calculate total tech scraps needed
  const techScraps = oldPouches * CRAFTING_CHAIN.old_pouch.tech_scraps;
  
  // Calculate total bitcoin needed for all crafting operations
  const bitcoin = (
    // Old Pouches
    oldPouches * CRAFTING_CHAIN.old_pouch.bitcoin +
    // Fanny Packs  
    fannyPacks * CRAFTING_CHAIN.fanny_pack.bitcoin +
    // Explorer Backpacks
    explorerBackpacks * CRAFTING_CHAIN.explorer_backpack.bitcoin +
    // Employee Office Cases
    employeeOfficeCases * CRAFTING_CHAIN.employee_office_case.bitcoin +
    // Final ASU
    CRAFTING_CHAIN.asu.bitcoin
  );
  
  return {
    old_pouches: oldPouches,
    fanny_packs: fannyPacks,
    explorer_backpacks: explorerBackpacks,
    employee_office_cases: employeeOfficeCases,
    tech_scraps: techScraps,
    bitcoin: bitcoin
  };
}

/**
 * Calculate tech scrap equivalent from bag inventory only
 * @param {Object} inventory - Inventory object
 * @returns {number} Tech scrap equivalent from bags
 */
export function calculateTechScrapEquivalentFromBags(inventory) {
  if (!inventory || typeof inventory !== 'object') {
    return 0;
  }
  
  const safeNumber = (value) => {
    const num = Number(value);
    return isFinite(num) && num >= 0 ? num : 0;
  };
  
  let total = 0;
  
  // Old Pouches
  total += safeNumber(inventory.old_pouches) * CRAFTING_CHAIN.old_pouch.tech_scraps;
  
  // Fanny Packs
  total += safeNumber(inventory.fanny_packs) * 
           CRAFTING_CHAIN.fanny_pack.old_pouches * 
           CRAFTING_CHAIN.old_pouch.tech_scraps;
  
  // Explorer Backpacks
  total += safeNumber(inventory.explorer_backpacks) * 
           CRAFTING_CHAIN.explorer_backpack.fanny_packs * 
           CRAFTING_CHAIN.fanny_pack.old_pouches * 
           CRAFTING_CHAIN.old_pouch.tech_scraps;
  
  // Employee Office Cases
  total += safeNumber(inventory.employee_office_cases) * 
           CRAFTING_CHAIN.employee_office_case.explorer_backpacks * 
           CRAFTING_CHAIN.explorer_backpack.fanny_packs * 
           CRAFTING_CHAIN.fanny_pack.old_pouches * 
           CRAFTING_CHAIN.old_pouch.tech_scraps;
  
  return isFinite(total) ? total : 0;
}

/**
 * Calculate total tech scrap equivalent from inventory items
 * @param {Object} inventory - Inventory object
 * @returns {number} Total tech scrap equivalent
 */
export function calculateTechScrapEquivalentFromInventory(inventory) {
  if (!inventory || typeof inventory !== 'object') {
    return 0;
  }
  
  const safeNumber = (value) => {
    const num = Number(value);
    return isFinite(num) && num >= 0 ? num : 0;
  };
  
  let total = safeNumber(inventory.tech_scraps);
  
  // Add clustered tech scraps
  total += safeNumber(inventory.tech_scrap_clusters) * CONVERSIONS.tech_scrap_per_cluster;
  
  // Add med tech (via recycling)
  const medTechTotal = safeNumber(inventory.med_tech) + 
                       safeNumber(inventory.med_tech_clusters) * CONVERSIONS.med_tech_per_cluster;
  total += medTechTotal * CONVERSIONS.recycle_ratio;
  
  // Add bags converted to tech scrap equivalent
  total += calculateTechScrapEquivalentFromBags(inventory);
  
  const result = Math.floor(total);
  return isFinite(result) ? result : 0;
}

/**
 * Calculate current progress in EOC equivalents from inventory
 * @param {Object} inventory - Inventory object
 * @returns {number} EOC equivalent progress
 */
export function calculateEocEquivalentFromInventory(inventory) {
  let eocEquivalent = 0;
  
  // Convert existing bags to EOC fractions
  eocEquivalent += inventory.employee_office_cases || 0;
  
  // Explorer backpacks
  eocEquivalent += (inventory.explorer_backpacks || 0) / 
                   CRAFTING_CHAIN.employee_office_case.explorer_backpacks;
  
  // Fanny packs
  eocEquivalent += (inventory.fanny_packs || 0) / 
                   (CRAFTING_CHAIN.employee_office_case.explorer_backpacks * 
                    CRAFTING_CHAIN.explorer_backpack.fanny_packs);
  
  // Old pouches
  eocEquivalent += (inventory.old_pouches || 0) / 
                   (CRAFTING_CHAIN.employee_office_case.explorer_backpacks * 
                    CRAFTING_CHAIN.explorer_backpack.fanny_packs * 
                    CRAFTING_CHAIN.fanny_pack.old_pouches);
  
  return eocEquivalent;
}

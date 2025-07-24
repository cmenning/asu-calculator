// Storage utilities for inventory persistence using browser localStorage

export const DEFAULT_INVENTORY = {
  tech_scraps: 0,
  tech_scrap_clusters: 0,
  med_tech: 0,
  med_tech_clusters: 0,
  bitcoin: 0,
  old_pouches: 0,
  fanny_packs: 0,
  explorer_backpacks: 0,
  employee_office_cases: 0,
  asus: 0,
  scav_level: 1,
  dora_cost_mtc: 20,
  start_date: new Date().toISOString().split('T')[0]
};

/**
 * Load inventory from browser localStorage
 * @returns {Object} Inventory object
 */
export function loadInventory() {
  try {
    const saved = localStorage.getItem('asu_inventory');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Ensure all required fields exist with defaults
      return { ...DEFAULT_INVENTORY, ...parsed };
    }
  } catch (error) {
    console.warn('Failed to load inventory from localStorage:', error);
  }
  return { ...DEFAULT_INVENTORY };
}

/**
 * Save inventory to browser localStorage
 * @param {Object} inventory - Inventory object to save
 */
export function saveInventory(inventory) {
  try {
    localStorage.setItem('asu_inventory', JSON.stringify(inventory));
  } catch (error) {
    console.warn('Failed to save inventory to localStorage:', error);
  }
}

/**
 * Clear inventory from browser localStorage
 */
export function clearInventory() {
  try {
    localStorage.removeItem('asu_inventory');
  } catch (error) {
    console.warn('Failed to clear inventory from localStorage:', error);
  }
}

/**
 * Validate inventory object
 * @param {Object} inventory - Inventory to validate
 * @returns {Object} Validated inventory with corrected values
 */
export function validateInventory(inventory) {
  const validated = { ...DEFAULT_INVENTORY };
  
  // Validate numeric fields
  const numericFields = [
    'tech_scraps', 'tech_scrap_clusters', 'med_tech', 'med_tech_clusters',
    'bitcoin', 'old_pouches', 'fanny_packs', 'explorer_backpacks',
    'employee_office_cases', 'asus', 'scav_level', 'dora_cost_mtc'
  ];
  
  numericFields.forEach(field => {
    const value = Number(inventory[field]);
    if (field === 'dora_cost_mtc') {
      validated[field] = isNaN(value) || value <= 0 ? 20 : value;
    } else if (field === 'scav_level') {
      validated[field] = isNaN(value) || value < 1 ? 1 : Math.min(1000, Math.floor(value));
    } else {
      validated[field] = isNaN(value) || value < 0 ? 0 : Math.floor(value);
    }
  });
  
  // Validate start_date
  if (inventory.start_date && !isNaN(Date.parse(inventory.start_date))) {
    validated.start_date = inventory.start_date;
  }
  
  return validated;
}

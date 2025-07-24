// Tests to validate JavaScript calculations match Python implementation

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { calculateTotalRequirements, calculateTechScrapEquivalentFromInventory } from '../utils/calculations.js';
import { calculateCollectionRate } from '../utils/calculator.js';
import { calculateScavTime, calculateExpectedMedTechPerRun } from '../utils/scavenging.js';
import { calculateRemainingBagsToCraft } from '../utils/bagCrafting.js';
import { calculateResultsData } from '../utils/calculator.js';
import { saveInventory, loadInventory } from '../utils/storage.js';
import { calculateDaysElapsed, estimateCompletionDate, formatDate } from '../utils/dateUtils.js';
import { CRAFTING_CHAIN, CONVERSIONS, SCAVENGING, SYN_RATE } from '../config/gameConfig.js';

describe('Core Calculations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it('should calculate total ASU requirements correctly', () => {
    const requirements = calculateTotalRequirements();
    
    // These values should match the Python implementation
    expect(requirements.tech_scraps).toBe(7500000);
    expect(requirements.bitcoin).toBe(79250000);
    expect(requirements.employee_office_cases).toBe(25);
    expect(requirements.old_pouches).toBe(75000);
    expect(requirements.fanny_packs).toBe(7500);
    expect(requirements.explorer_backpacks).toBe(500);
  });

  it('should calculate tech scrap equivalent correctly', () => {
    const testInventory = {
      tech_scraps: 1000,
      tech_scrap_clusters: 2,
      med_tech: 500,
      med_tech_clusters: 1,
      old_pouches: 10,
      fanny_packs: 1,
      explorer_backpacks: 0,
      employee_office_cases: 0
    };
    
    const equivalent = calculateTechScrapEquivalentFromInventory(testInventory);
    
    // Should include: 1000 + (2*1000) + ((500+1000)*1.2) + (10*100) + (1*10*100)
    // = 1000 + 2000 + 1800 + 1000 + 1000 = 6800
    expect(equivalent).toBe(6800);
  });

  it('should calculate expected med tech per run correctly', () => {
    const expected = calculateExpectedMedTechPerRun(197); // Level 197 matches old hardcoded values
    
    // 12 * 41.34 ≈ 496.1
    expect(expected).toBeCloseTo(496.1, 1);
  });

  it('should calculate scav time correctly', () => {
    const scavTime = calculateScavTime(1000, 197);
    
    // Should calculate based on expected med tech per run and 3 hour runs
    expect(scavTime.hours_no_syn).toBeGreaterThan(0);
    expect(scavTime.hours_with_syn).toBe(scavTime.hours_no_syn * 0.2);
    expect(scavTime.days_no_syn).toBe(scavTime.hours_no_syn / 24);
    expect(scavTime.days_with_syn).toBe(scavTime.hours_with_syn / 24);
  });

  it('should calculate remaining bags correctly', () => {
    const testInventory = {
      old_pouches: 1000,
      fanny_packs: 100,
      explorer_backpacks: 10,
      employee_office_cases: 1,
      asus: 0
    };
    
    const remaining = calculateRemainingBagsToCraft(testInventory);
    
    // Should work backwards from 1 ASU = 25 EOCs
    expect(remaining.asus).toBe(1);
    expect(remaining.employee_office_cases).toBe(24); // 25 - 1
    expect(remaining.explorer_backpacks).toBeGreaterThan(0);
  });
});

describe('Bag Crafter Service', () => {
  it('should calculate remaining bags correctly', () => {
    const testInventory = {
      tech_scraps: 1000,
      old_pouches: 100,
      fanny_packs: 10,
      explorer_backpacks: 5
    };
    
    const remaining = calculateRemainingBagsToCraft(testInventory);
    
    expect(remaining.asus).toBe(1);
    expect(remaining.explorer_backpacks).toBeGreaterThan(0);
  });
});

describe('Collection Rate Tracking', () => {
  it('should calculate collection rate correctly', () => {
    const testInventory = {
      tech_scraps: 1000,
      med_tech: 2000,
      scav_level: 197,
      start_date: '2024-01-01'
    };
    
    // Mock current date to be 10 days later
    const mockDate = new Date('2024-01-11');
    vi.setSystemTime(mockDate);
    
    const rate = calculateCollectionRate(testInventory);
    
    expect(rate.days_elapsed).toBe(10);
    expect(rate.daily_rate).toBeGreaterThan(0);
    
    vi.useRealTimers();
  });

  it('should handle missing start date', () => {
    const testInventory = {
      tech_scraps: 1000
    };
    
    const rate = calculateCollectionRate(testInventory);
    
    expect(rate).toBeNull();
  });
});

describe('Date Utilities', () => {
  it('should calculate days elapsed correctly', () => {
    const startDate = '2024-01-01';
    const mockDate = new Date('2024-01-11');
    vi.setSystemTime(mockDate);
    
    const elapsed = calculateDaysElapsed(startDate);
    
    expect(elapsed).toBe(10);
    
    vi.useRealTimers();
  });

  it('should estimate completion date', () => {
    const completion = estimateCompletionDate(1000, 100);
    
    expect(completion).toBeInstanceOf(Date);
  });

  it('should format dates correctly', () => {
    const testDate = new Date('2024-01-01T12:00:00');
    const formatted = formatDate(testDate);
    
    expect(formatted).toContain('2024');
    expect(formatted).toContain('01');
  });
});

describe('Storage Operations', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should save and load inventory', () => {
    const testInventory = {
      tech_scraps: 1000,
      med_tech: 500
    };
    
    saveInventory(testInventory);
    const loaded = loadInventory();
    
    expect(loaded.tech_scraps).toBe(1000);
    expect(loaded.med_tech).toBe(500);
  });

  it('should return default inventory when none exists', () => {
    const loaded = loadInventory();
    
    expect(loaded.tech_scraps).toBe(0);
    expect(loaded.asus).toBe(0);
  });
});

describe('Configuration Validation', () => {
  it('should have all required bag types in crafting chain', () => {
    const requiredBags = ['old_pouch', 'fanny_pack', 'explorer_backpack', 'employee_office_case', 'asu'];
    
    requiredBags.forEach(bag => {
      expect(CRAFTING_CHAIN[bag]).toBeDefined();
      expect(CRAFTING_CHAIN[bag].bitcoin).toBeGreaterThan(0);
      expect(CRAFTING_CHAIN[bag].crafting_time_minutes).toBeGreaterThan(0);
    });
  });

  it('should have positive conversion values', () => {
    Object.entries(CONVERSIONS).forEach(([key, value]) => {
      expect(value).toBeGreaterThan(0);
    });
  });

  it('should have valid scavenging settings', () => {
    expect(SCAVENGING.max_units_per_run).toBeGreaterThan(0);
    expect(SCAVENGING.run_time_hours).toBeGreaterThan(0);
  });
});

describe('Full Integration', () => {
  it('should calculate complete results without errors', () => {
    const testInventory = {
      tech_scraps: 2562,
      tech_scrap_clusters: 0,
      med_tech: 2630,
      med_tech_clusters: 185,
      bitcoin: 50000,
      old_pouches: 5028,
      fanny_packs: 1003,
      explorer_backpacks: 98,
      employee_office_cases: 1,
      asus: 0,
      scav_level: 197,
      start_date: '2024-01-01'
    };
    
    expect(() => calculateResultsData(testInventory)).not.toThrow();
    
    const results = calculateResultsData(testInventory);
    
    expect(results.total_requirements).toBeDefined();
    expect(results.eoc_progress).toBeGreaterThan(0);
    expect(results.remaining_gathering).toBeDefined();
    expect(results.remaining_bags).toBeDefined();
    expect(results.bag_crafter_service).toBeDefined();
  });

  it('should handle inventory with completed ASU', () => {
    const completedInventory = {
      asus: 1,
      scav_level: 1,
      start_date: '2024-01-01'
    };
    
    const results = calculateResultsData(completedInventory);
    
    expect(results.eoc_progress).toBe(25); // Complete
    expect(results.remaining_gathering.tech_scraps).toBe(0);
  });
});

describe('Edge Cases', () => {
  it('should handle empty inventory', () => {
    const emptyInventory = {};
    
    expect(() => calculateTechScrapEquivalentFromInventory(emptyInventory)).not.toThrow();
    expect(calculateTechScrapEquivalentFromInventory(emptyInventory)).toBe(0);
  });

  it('should handle zero med tech needed for scav time', () => {
    const scavTime = calculateScavTime(0, 1);
    
    expect(scavTime.hours_no_syn).toBe(0);
    expect(scavTime.hours_with_syn).toBe(0);
    expect(scavTime.days_no_syn).toBe(0);
    expect(scavTime.days_with_syn).toBe(0);
  });

  it('should handle negative values gracefully', () => {
    const testInventory = {
      tech_scraps: -100,
      old_pouches: -10
    };
    
    const equivalent = calculateTechScrapEquivalentFromInventory(testInventory);
    expect(equivalent).toBe(0);
  });

  it('should handle invalid dates', () => {
    expect(() => calculateDaysElapsed('invalid-date')).not.toThrow();
    expect(calculateDaysElapsed('invalid-date')).toBe(0);
  });

  it('should handle corrupted localStorage', () => {
    localStorage.setItem('asu_inventory', 'invalid-json');
    
    expect(() => loadInventory()).not.toThrow();
    const loaded = loadInventory();
    expect(loaded.tech_scraps).toBe(0); // Should return default
  });
});

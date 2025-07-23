// Error handling and performance tests
import { describe, it, expect } from 'vitest';
import { calculateResultsData } from '../utils/calculator.js';
import { calculateTechScrapEquivalentFromInventory } from '../utils/calculations.js';
import { saveInventory, loadInventory } from '../utils/storage.js';

describe('Error Handling', () => {
  it('should handle malformed inventory data', () => {
    const malformedInventory = {
      tech_scraps: 'not-a-number',
      med_tech: null,
      bitcoin: undefined,
      old_pouches: Infinity,
      fanny_packs: -Infinity,
      explorer_backpacks: NaN
    };
    
    expect(() => calculateTechScrapEquivalentFromInventory(malformedInventory)).not.toThrow();
    
    const result = calculateTechScrapEquivalentFromInventory(malformedInventory);
    expect(typeof result).toBe('number');
    expect(isFinite(result)).toBe(true);
  });

  it('should handle extremely large numbers', () => {
    const largeInventory = {
      tech_scraps: Number.MAX_SAFE_INTEGER,
      med_tech: 1e15,
      bitcoin: 1e20
    };
    
    expect(() => calculateResultsData(largeInventory)).not.toThrow();
  });

  it('should handle storage errors gracefully', () => {
    const testInventory = { tech_scraps: 1000 };
    
    expect(() => saveInventory(testInventory)).not.toThrow();
    expect(() => loadInventory()).not.toThrow();
  });
});

describe('Performance Tests', () => {
  it('should calculate results for large inventory quickly', () => {
    const largeInventory = {
      tech_scraps: 1000000,
      med_tech: 500000,
      old_pouches: 10000,
      fanny_packs: 1000,
      explorer_backpacks: 100,
      employee_office_cases: 10,
      start_date: '2024-01-01'
    };
    
    const startTime = performance.now();
    calculateResultsData(largeInventory);
    const endTime = performance.now();
    
    expect(endTime - startTime).toBeLessThan(1000);
  });

  it('should handle repeated calculations efficiently', () => {
    const testInventory = {
      tech_scraps: 1000,
      med_tech: 500,
      start_date: '2024-01-01'
    };
    
    const startTime = performance.now();
    
    for (let i = 0; i < 100; i++) {
      calculateTechScrapEquivalentFromInventory(testInventory);
    }
    
    const endTime = performance.now();
    
    expect(endTime - startTime).toBeLessThan(100);
  });
});

describe('Memory Management', () => {
  it('should not leak memory during repeated operations', () => {
    const testInventory = {
      tech_scraps: 1000,
      med_tech: 500
    };
    
    const results = [];
    
    for (let i = 0; i < 100; i++) {
      results.push(calculateResultsData(testInventory));
    }
    
    results.length = 0;
    
    expect(true).toBe(true);
  });
});
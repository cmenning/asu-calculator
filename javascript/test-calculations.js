// Simple test script to verify our JavaScript calculations work
// Run with: node test-calculations.js

import { calculateTotalRequirements, calculateTechScrapEquivalentFromInventory } from './src/utils/calculations.js';
import { calculateScavTime } from './src/utils/scavenging.js';
import { calculateResultsData } from './src/utils/calculator.js';

console.log('🧪 Testing JavaScript ASU Calculator Implementation\n');

// Test 1: Total Requirements
console.log('📋 Testing Total Requirements:');
const totalReq = calculateTotalRequirements();
console.log(`Tech Scraps: ${totalReq.tech_scraps.toLocaleString()}`);
console.log(`Bitcoin: ${totalReq.bitcoin.toLocaleString()}`);
console.log(`Employee Office Cases: ${totalReq.employee_office_cases}`);
console.log('✅ Should match Python: 7,500,000 tech scraps, 79,250,000 bitcoin, 25 EOCs\n');

// Test 2: Tech Scrap Equivalent
console.log('🔢 Testing Tech Scrap Equivalent:');
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
  start_date: '2024-12-25'
};

const techScrapEquiv = calculateTechScrapEquivalentFromInventory(testInventory);
console.log(`Tech Scrap Equivalent: ${techScrapEquiv.toLocaleString()}`);
console.log('✅ Should match Python calculation\n');

// Test 3: Scav Time
console.log('⏰ Testing Scav Time Calculation:');
const scavTime = calculateScavTime(1000);
console.log(`Hours (no syn): ${scavTime.hours_no_syn.toFixed(1)}`);
console.log(`Hours (with syn): ${scavTime.hours_with_syn.toFixed(1)}`);
console.log(`Days (no syn): ${scavTime.days_no_syn.toFixed(1)}`);
console.log(`Days (with syn): ${scavTime.days_with_syn.toFixed(1)}`);
console.log('✅ Syn time should be 20% of no-syn time\n');

// Test 4: Full Results Calculation
console.log('🎯 Testing Full Results Calculation:');
try {
  const results = calculateResultsData(testInventory);
  console.log(`EOC Progress: ${results.eoc_progress.toFixed(1)} / ${results.total_requirements.employee_office_cases}`);
  console.log(`Remaining Tech Scraps: ${results.remaining_gathering.tech_scraps.toLocaleString()}`);
  
  if (results.collection_rate) {
    console.log(`Daily Rate: ${Math.round(results.collection_rate.daily_rate).toLocaleString()} tech scraps/day`);
  }
  
  if (results.completion_estimate) {
    console.log(`Days to Completion: ${Math.round(results.completion_estimate.days_to_completion)}`);
  }
  
  console.log('✅ Full calculation pipeline working\n');
} catch (error) {
  console.error('❌ Error in full calculation:', error.message);
}

console.log('🎉 JavaScript implementation test complete!');
console.log('Ready for React component integration.');

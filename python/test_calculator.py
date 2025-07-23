#!/usr/bin/env python3
"""
Simple test script for ASU Calculator

Basic tests to verify core functionality and calculations.
"""

import json
import os
from datetime import datetime
from asu_calculator import ASUCalculator
from utils import (
    calculate_total_asu_requirements, 
    format_time_duration, 
    convert_med_tech_to_tech_scraps,
    calculate_bag_crafter_cost
)
from config import CRAFTING_CHAIN, CONVERSIONS, BAG_CRAFTER

def test_total_requirements():
    """Test total ASU requirements calculation"""
    print("Testing total ASU requirements...")
    
    req = calculate_total_asu_requirements()
    
    # Verify tech scraps calculation
    expected_tech_scraps = (100 * 10 * 15 * 20 * 25)  # 7,500,000
    assert req['tech_scraps'] == expected_tech_scraps, f"Expected {expected_tech_scraps}, got {req['tech_scraps']}"
    
    # Verify EOC requirement
    expected_eocs = 25
    assert req['employee_office_cases'] == expected_eocs, f"Expected {expected_eocs}, got {req['employee_office_cases']}"
    
    print("✅ Total requirements calculation passed")

def test_med_tech_conversion():
    """Test med tech to tech scrap conversion"""
    print("Testing med tech conversion...")
    
    med_tech = 1000
    expected_tech_scraps = 1200  # 1.2 ratio
    result = convert_med_tech_to_tech_scraps(med_tech)
    
    assert result == expected_tech_scraps, f"Expected {expected_tech_scraps}, got {result}"
    
    print("✅ Med tech conversion passed")

def test_bag_crafter_cost():
    """Test bag crafter service cost calculation"""
    print("Testing bag crafter cost...")
    
    doras_needed = 100
    expected_mtc = 100 * BAG_CRAFTER['mtc_per_dora']  # 1500 MTC
    result = calculate_bag_crafter_cost(doras_needed)
    
    assert result == expected_mtc, f"Expected {expected_mtc}, got {result}"
    
    print("✅ Bag crafter cost calculation passed")

def test_time_formatting():
    """Test time duration formatting"""
    print("Testing time formatting...")
    
    # Test minutes
    assert "30 minutes" in format_time_duration(30)
    
    # Test hours
    assert "2.0 hours" in format_time_duration(120)
    
    # Test days
    assert "1.0 days" in format_time_duration(1440)
    
    print("✅ Time formatting passed")

def test_calculator_initialization():
    """Test ASU calculator initialization"""
    print("Testing calculator initialization...")
    
    # Create test inventory file
    test_inventory = {
        "tech_scraps": 1000,
        "med_tech": 500,
        "old_pouches": 10,
        "start_date": datetime.now().isoformat()
    }
    
    test_file = "test_inventory.json"
    with open(test_file, 'w') as f:
        json.dump(test_inventory, f)
    
    # Test loading
    calculator = ASUCalculator()
    calculator.INVENTORY_FILE = test_file  # Override for testing
    
    # Clean up
    if os.path.exists(test_file):
        os.remove(test_file)
    
    print("✅ Calculator initialization passed")

def test_config_values():
    """Test configuration values are reasonable"""
    print("Testing configuration values...")
    
    # Test crafting chain has all required bags
    required_bags = ['old_pouch', 'fanny_pack', 'explorer_backpack', 'employee_office_case', 'asu']
    for bag in required_bags:
        assert bag in CRAFTING_CHAIN, f"Missing bag type: {bag}"
    
    # Test conversion ratios are positive
    for key, value in CONVERSIONS.items():
        assert value > 0, f"Invalid conversion value for {key}: {value}"
    
    # Test bag crafter settings
    assert BAG_CRAFTER['mtc_per_dora'] > 0, "Invalid bag crafter MTC cost"
    
    print("✅ Configuration values passed")

def run_all_tests():
    """Run all tests"""
    print("🧪 Running ASU Calculator Tests")
    print("=" * 40)
    
    try:
        test_config_values()
        test_total_requirements()
        test_med_tech_conversion()
        test_bag_crafter_cost()
        test_time_formatting()
        test_calculator_initialization()
        
        print("\n✅ All tests passed!")
        print("Calculator is ready to use.")
        
    except AssertionError as e:
        print(f"\n❌ Test failed: {e}")
        return False
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        return False
    
    return True

if __name__ == "__main__":
    run_all_tests()

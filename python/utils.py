"""
Utility functions for ASU Calculator

Helper functions for calculations, formatting, and data processing.
"""

from datetime import datetime, timedelta
from config import CRAFTING_CHAIN, CONVERSIONS, SCAVENGING, BAG_CRAFTER, SYN_RATE

def format_time_duration(minutes):
    """Format minutes into human-readable duration"""
    if minutes < 60:
        return f"{minutes:.0f} minutes"
    elif minutes < 1440:  # Less than 24 hours
        hours = minutes / 60
        return f"{hours:.1f} hours"
    else:
        days = minutes / 1440
        return f"{days:.1f} days"

def format_number(number):
    """Format number with commas for readability"""
    return f"{number:,}"

def calculate_bag_requirements(bag_type, quantity):
    """Calculate total requirements for a specific bag type and quantity"""
    if bag_type not in CRAFTING_CHAIN:
        raise ValueError(f"Unknown bag type: {bag_type}")
    
    requirements = CRAFTING_CHAIN[bag_type].copy()
    
    # Multiply all requirements by quantity
    for key, value in requirements.items():
        requirements[key] = value * quantity
    
    return requirements

def calculate_crafting_time(bag_type, quantity, use_syn=False):
    """Calculate total crafting time for bag type and quantity"""
    if bag_type not in CRAFTING_CHAIN:
        raise ValueError(f"Unknown bag type: {bag_type}")
    
    base_time = CRAFTING_CHAIN[bag_type]['crafting_time_minutes'] * quantity
    
    if use_syn:
        return base_time * SYN_RATE
    
    return base_time

def calculate_scavenging_time(med_tech_needed, use_syn=False):
    """Calculate time needed to scavenge required med tech"""
    expected_per_run = (SCAVENGING['max_units_per_run'] * 
                       SCAVENGING['med_tech_drop_chance'] * 
                       SCAVENGING['med_tech_per_drop'])
    
    runs_needed = med_tech_needed / expected_per_run
    base_time_hours = runs_needed * SCAVENGING['run_time_hours']
    
    if use_syn:
        return base_time_hours * SYN_RATE
    
    return base_time_hours

def calculate_recycling_time(med_tech_amount, use_syn=False):
    """Calculate time needed to recycle med tech to tech scraps"""
    cycles_needed = med_tech_amount / 1000  # 1000 med tech per cycle
    base_time_minutes = cycles_needed * CONVERSIONS['recycle_time_minutes']
    
    if use_syn:
        return base_time_minutes * SYN_RATE
    
    return base_time_minutes

def convert_med_tech_to_tech_scraps(med_tech_amount):
    """Convert med tech to tech scraps using recycling ratio"""
    return med_tech_amount * CONVERSIONS['recycle_ratio']

def convert_clusters_to_base(clusters, cluster_type):
    """Convert clusters to base units (tech scraps or med tech)"""
    if cluster_type == 'tech_scrap':
        return clusters * CONVERSIONS['tech_scrap_per_cluster']
    elif cluster_type == 'med_tech':
        return clusters * CONVERSIONS['med_tech_per_cluster']
    else:
        raise ValueError(f"Unknown cluster type: {cluster_type}")

def calculate_clustering_cost(base_units, cluster_type):
    """Calculate BTC cost to create clusters from base units"""
    if cluster_type == 'tech_scrap':
        clusters_needed = base_units / CONVERSIONS['tech_scrap_per_cluster']
        return clusters_needed * CONVERSIONS['cluster_cost_tsc']
    elif cluster_type == 'med_tech':
        clusters_needed = base_units / CONVERSIONS['med_tech_per_cluster']
        return clusters_needed * CONVERSIONS['cluster_cost_mtc']
    else:
        raise ValueError(f"Unknown cluster type: {cluster_type}")

def calculate_bag_crafter_cost(doras_needed):
    """Calculate MTC cost for bag crafter service"""
    return doras_needed * BAG_CRAFTER['mtc_per_dora']

def calculate_remaining_bags(current_inventory, target_asus=1):
    """Calculate how many of each bag type is still needed"""
    total_req = calculate_total_asu_requirements(target_asus)
    
    remaining = {}
    for bag_type in ['old_pouches', 'fanny_packs', 'explorer_backpacks', 'employee_office_cases']:
        current = current_inventory.get(bag_type, 0)
        needed = total_req.get(bag_type, 0)
        remaining[bag_type] = max(0, needed - current)
    
    return remaining

def calculate_total_asu_requirements(target_asus=1):
    """Calculate total requirements for target number of ASUs"""
    # Base requirements for 1 ASU
    tech_scraps = (CRAFTING_CHAIN['old_pouch']['tech_scraps'] * 
                  CRAFTING_CHAIN['fanny_pack']['old_pouches'] * 
                  CRAFTING_CHAIN['explorer_backpack']['fanny_packs'] * 
                  CRAFTING_CHAIN['employee_office_case']['explorer_backpacks'] * 
                  CRAFTING_CHAIN['asu']['employee_office_cases'])
    
    bitcoin = (CRAFTING_CHAIN['old_pouch']['bitcoin'] * 
              CRAFTING_CHAIN['fanny_pack']['old_pouches'] * 
              CRAFTING_CHAIN['explorer_backpack']['fanny_packs'] * 
              CRAFTING_CHAIN['employee_office_case']['explorer_backpacks'] * 
              CRAFTING_CHAIN['asu']['employee_office_cases'] +
              CRAFTING_CHAIN['fanny_pack']['bitcoin'] * 
              CRAFTING_CHAIN['explorer_backpack']['fanny_packs'] * 
              CRAFTING_CHAIN['employee_office_case']['explorer_backpacks'] * 
              CRAFTING_CHAIN['asu']['employee_office_cases'] +
              CRAFTING_CHAIN['explorer_backpack']['bitcoin'] * 
              CRAFTING_CHAIN['employee_office_case']['explorer_backpacks'] * 
              CRAFTING_CHAIN['asu']['employee_office_cases'] +
              CRAFTING_CHAIN['employee_office_case']['bitcoin'] * 
              CRAFTING_CHAIN['asu']['employee_office_cases'] +
              CRAFTING_CHAIN['asu']['bitcoin'])
    
    old_pouches = (CRAFTING_CHAIN['fanny_pack']['old_pouches'] * 
                   CRAFTING_CHAIN['explorer_backpack']['fanny_packs'] * 
                   CRAFTING_CHAIN['employee_office_case']['explorer_backpacks'] * 
                   CRAFTING_CHAIN['asu']['employee_office_cases'])
    
    fanny_packs = (CRAFTING_CHAIN['explorer_backpack']['fanny_packs'] * 
                   CRAFTING_CHAIN['employee_office_case']['explorer_backpacks'] * 
                   CRAFTING_CHAIN['asu']['employee_office_cases'])
    
    explorer_backpacks = (CRAFTING_CHAIN['employee_office_case']['explorer_backpacks'] * 
                         CRAFTING_CHAIN['asu']['employee_office_cases'])
    
    employee_office_cases = CRAFTING_CHAIN['asu']['employee_office_cases']
    
    # Multiply by target ASUs
    return {
        'tech_scraps': tech_scraps * target_asus,
        'bitcoin': bitcoin * target_asus,
        'old_pouches': old_pouches * target_asus,
        'fanny_packs': fanny_packs * target_asus,
        'explorer_backpacks': explorer_backpacks * target_asus,
        'employee_office_cases': employee_office_cases * target_asus
    }

def validate_inventory_data(inventory):
    """Validate inventory data structure and values"""
    required_fields = [
        'tech_scraps', 'tech_scrap_clusters', 'med_tech', 'med_tech_clusters',
        'bitcoin', 'old_pouches', 'fanny_packs', 'explorer_backpacks',
        'employee_office_cases', 'asus'
    ]
    
    for field in required_fields:
        if field not in inventory:
            inventory[field] = 0
        elif not isinstance(inventory[field], (int, float)) or inventory[field] < 0:
            inventory[field] = 0
    
    # Validate dates
    if 'start_date' in inventory and inventory['start_date']:
        try:
            datetime.fromisoformat(inventory['start_date'])
        except (ValueError, TypeError):
            inventory['start_date'] = None
    
    if 'last_updated' in inventory and inventory['last_updated']:
        try:
            datetime.fromisoformat(inventory['last_updated'])
        except (ValueError, TypeError):
            inventory['last_updated'] = None
    
    return inventory

def calculate_progress_percentage(current_eoc_equivalent, target_eocs):
    """Calculate progress percentage towards target EOCs"""
    if target_eocs <= 0:
        return 0
    
    return min(100, (current_eoc_equivalent / target_eocs) * 100)

def calculate_total_requirements():
    """Calculate total requirements for crafting one ASU"""
    # Calculate total bags needed for the complete chain
    old_pouches = (CRAFTING_CHAIN['fanny_pack']['old_pouches'] * 
                   CRAFTING_CHAIN['explorer_backpack']['fanny_packs'] * 
                   CRAFTING_CHAIN['employee_office_case']['explorer_backpacks'] * 
                   CRAFTING_CHAIN['asu']['employee_office_cases'])
    
    fanny_packs = (CRAFTING_CHAIN['explorer_backpack']['fanny_packs'] * 
                   CRAFTING_CHAIN['employee_office_case']['explorer_backpacks'] * 
                   CRAFTING_CHAIN['asu']['employee_office_cases'])
    
    explorer_backpacks = (CRAFTING_CHAIN['employee_office_case']['explorer_backpacks'] * 
                         CRAFTING_CHAIN['asu']['employee_office_cases'])
    
    employee_office_cases = CRAFTING_CHAIN['asu']['employee_office_cases']
    
    # Calculate total tech scraps needed
    tech_scraps = old_pouches * CRAFTING_CHAIN['old_pouch']['tech_scraps']
    
    # Calculate total bitcoin needed for all crafting operations
    bitcoin = (
        # Old Pouches
        old_pouches * CRAFTING_CHAIN['old_pouch']['bitcoin'] +
        # Fanny Packs  
        fanny_packs * CRAFTING_CHAIN['fanny_pack']['bitcoin'] +
        # Explorer Backpacks
        explorer_backpacks * CRAFTING_CHAIN['explorer_backpack']['bitcoin'] +
        # Employee Office Cases
        employee_office_cases * CRAFTING_CHAIN['employee_office_case']['bitcoin'] +
        # Final ASU
        CRAFTING_CHAIN['asu']['bitcoin']
    )
    
    return {
        'old_pouches': old_pouches,
        'fanny_packs': fanny_packs,
        'explorer_backpacks': explorer_backpacks,
        'employee_office_cases': employee_office_cases,
        'tech_scraps': tech_scraps,
        'bitcoin': bitcoin
    }

def calculate_expected_med_tech_per_run():
    """Calculate expected med tech per scavenging run"""
    return (SCAVENGING['max_units_per_run'] * 
            SCAVENGING['med_tech_drop_chance'] * 
            SCAVENGING['med_tech_per_drop'])

def hours_to_days(hours):
    """Convert hours to days"""
    return hours / 24

def calculate_scav_time(med_tech_needed):
    """Calculate scavenging time needed for given med tech amount
    
    Returns dict with hours and days for both syn states
    """
    if med_tech_needed <= 0:
        return {
            'hours_no_syn': 0,
            'days_no_syn': 0,
            'hours_with_syn': 0,
            'days_with_syn': 0
        }
    
    expected_per_run = calculate_expected_med_tech_per_run()
    runs_needed = med_tech_needed / expected_per_run
    
    hours_no_syn = runs_needed * SCAVENGING['run_time_hours']
    days_no_syn = hours_to_days(hours_no_syn)
    
    hours_with_syn = hours_no_syn * SYN_RATE
    days_with_syn = hours_to_days(hours_with_syn)
    
    return {
        'hours_no_syn': hours_no_syn,
        'days_no_syn': days_no_syn,
        'hours_with_syn': hours_with_syn,
        'days_with_syn': days_with_syn
    }

def calculate_tech_scrap_equivalent_from_inventory(inventory):
    """Calculate total tech scrap equivalent from inventory items"""
    total = inventory.get('tech_scraps', 0)
    
    # Add clustered tech scraps
    total += inventory.get('tech_scrap_clusters', 0) * CONVERSIONS['tech_scrap_per_cluster']
    
    # Add med tech (via recycling)
    med_tech_total = (inventory.get('med_tech', 0) + 
                     inventory.get('med_tech_clusters', 0) * CONVERSIONS['med_tech_per_cluster'])
    total += med_tech_total * CONVERSIONS['recycle_ratio']
    
    # Add bags converted to tech scrap equivalent
    total += calculate_tech_scrap_equivalent_from_bags(inventory)
    
    return int(total)

def calculate_eoc_equivalent_from_inventory(inventory):
    """Calculate current progress in EOC equivalents from inventory"""
    eoc_equivalent = 0
    
    # Convert existing bags to EOC fractions
    eoc_equivalent += inventory.get('employee_office_cases', 0)
    
    # Explorer backpacks
    eoc_equivalent += (inventory.get('explorer_backpacks', 0) / 
                      CRAFTING_CHAIN['employee_office_case']['explorer_backpacks'])
    
    # Fanny packs
    eoc_equivalent += (inventory.get('fanny_packs', 0) / 
                      (CRAFTING_CHAIN['employee_office_case']['explorer_backpacks'] * 
                       CRAFTING_CHAIN['explorer_backpack']['fanny_packs']))
    
    # Old pouches
    eoc_equivalent += (inventory.get('old_pouches', 0) / 
                      (CRAFTING_CHAIN['employee_office_case']['explorer_backpacks'] * 
                       CRAFTING_CHAIN['explorer_backpack']['fanny_packs'] * 
                       CRAFTING_CHAIN['fanny_pack']['old_pouches']))
    
    return eoc_equivalent

def calculate_remaining_bags_to_craft(inventory, target_asus=1):
    """Calculate remaining bags needed working backwards from final requirements
    
    Returns dict with remaining counts for each bag type
    """
    # Work backwards from final requirements
    remaining_asus = max(0, target_asus - inventory.get('asus', 0))
    total_eocs_needed = remaining_asus * CRAFTING_CHAIN['asu']['employee_office_cases']
    remaining_eocs = max(0, total_eocs_needed - inventory.get('employee_office_cases', 0))
    
    # Each EOC needs 20 Doras
    doras_needed_for_eocs = remaining_eocs * CRAFTING_CHAIN['employee_office_case']['explorer_backpacks']
    remaining_doras = max(0, doras_needed_for_eocs - inventory.get('explorer_backpacks', 0))
    
    # Each Dora needs 15 Fannys
    fannys_needed_for_doras = remaining_doras * CRAFTING_CHAIN['explorer_backpack']['fanny_packs']
    remaining_fannys = max(0, fannys_needed_for_doras - inventory.get('fanny_packs', 0))
    
    # Each Fanny needs 10 OPs
    ops_needed_for_fannys = remaining_fannys * CRAFTING_CHAIN['fanny_pack']['old_pouches']
    remaining_ops = max(0, ops_needed_for_fannys - inventory.get('old_pouches', 0))
    
    return {
        'old_pouches': remaining_ops,
        'fanny_packs': remaining_fannys,
        'explorer_backpacks': remaining_doras,
        'employee_office_cases': remaining_eocs,
        'asus': remaining_asus
    }

def calculate_craftable_bags_from_resources(inventory):
    """Calculate how many bags can be crafted from available tech scraps and existing bags
    
    Returns dict with craftable counts for each bag type
    """
    # Calculate how many OPs can be crafted from available tech scraps
    current_tech_scraps = inventory.get('tech_scraps', 0)
    current_tsc = inventory.get('tech_scrap_clusters', 0)
    total_tech_scraps = current_tech_scraps + (current_tsc * CONVERSIONS['tech_scrap_per_cluster'])
    
    tech_scraps_per_op = CRAFTING_CHAIN['old_pouch']['tech_scraps']
    craftable_ops_from_tech_scraps = total_tech_scraps // tech_scraps_per_op
    
    # Calculate craftable bags from existing inventory
    current_ops = inventory.get('old_pouches', 0)
    current_fannys = inventory.get('fanny_packs', 0)
    current_doras = inventory.get('explorer_backpacks', 0)
    
    # Total OPs available (current + craftable)
    total_available_ops = current_ops + craftable_ops_from_tech_scraps
    
    # How many Fannys can be made from total available OPs
    ops_per_fanny = CRAFTING_CHAIN['fanny_pack']['old_pouches']
    additional_fannys_from_ops = total_available_ops // ops_per_fanny
    total_available_fannys = current_fannys + additional_fannys_from_ops
    
    # How many Doras can be made from total available Fannys
    fannys_per_dora = CRAFTING_CHAIN['explorer_backpack']['fanny_packs']
    craftable_doras = total_available_fannys // fannys_per_dora
    
    return {
        'ops_from_tech_scraps': craftable_ops_from_tech_scraps,
        'total_craftable_doras': craftable_doras,
        'total_available_ops': total_available_ops,
        'total_available_fannys': total_available_fannys
    }

def calculate_tech_scrap_equivalent_from_bags(inventory):
    """Calculate tech scrap equivalent from bag inventory only"""
    total = 0
    
    # Old Pouches
    total += inventory.get('old_pouches', 0) * CRAFTING_CHAIN['old_pouch']['tech_scraps']
    
    # Fanny Packs
    total += (inventory.get('fanny_packs', 0) * 
             CRAFTING_CHAIN['fanny_pack']['old_pouches'] * 
             CRAFTING_CHAIN['old_pouch']['tech_scraps'])
    
    # Explorer Backpacks
    total += (inventory.get('explorer_backpacks', 0) * 
             CRAFTING_CHAIN['explorer_backpack']['fanny_packs'] * 
             CRAFTING_CHAIN['fanny_pack']['old_pouches'] * 
             CRAFTING_CHAIN['old_pouch']['tech_scraps'])
    
    # Employee Office Cases
    total += (inventory.get('employee_office_cases', 0) * 
             CRAFTING_CHAIN['employee_office_case']['explorer_backpacks'] * 
             CRAFTING_CHAIN['explorer_backpack']['fanny_packs'] * 
             CRAFTING_CHAIN['fanny_pack']['old_pouches'] * 
             CRAFTING_CHAIN['old_pouch']['tech_scraps'])
    
    return total

def estimate_completion_date(remaining_tech_scraps, daily_collection_rate):
    """Estimate completion date based on remaining requirements and collection rate"""
    if daily_collection_rate <= 0:
        return None
    
    days_remaining = remaining_tech_scraps / daily_collection_rate
    return datetime.now() + timedelta(days=days_remaining)

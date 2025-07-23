# ASU Calculator Configuration
# Centralized settings for crafting chains, rates, and mechanics

# Crafting chain requirements and times
CRAFTING_CHAIN = {
    'old_pouch': {
        'tech_scraps': 100,
        'bitcoin': 500,
        'crafting_time_minutes': 5
    },
    'fanny_pack': {
        'old_pouches': 10,
        'bitcoin': 5000,
        'crafting_time_minutes': 15
    },
    'explorer_backpack': {
        'fanny_packs': 15,
        'bitcoin': 5000,
        'crafting_time_minutes': 30
    },
    'employee_office_case': {
        'explorer_backpacks': 20,
        'bitcoin': 50000,
        'crafting_time_minutes': 45
    },
    'asu': {
        'employee_office_cases': 25,
        'bitcoin': 500000,
        'crafting_time_minutes': 60
    }
}

# Resource conversion ratios
CONVERSIONS = {
    'tech_scrap_per_cluster': 1000,
    'med_tech_per_cluster': 1000,
    'cluster_cost_tsc': 5000,
    'cluster_cost_mtc': 5000,
    'recycle_ratio': 1.2,  # 1000 med tech -> 1200 tech scraps
    'recycle_time_minutes': 266.67  # 4 hours, 26 minutes, 40 seconds
}

# Scavenging mechanics
SCAVENGING = {
    'max_units_per_run': 12,
    'med_tech_drop_chance': 0.7252,
    'med_tech_per_drop': 57,
    'run_time_hours': 3
}

# Bag crafter service settings
BAG_CRAFTER = {
    'mtc_per_dora': 15,  # 15 MTC per Explorer's Backpack
    'service_name': 'Bag Crafter Service'
}

# Syn rate multiplier (when syn is active)
SYN_RATE = 0.2  # 20% of normal time

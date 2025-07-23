#!/usr/bin/env python3
"""
ASU Time Calculator - Main Application

Interactive CLI interface for calculating remaining time to craft an ASU bag
based on current resource collection progress and crafting chain requirements.
"""

import json
import os
from datetime import datetime, timedelta
from config import CRAFTING_CHAIN, CONVERSIONS, SCAVENGING, BAG_CRAFTER, SYN_RATE
from utils import (calculate_scav_time, hours_to_days, calculate_expected_med_tech_per_run,
                   calculate_tech_scrap_equivalent_from_inventory, calculate_eoc_equivalent_from_inventory,
                   calculate_remaining_bags_to_craft, calculate_craftable_bags_from_resources,
                   calculate_total_requirements)

INVENTORY_FILE = "asu_inventory.json"

class ASUCalculator:
    def __init__(self):
        self.inventory = self.load_inventory()
    
    def load_inventory(self):
        """Load inventory from JSON file or create new one"""
        if os.path.exists(INVENTORY_FILE):
            try:
                with open(INVENTORY_FILE, 'r') as f:
                    inventory = json.load(f)
                print(f"✅ Loaded inventory from {INVENTORY_FILE}")
                return inventory
            except (json.JSONDecodeError, FileNotFoundError):
                print(f"⚠️  Error loading {INVENTORY_FILE}, creating new inventory")
        
        # Create new inventory with default values
        inventory = {
            "tech_scraps": 0,
            "tech_scrap_clusters": 0,
            "med_tech": 0,
            "med_tech_clusters": 0,
            "bitcoin": 0,
            "old_pouches": 0,
            "fanny_packs": 0,
            "explorer_backpacks": 0,
            "employee_office_cases": 0,
            "asus": 0,
            "start_date": None,
            "last_updated": None
        }
        return inventory
    
    def save_inventory(self):
        """Save current inventory to JSON file"""
        self.inventory["last_updated"] = datetime.now().isoformat()
        
        # Create backup if file exists
        if os.path.exists(INVENTORY_FILE):
            backup_file = f"{INVENTORY_FILE}.backup"
            os.rename(INVENTORY_FILE, backup_file)
        
        with open(INVENTORY_FILE, 'w') as f:
            json.dump(self.inventory, f, indent=2)
        print(f"💾 Inventory saved to {INVENTORY_FILE}")
    
    def update_inventory(self):
        """Interactive inventory update"""
        print("\n📦 UPDATE INVENTORY")
        print("Enter current amounts (press Enter to keep existing value):")
        
        fields = [
            ("tech_scraps", "Tech Scraps"),
            ("tech_scrap_clusters", "Tech Scrap Clusters"),
            ("med_tech", "Med Tech"),
            ("med_tech_clusters", "Med Tech Clusters"),
            ("bitcoin", "Bitcoin"),
            ("old_pouches", "Old Pouches"),
            ("fanny_packs", "Fanny Packs"),
            ("explorer_backpacks", "Explorer's Backpacks"),
            ("employee_office_cases", "Employee Office Cases"),
            ("asus", "ASUs")
        ]
        
        for field, display_name in fields:
            current = self.inventory.get(field, 0)
            while True:
                try:
                    user_input = input(f"{display_name} (current: {current:,}): ").strip()
                    if user_input == "":
                        break
                    value = int(user_input.replace(",", ""))
                    self.inventory[field] = value
                    break
                except ValueError:
                    print("Please enter a valid number")
        
        # Set start date if not already set
        if not self.inventory.get("start_date"):
            while True:
                date_input = input("\nStart date for tracking (YYYY-MM-DD) or press Enter for today: ").strip()
                if date_input == "":
                    self.inventory["start_date"] = datetime.now().isoformat()
                    break
                try:
                    start_date = datetime.strptime(date_input, "%Y-%m-%d")
                    self.inventory["start_date"] = start_date.isoformat()
                    break
                except ValueError:
                    print("Please enter date in YYYY-MM-DD format")
    
    def calculate_tech_scrap_equivalent(self):
        """Calculate total tech scrap equivalent from all inventory"""
        return calculate_tech_scrap_equivalent_from_inventory(self.inventory)
    
    def calculate_collection_rate(self):
        """Calculate actual collection rate based on start date"""
        if not self.inventory.get("start_date"):
            return None
        
        start_date = datetime.fromisoformat(self.inventory["start_date"])
        days_elapsed = (datetime.now() - start_date).total_seconds() / 86400
        
        if days_elapsed <= 0:
            return None
        
        tech_scrap_collected = self.calculate_tech_scrap_equivalent()
        daily_rate = tech_scrap_collected / days_elapsed
        
        # Calculate scav runs per day
        expected_per_run = calculate_expected_med_tech_per_run()
        scav_runs_per_day = daily_rate / (expected_per_run * CONVERSIONS['recycle_ratio'])
        
        return {
            'days_elapsed': days_elapsed,
            'tech_scrap_collected': tech_scrap_collected,
            'daily_rate': daily_rate,
            'scav_runs_per_day': scav_runs_per_day
        }
    
    def calculate_eoc_progress(self):
        """Calculate current progress in EOC equivalents"""
        return calculate_eoc_equivalent_from_inventory(self.inventory)
    
    def calculate_results_data(self):
        """Calculate all results data without any display logic"""
        total_req = calculate_total_requirements()
        collection_rate = self.calculate_collection_rate()
        eoc_progress = self.calculate_eoc_progress()
        
        # Remaining gathering requirements
        remaining_eocs = max(0, total_req['employee_office_cases'] - eoc_progress)
        remaining_tech_scraps = max(0, total_req['tech_scraps'] - self.calculate_tech_scrap_equivalent())
        
        current_med_tech_total = (self.inventory['med_tech'] + 
                                 self.inventory['med_tech_clusters'] * CONVERSIONS['med_tech_per_cluster'])
        med_tech_needed_for_remaining = remaining_tech_scraps / CONVERSIONS['recycle_ratio']
        remaining_mtc_needed = max(0, med_tech_needed_for_remaining - current_med_tech_total) / CONVERSIONS['med_tech_per_cluster']
        
        # Scav time for gathering requirements
        scav_time_gathering = None
        if remaining_mtc_needed > 0:
            med_tech_needed = remaining_mtc_needed * CONVERSIONS['med_tech_per_cluster']
            scav_time_gathering = calculate_scav_time(med_tech_needed)
        
        # Remaining bags to craft
        remaining_bags = calculate_remaining_bags_to_craft(self.inventory)
        
        # Crafting time and BTC calculations
        total_crafting_time_minutes = (
            remaining_bags['old_pouches'] * CRAFTING_CHAIN['old_pouch']['crafting_time_minutes'] +
            remaining_bags['fanny_packs'] * CRAFTING_CHAIN['fanny_pack']['crafting_time_minutes'] +
            remaining_bags['explorer_backpacks'] * CRAFTING_CHAIN['explorer_backpack']['crafting_time_minutes'] +
            remaining_bags['employee_office_cases'] * CRAFTING_CHAIN['employee_office_case']['crafting_time_minutes'] +
            remaining_bags['asus'] * CRAFTING_CHAIN['asu']['crafting_time_minutes']
        )
        
        total_crafting_btc = (
            remaining_bags['old_pouches'] * CRAFTING_CHAIN['old_pouch']['bitcoin'] +
            remaining_bags['fanny_packs'] * CRAFTING_CHAIN['fanny_pack']['bitcoin'] +
            remaining_bags['explorer_backpacks'] * CRAFTING_CHAIN['explorer_backpack']['bitcoin'] +
            remaining_bags['employee_office_cases'] * CRAFTING_CHAIN['employee_office_case']['bitcoin'] +
            remaining_bags['asus'] * CRAFTING_CHAIN['asu']['bitcoin']
        )
        
        total_crafting_time_hours = total_crafting_time_minutes / 60
        total_crafting_time_days = hours_to_days(total_crafting_time_hours)
        total_crafting_time_hours_syn = total_crafting_time_hours * SYN_RATE
        total_crafting_time_days_syn = hours_to_days(total_crafting_time_hours_syn)
        
        # Bag crafter service calculations
        craftable_resources = calculate_craftable_bags_from_resources(self.inventory)
        doras_still_needed = remaining_bags['explorer_backpacks']
        doras_you_can_craft = craftable_resources['total_craftable_doras']
        doras_to_buy = max(0, doras_still_needed - doras_you_can_craft)
        
        mtc_cost_for_doras = doras_to_buy * BAG_CRAFTER['mtc_per_dora']
        btc_for_clustering = mtc_cost_for_doras * CONVERSIONS['cluster_cost_mtc']
        
        # Scav time for bag crafter service
        scav_time_bag_crafter = None
        if mtc_cost_for_doras > 0:
            med_tech_for_purchase = mtc_cost_for_doras * CONVERSIONS['med_tech_per_cluster']
            scav_time_bag_crafter = calculate_scav_time(med_tech_for_purchase)
        
        # After buying Doras calculations
        after_buying_doras = None
        if doras_to_buy > 0:
            current_btc = self.inventory['bitcoin']
            remaining_eocs_after_purchase = remaining_bags['employee_office_cases']
            remaining_btc_after_doras = (remaining_eocs_after_purchase * CRAFTING_CHAIN['employee_office_case']['bitcoin'] + 
                                       CRAFTING_CHAIN['asu']['bitcoin'] - current_btc + btc_for_clustering)
            
            eoc_crafting_time = remaining_eocs_after_purchase * CRAFTING_CHAIN['employee_office_case']['crafting_time_minutes']
            asu_crafting_time = CRAFTING_CHAIN['asu']['crafting_time_minutes']
            total_crafting_time_hours_after = (eoc_crafting_time + asu_crafting_time) / 60
            total_crafting_time_hours_syn_after = total_crafting_time_hours_after * SYN_RATE
            
            after_buying_doras = {
                'btc_needed': remaining_btc_after_doras,
                'crafting_time_hours': total_crafting_time_hours_after,
                'crafting_time_hours_syn': total_crafting_time_hours_syn_after
            }
        
        # Completion estimate
        completion_estimate = None
        if collection_rate and collection_rate['daily_rate'] > 0:
            days_to_completion = remaining_tech_scraps / collection_rate['daily_rate']
            completion_date = datetime.now() + timedelta(days=days_to_completion)
            completion_estimate = {
                'days_to_completion': days_to_completion,
                'completion_date': completion_date
            }
        
        return {
            'total_requirements': total_req,
            'collection_rate': collection_rate,
            'eoc_progress': eoc_progress,
            'remaining_gathering': {
                'tech_scraps': remaining_tech_scraps,
                'mtc_needed': remaining_mtc_needed,
                'scav_time': scav_time_gathering
            },
            'remaining_bags': remaining_bags,
            'crafting_totals': {
                'time_hours': total_crafting_time_hours,
                'time_days': total_crafting_time_days,
                'time_hours_syn': total_crafting_time_hours_syn,
                'time_days_syn': total_crafting_time_days_syn,
                'btc': total_crafting_btc
            },
            'bag_crafter_service': {
                'doras_still_needed': doras_still_needed,
                'ops_from_tech_scraps': craftable_resources['ops_from_tech_scraps'],
                'doras_you_can_craft': doras_you_can_craft,
                'doras_to_buy': doras_to_buy,
                'mtc_cost': mtc_cost_for_doras,
                'btc_for_clustering': btc_for_clustering,
                'scav_time': scav_time_bag_crafter,
                'after_buying_doras': after_buying_doras
            },
            'completion_estimate': completion_estimate
        }
    
    def display_results(self):
        """Display comprehensive calculation results"""
        results = self.calculate_results_data()
        
        print("\n" + "="*60)
        print("🎯 ASU CALCULATOR RESULTS")
        print("="*60)
        
        # Total requirements
        total_req = results['total_requirements']
        print(f"\n📋 TOTAL REQUIREMENTS:")
        print(f"   Tech Scraps: {total_req['tech_scraps']:,}")
        print(f"   Bitcoin: {total_req['bitcoin']:,}")
        print(f"   Employee Office Cases: {total_req['employee_office_cases']}")
        
        # Collection rate
        collection_rate = results['collection_rate']
        if collection_rate:
            print(f"\n📈 YOUR COLLECTION RATE:")
            print(f"   Days elapsed: {collection_rate['days_elapsed']:.1f}")
            print(f"   Tech scrap collected (equivalent): {collection_rate['tech_scrap_collected']:,}")
            print(f"   Average per day: {collection_rate['daily_rate']:,.0f} tech scraps/day")
            print(f"   Estimated scav runs per day: {collection_rate['scav_runs_per_day']:.1f}")
        
        # Progress
        eoc_progress = results['eoc_progress']
        print(f"\n🎒 BAG CRAFTING PROGRESS:")
        print(f"   Employee Office Cases: {eoc_progress:.1f} / {total_req['employee_office_cases']}")
        print(f"   EOC Progress: {(eoc_progress / total_req['employee_office_cases'] * 100):.1f}% complete")
        
        # Remaining gathering requirements
        gathering = results['remaining_gathering']
        print(f"\n⏰ REMAINING GATHERING REQUIREMENTS:")
        print(f"   Tech Scraps (equivalent): {gathering['tech_scraps']:,}")
        print(f"   Med Tech Clusters (MTC): {gathering['mtc_needed']:.1f}")
        
        if gathering['scav_time']:
            scav_time = gathering['scav_time']
            print(f"   Scav Time (without syn): {scav_time['hours_no_syn']:.1f} hours ({scav_time['days_no_syn']:.1f} days)")
            print(f"   Scav Time (with syn): {scav_time['hours_with_syn']:.1f} hours ({scav_time['days_with_syn']:.1f} days)")
        
        # Remaining bags to craft
        remaining_bags = results['remaining_bags']
        crafting_totals = results['crafting_totals']
        print(f"\n🔨 REMAINING BAGS TO CRAFT:")
        print(f"   Old Pouches: {remaining_bags['old_pouches']:,}")
        print(f"   Fanny Packs: {remaining_bags['fanny_packs']:,}")
        print(f"   Explorer's Backpacks: {remaining_bags['explorer_backpacks']:,}")
        print(f"   Employee Office Cases: {remaining_bags['employee_office_cases']:,}")
        print(f"   ASUs: {remaining_bags['asus']:,}")
        print(f"   ---")
        print(f"   Total crafting time (without syn): {crafting_totals['time_hours']:.1f} hours ({crafting_totals['time_days']:.1f} days)")
        print(f"   Total crafting time (with syn): {crafting_totals['time_hours_syn']:.1f} hours ({crafting_totals['time_days_syn']:.1f} days)")
        print(f"   Total crafting BTC: {crafting_totals['btc']:,}")
        
        # Bag crafter service
        bag_crafter = results['bag_crafter_service']
        print(f"\n💰 BAG CRAFTER SERVICE:")
        print(f"   Doras still needed: {bag_crafter['doras_still_needed']:,}")
        print(f"   OPs you can craft from TS/TSC: {bag_crafter['ops_from_tech_scraps']:,}")
        print(f"   Doras you can craft: {bag_crafter['doras_you_can_craft']:,}")
        print(f"   Doras to buy: {bag_crafter['doras_to_buy']:,}")
        print(f"   MTC cost for purchase: {bag_crafter['mtc_cost']:,.0f} MTC ({bag_crafter['btc_for_clustering']:,.0f} BTC for clustering)")
        
        if bag_crafter['scav_time']:
            scav_time = bag_crafter['scav_time']
            print(f"     Scav Time (without syn): {scav_time['hours_no_syn']:.1f} hours ({scav_time['days_no_syn']:.1f} days)")
            print(f"     Scav Time (with syn): {scav_time['hours_with_syn']:.1f} hours ({scav_time['days_with_syn']:.1f} days)")
        
        if bag_crafter['after_buying_doras']:
            after_buying = bag_crafter['after_buying_doras']
            print(f"   After buying Doras:")
            print(f"     Total BTC needed: {after_buying['btc_needed']:,.0f} BTC")
            print(f"     Crafting time (without syn): {after_buying['crafting_time_hours']:.1f} hours")
            print(f"     Crafting time (with syn): {after_buying['crafting_time_hours_syn']:.1f} hours")
        else:
            print(f"   No Doras need to be purchased - you can craft all needed Doras")
        
        # Completion estimate
        completion = results['completion_estimate']
        if completion:
            print(f"\n⏳ COMPLETION ESTIMATE:")
            print(f"   Days to completion: {completion['days_to_completion']:.1f}")
            print(f"   Estimated completion: {completion['completion_date'].strftime('%Y-%m-%d %H:%M')}")

def main():
    """Main application entry point"""
    print("🎯 ASU Time Calculator")
    print("=" * 40)
    
    calculator = ASUCalculator()
    
    try:
        calculator.update_inventory()
        calculator.save_inventory()
        calculator.display_results()
    except KeyboardInterrupt:
        print("\n\n👋 Goodbye!")
    except Exception as e:
        print(f"\n❌ Error: {e}")

if __name__ == "__main__":
    main()

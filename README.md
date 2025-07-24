# ASU Time Calculator

A calculator to determine the remaining time needed to create an Autonomous Storage Unit (ASU) bag based on current resource collection progress and the complete crafting chain.

## Project Structure

This repository contains two implementations:

### 📁 `javascript/` - **Primary Web Implementation** ⭐
- **Feature-complete React + Vite** single-page application
- **Enhanced modern interface** with real-time updates and visual progress indicators
- **Scav level optimization** with dynamic zone recommendations
- **Mobile-responsive design** with professional styling
- **100% calculation accuracy** validated against Python version
- **Comprehensive test suite** and production-ready deployment
- **Active development and maintenance**

### 📁 `python/` - Original CLI Implementation
- **Complete and stable** command-line interface
- **Reference implementation** for calculation validation
- **Maintenance mode** - stable but not actively enhanced

## Quick Start

### 🌟 **Recommended: Web Version**
```bash
cd javascript/
npm install
npm run dev
```
**Live Demo**: [ASU Calculator Web App](https://your-github-username.github.io/asu-calculator/)

### Python Version (CLI)
```bash
cd python/
python asu_calculator.py
```

## Features

**The React web version is now the primary implementation** with enhanced features and active development. Both implementations provide core functionality:

- **Main Application (`asu_calculator.py`)**: Interactive CLI interface with inventory management and result orchestration
- **Utility Functions (`utils.py`)**: Pure calculation functions for scavenging, bag crafting, and resource conversions
- **Configuration (`config.py`)**: Centralized settings for crafting chains, rates, and mechanics
- **Test Suite (`test_calculator.py`)**: Automated tests to verify calculation accuracy
- **Data Persistence**: JSON-based inventory storage with automatic backup
- **Collection Tracking**: Date-based progress monitoring with actual collection rate since start date
- **Bag Crafting Comparison**: Traditional crafting vs bag crafter service calculations

## Python Implementation Architecture

The Python version follows a clean separation of concerns:

### Core Data Structures

**Inventory Structure (`asu_inventory.json`)**:
```json
{
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
  "start_date": "2024-12-25T00:00:00",
}
```

**Configuration Constants (`config.py`)**:
- `CRAFTING_CHAIN`: Hierarchical bag requirements and crafting times
- `CONVERSIONS`: Resource conversion ratios
- `SCAVENGING`: Drop rates and timing
- `BAG_CRAFTER`: Service costs
- `SYN_RATE`: Time multiplier when syn is active (0.2)

### Architecture Design

The application follows a clean separation of concerns:

**Application Layer (`asu_calculator.py`)**:
- Stateful operations (inventory management, user interaction)
- Result orchestration and display formatting
- CLI interface and data persistence

**Utility Layer (`utils.py`)**:
- Pure calculation functions (no side effects)
- Reusable across different contexts
- Comprehensive scavenging, crafting, and conversion utilities
- Easily testable in isolation

## Crafting Chain

The ASU bag follows this hierarchical crafting system:

1. **Old Pouch (OP)**: 100 tech scraps + 500 BTC + 5 minutes
2. **Fanny Pack**: 10 OPs + 5,000 BTC + 15 minutes  
3. **Explorer's Backpack (Dora)**: 15 Fannys + 5,000 BTC + 30 minutes
4. **Employee Office Case (EOC)**: 20 Doras + 50,000 BTC + 45 minutes
5. **Autonomous Storage Unit (ASU)**: 25 EOCs + 500,000 BTC + 1 hour

## Resource Conversion System

The game includes a tech scrap conversion system:
- **1 Tech Scrap Cluster (TSC)** → 1,000 tech scraps
- **1,000 tech scraps + 5,000 BTC** --> 1 TSC
- **1 Med Tech Cluster** → 1,000 med tech
- **1,000 med tech + 5,000 BTC** --> MTC
- **1,000 Med Tech +  4 hours, 26 minutes, and 40 seconds** → 1,200 tech scraps (this is called recycling)

## Scavenging Mechanics

The calculator models realistic scavenging with:
- **Max 12 units per scavenging run**
- **72.52% med tech drop chance**
- **57 med tech per drop**
- **3 hours per run without syn**
- **Expected yield: ~496 med tech per run**

## Bag Crafter Service

Some other players provide bag crafting as a service. This allows the user to save time and BTC by not having to craft
all tiers of bags themselves. The other players will sell Doras in exchange for MTC.
The calculator supports the bag crafter service:
- **Cost**: 15 MTC per Explorer's Backpack (Dora)
- **Benefit**: Skips Old Pouch, Fanny Pack, and Dora crafting
- **Remaining**: Calculates how many more bags should be purchased, MTCs required, and the BTC required to cluster the med tech

## Collection Rate Tracking

The calculator tracks your actual collection progress:
- **Start date tracking**: Set a baseline date to measure progress
- **Equivalent tech scrap collected**: Calculates the total number of tech scrap equivalent from all inventory items
- **Realistic completion estimates**: Based on your actual collection patterns

## Total ASU Requirements

To craft one ASU from scratch, you need:
- **Tech Scraps**: 7,500,000 (100 × 10 × 15 × 20 × 25)
- **Bitcoin**: 79,250,000 BTC total (without bag crafter service or MTC clustering fees)
- **Time**: Total time required for all bag crafting + scavenging, with or without syn

## Features

- **Actual collection rate tracking** based on start date and current inventory
- **Bag crafter service integration** with cost and time calculations
- **Existing bag progress accounting** (fractional EOC equivalents)
- **Realistic scavenging mechanics** with syn speed calculations
- **Completion estimates** based on your actual daily collection rate
- **Time analysis** with syn vs non-syn comparisons
- **Inventory persistence** with automatic saving/loading

## Requirements

### Web Version (React)
- **Node.js**: 18.0+ or 20.0+
- **npm**: 9.0+ (comes with Node.js)
- **Modern browser**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

### Python Version (CLI)
- **Python**: 3.7+
- **No external dependencies** - uses only Python standard library

## Installation

### Web Version
```bash
cd javascript/
npm install
```

### Python Version
1. Clone or download this repository
2. No additional installation needed - uses only Python standard library

## Usage

```bash
python asu_calculator.py
```

The script runs interactively and will:
1. Load your previous inventory (if available)
2. Prompt for current inventory updates
3. Set up collection tracking start date (if not already configured)
4. Display comprehensive results

## Input Format

The script automatically manages inventory in `asu_inventory.json`:

```json
{
  "tech_scraps": 2562,
  "tech_scrap_clusters": 0,
  "med_tech": 2630,
  "med_tech_clusters": 185,
  "bitcoin": 0,
  "old_pouches": 5028,
  "fanny_packs": 1003,
  "explorer_backpacks": 98,
  "employee_office_cases": 1,
  "asus": 0,
  "start_date": "2024-12-25T00:00:00",
}
```

## Output Format

The calculator provides organized results:

1. **📋 TOTAL REQUIREMENTS**: Total requirements for crafting ASU (static)
2. **📈 YOUR COLLECTION RATE**: Actual progress tracking and daily rates
3. **🎒 BAG CRAFTING PROGRESS**: Current progress with existing bag breakdown
4. **⏰ REMAINING GATHERING REQUIREMENTS**: Tech scraps, MTC, and scavenging time still needed
5. **🔨 REMAINING BAGS TO CRAFT**: Number of each bag type to craft with time and BTC totals
6. **💰 BAG CRAFTER SERVICE**: Remaining Doras needed, costs (med tech to crafter, BTC to create clusters), additional requirements after buying doras
7. **⏳ COMPLETION ESTIMATE**: Projected completion date based on actual rates

## Configuration

Edit `config.py` to modify:
- **Bag crafting requirements** and time costs
- **Conversion rates** and ratios
- **Scavenging mechanics** (drop rates, timing)
- **Bag crafter service** settings and costs

## Key Features

### Collection Rate Tracking
- Tracks actual med tech collection since your specified start date
- Accounts for med tech used in crafting existing bags
- Provides realistic completion estimates based on your actual progress

### Bag Crafter Service Integration
- Calculates exact Doras needed and MTC costs
- Shows time and BTC requirements after purchasing Doras
- Compares time savings vs traditional crafting

### Progress Accounting
- Converts existing bags to fractional EOC equivalents
- Shows detailed breakdown of progress from each bag type
- Accounts for all existing inventory in completion calculations
- Displays discreet number of each bag type still needed

## Example Output
These numbers are placeholders, and are not accurate.

```
📋 TOTAL REQUIREMENTS:
   Tech Scraps: 7,500,000
   Bitcoin: 79,250,000
   Employee Office Cases: 25

📈 YOUR COLLECTION RATE:
   Days elapsed: 209.6
   Tech scrap collected (equivalent): 3,930,960
   Average per day: 18,753 tech scraps/day
   Estimated scav runs per day: 37.8

🎒 BAG CRAFTING PROGRESS:
   Employee Office Cases: 10.9 / 25
   EOC Progress: 43.7% complete

⏰ REMAINING GATHERING REQUIREMENTS:
   Tech Scraps (equivalent): 3,996,482
   Med Tech Clusters (MTC): 3,142.8
   Scav Time (without syn): 19,007.3 hours (792.0 days)
   Scav Time (with syn): 3,801.5 hours (158.4 days)

🔨 REMAINING BAGS TO CRAFT:
   Old Pouches: 42,242
   Fanny Packs: 4,727
   Explorer's Backpacks: 382
   Employee Office Cases: 24
   ASUs: 1
   ---
   Total crafting time (without syn): 4,911.9 hours (204.7 days)
   Total crafting time (with syn): 982.4 hours (40.9 days)
   Total crafting BTC: 48,366,000

💰 BAG CRAFTER SERVICE:
   Doras still needed: 382
   OPs you can craft from TS/TSC: 25
   Doras you can craft: 100
   Doras to buy: 282
   MTC cost for purchase: 4,230 MTC (21,150,000 BTC for clustering)
     Scav Time (without syn): 25,582.8 hours (1,065.9 days)
     Scav Time (with syn): 5,116.6 hours (213.2 days)
   After buying Doras:
     Total BTC needed: 22,800,000 BTC
     Crafting time (without syn): 19.0 hours
     Crafting time (with syn): 3.8 hours

⏳ COMPLETION ESTIMATE:
   Days to completion: 240.2
   Estimated completion: 2026-03-20 18:08
```

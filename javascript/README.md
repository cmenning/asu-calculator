# ASU Calculator - Web Version

React-based web implementation of the ASU Time Calculator with full feature parity to the Python version.

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm test
```

## Features

This web application provides all the functionality of the Python version:

- **Real-time calculations** with instant updates as you modify inventory
- **Collection rate tracking** based on start date and current progress
- **Bag crafting progress** with visual progress bars
- **Remaining requirements** for tech scraps, MTC, and scavenging time
- **Bag crafter service** calculations with cost analysis
- **Completion estimates** based on your actual collection rate
- **Local storage persistence** - your data is saved automatically
- **Mobile-responsive design** - works on all devices

## Project Structure

```
src/
├── components/
│   ├── InventoryForm.jsx       # Input form for all inventory items
│   └── ResultsDisplay.jsx      # Comprehensive results display
├── utils/
│   ├── bagCrafting.js         # Bag crafting calculations
│   ├── calculations.js        # Core calculation utilities
│   ├── calculator.js          # Main orchestration logic
│   ├── dateUtils.js           # Date and time utilities
│   ├── scavenging.js          # Scavenging mechanics
│   └── storage.js             # Local storage management
├── config/
│   └── gameConfig.js          # Game constants and configuration
├── __tests__/
│   └── calculations.test.js   # Test suite
├── App.jsx                    # Main application component
├── main.jsx                   # React entry point
├── App.css                    # Component styles
└── index.css                  # Global styles
```

## Implementation Status

✅ **Complete and Functional**
- All utility functions ported from Python implementation
- Full inventory input form with validation
- Comprehensive results display with all sections
- Local storage persistence
- Collection rate tracking and completion estimates
- Bag crafter service calculations
- Responsive styling
- Test suite

## Technology Stack

- **React 18** - UI framework with hooks
- **Vite** - Fast build tool and dev server
- **Vitest** - Testing framework
- **Vanilla CSS** - Custom styling with CSS Grid and Flexbox
- **Local Storage API** - Client-side data persistence

## Usage

1. **Enter your inventory** - Input current amounts of all resources and bags
2. **Set start date** - Enable collection rate tracking (optional)
3. **View results** - Real-time calculations update as you type
4. **Track progress** - Monitor your collection rate and completion estimates
5. **Compare options** - See traditional crafting vs bag crafter service costs

## Data Persistence

Your inventory data is automatically saved to browser local storage and restored when you return to the application. No server or account required.

## Deployment

The built application can be deployed to any static hosting service:
- GitHub Pages
- Netlify
- Vercel
- Surge.sh

```bash
npm run build  # Creates dist/ folder for deployment
```

import { useState, useEffect } from 'react'
import { loadInventory, saveInventory, validateInventory } from './utils/storage.js'
import { calculateResultsData } from './utils/calculator.js'
import InventoryForm from './components/InventoryForm.jsx'
import ResultsDisplay from './components/ResultsDisplay.jsx'
import './App.css'

function App() {
  const [inventory, setInventory] = useState(() => loadInventory())
  const [results, setResults] = useState(null)
  const [estimateCompletion, setEstimateCompletion] = useState(true)

  // Calculate results whenever inventory changes
  useEffect(() => {
    const validatedInventory = validateInventory(inventory)
    const calculatedResults = calculateResultsData(validatedInventory)
    setResults(calculatedResults)
    saveInventory(validatedInventory)
  }, [inventory])

  const handleInventoryChange = (field, value) => {
    setInventory(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>🎒 ASU Calculator</h1>
        <p>Web-based ASU crafting calculator with real-time updates. Brought to you by Soreven.</p>
      </header>
      
      <main>
        <div className="calculator-container">
          <InventoryForm 
            inventory={inventory} 
            onInventoryChange={handleInventoryChange}
            estimateCompletion={estimateCompletion}
            onEstimateCompletionChange={setEstimateCompletion}
          />
          
          <ResultsDisplay results={results} estimateCompletion={estimateCompletion} inventory={inventory} />
        </div>
      </main>
    </div>
  )
}

export default App

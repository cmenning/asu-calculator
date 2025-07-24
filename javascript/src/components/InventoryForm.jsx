import { useState } from 'react';
import { getBestScavZone } from '../utils/scavenging.js';
import { SCAVENGING } from '../config/gameConfig.js';

const InputGroup = ({ label, field, value, placeholder = "0", onChange, error, formatNumber }) => {
  const isOverLimit = field !== 'bitcoin' && value > 10000;
  
  return (
    <div className="input-group">
      <label htmlFor={field}>{label}:</label>
      <input
        key={field}
        id={field}
        type="text"
        value={formatNumber(value)}
        onChange={(e) => {
          const numericValue = e.target.value.replace(/,/g, '');
          onChange(field, numericValue);
        }}
        placeholder={placeholder}
        className={error ? 'error' : (isOverLimit ? 'warning' : '')}
      />
      {isOverLimit && <span className="warning-symbol">⚠️</span>}
      {error && <span className="error-message">{error}</span>}
    </div>
  );
};

const InventoryForm = ({ inventory, onInventoryChange, estimateCompletion, onEstimateCompletionChange }) => {
  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
    
    // Validate numeric fields
    if (field !== 'start_date') {
      const numValue = parseInt(value) || 0;
      if (field === 'scav_level') {
        if (numValue < 1 || numValue > 1000) {
          setErrors(prev => ({ ...prev, [field]: 'Scav level must be between 1 and 1000' }));
          return;
        }
      } else if (numValue < 0) {
        setErrors(prev => ({ ...prev, [field]: 'Value cannot be negative' }));
        return;
      }
      onInventoryChange(field, numValue);
    } else {
      onInventoryChange(field, value);
    }
  };

  const formatNumber = (value) => {
    return value ? value.toLocaleString() : '0';
  };

  return (
    <div className="inventory-form">
      <h2>📦 Current Inventory</h2>
      
      <div className="form-section">
        <h3>🔧 Raw Resources</h3>
        <InputGroup label="Tech Scraps" field="tech_scraps" value={inventory.tech_scraps} onChange={handleChange} error={errors.tech_scraps} formatNumber={formatNumber} />
        <InputGroup label="Tech Scrap Clusters" field="tech_scrap_clusters" value={inventory.tech_scrap_clusters} onChange={handleChange} error={errors.tech_scrap_clusters} formatNumber={formatNumber} />
        <InputGroup label="Med Tech" field="med_tech" value={inventory.med_tech} onChange={handleChange} error={errors.med_tech} formatNumber={formatNumber} />
        <InputGroup label="Med Tech Clusters" field="med_tech_clusters" value={inventory.med_tech_clusters} onChange={handleChange} error={errors.med_tech_clusters} formatNumber={formatNumber} />
        <InputGroup label="Bitcoin" field="bitcoin" value={inventory.bitcoin} onChange={handleChange} error={errors.bitcoin} formatNumber={formatNumber} />
      </div>

      <div className="form-section">
        <h3>🎒 Crafted Bags</h3>
        <InputGroup label="Old Pouches" field="old_pouches" value={inventory.old_pouches} onChange={handleChange} error={errors.old_pouches} formatNumber={formatNumber} />
        <InputGroup label="Fanny Packs" field="fanny_packs" value={inventory.fanny_packs} onChange={handleChange} error={errors.fanny_packs} formatNumber={formatNumber} />
        <InputGroup label="Explorer Backpacks" field="explorer_backpacks" value={inventory.explorer_backpacks} onChange={handleChange} error={errors.explorer_backpacks} formatNumber={formatNumber} />
        <InputGroup label="Employee Office Cases" field="employee_office_cases" value={inventory.employee_office_cases} onChange={handleChange} error={errors.employee_office_cases} formatNumber={formatNumber} />
        <InputGroup label="ASUs" field="asus" value={inventory.asus} onChange={handleChange} error={errors.asus} formatNumber={formatNumber} />
      </div>

      <div className="form-section">
        <h3>🏔️ Scav Zone</h3>
        <div className="input-group">
          <label htmlFor="scav_level">Your Scav Level:</label>
          <div className="level-input-container">
            <input
              id="scav_level"
              type="text"
              value={formatNumber(inventory.scav_level)}
              onChange={(e) => {
                const numericValue = e.target.value.replace(/,/g, '');
                handleChange('scav_level', numericValue);
              }}
              placeholder="1"
              className={errors.scav_level ? 'error' : ''}
            />
            <div className="level-arrows">
              <button 
                type="button" 
                className="level-arrow up" 
                onClick={() => handleChange('scav_level', Math.min(1000, (inventory.scav_level || 1) + 1))}
              >
                ▲
              </button>
              <button 
                type="button" 
                className="level-arrow down" 
                onClick={() => handleChange('scav_level', Math.max(1, (inventory.scav_level || 1) - 1))}
              >
                ▼
              </button>
            </div>
          </div>
          {errors.scav_level && <span className="error-message">{errors.scav_level}</span>}
        </div>
        {(() => {
          const bestZone = getBestScavZone(inventory.scav_level || 1);
          const expectedPerRun = Math.round(SCAVENGING.max_units_per_run * bestZone.expectedYield);
          return (
            <div className="scav-zone-info">
              Your best scav zone: {bestZone.level}<br/>
              Expected med tech per full run: {expectedPerRun}
            </div>
          );
        })()}
      </div>

      <div className="form-section">
        <h3>💰 Bag Buying</h3>
        <InputGroup label="Dora Cost (MTC)" field="dora_cost_mtc" value={inventory.dora_cost_mtc} onChange={handleChange} error={errors.dora_cost_mtc} formatNumber={formatNumber} />
      </div>

      <div className="form-section">
        <h3>📅 Collection Tracking</h3>
        <div className="input-group">
          <label htmlFor="estimate_completion">Estimate completion date:</label>
          <div className="toggle-slider" onClick={() => onEstimateCompletionChange(!estimateCompletion)}>
            <div className={`toggle-track ${estimateCompletion ? 'active' : ''}`}>
              <div className="toggle-thumb"></div>
            </div>
          </div>
        </div>
        {estimateCompletion && (
          <div className="input-group">
            <label htmlFor="start_date">Start Date:</label>
            <input
              id="start_date"
              type="date"
              value={inventory.start_date || ''}
              onChange={(e) => handleChange('start_date', e.target.value)}
            />
            <small>Date when you started collecting resources for this ASU (assumes starting from zero)</small>
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryForm;
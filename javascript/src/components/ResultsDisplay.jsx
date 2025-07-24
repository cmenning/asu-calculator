import { hoursToDays, calculateScavTime } from '../utils/scavenging.js';
import { CONVERSIONS } from '../config/gameConfig.js';

const ResultsDisplay = ({ results, estimateCompletion, inventory }) => {
  if (!results) return null;

  const formatNumber = (num) => Math.round(num).toLocaleString();
  const formatDecimal = (num, decimals = 1) => {
    if (num === undefined || num === null) return '0.0';
    return num.toFixed(decimals);
  };
  const formatTime = (hours, label = 'hours') => {
    if (!hours || hours <= 0) return 'None needed';
    const days = hoursToDays(hours);
    return `${formatDecimal(hours)} hours (${formatDecimal(days)} days)`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Unknown';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const SectionHeader = ({ emoji, title }) => (
    <h3 className="section-header">{emoji} {title}</h3>
  );

  return (
    <div className="results-display">
      {/* Total Requirements */}
      <div className="results-section">
        <SectionHeader emoji="📋" title="TOTAL REQUIREMENTS" />
        <div className="requirement-item">
          <span>Tech Scraps:</span>
          <span>{formatNumber(results.total_requirements.tech_scraps)}</span>
        </div>
        <div className="requirement-item">
          <span>Bitcoin:</span>
          <span>{formatNumber(results.total_requirements.bitcoin)}</span>
        </div>
        <div className="requirement-item">
          <span>Employee Office Cases:</span>
          <span>{results.total_requirements.employee_office_cases}</span>
        </div>
      </div>

      {/* Collection Rate */}
      {estimateCompletion && results.collection_rate && (
        <div className="results-section">
          <SectionHeader emoji="📈" title="YOUR COLLECTION RATE" />
          <div className="requirement-item">
            <span>Days elapsed:</span>
            <span>{formatDecimal(results.collection_rate.days_elapsed)}</span>
          </div>
          <div className="requirement-item">
            <span>Tech scrap collected (equivalent):</span>
            <span>{formatNumber(results.collection_rate.tech_scrap_collected)}</span>
          </div>
          <div className="requirement-item">
            <span>Average per day:</span>
            <span>{formatNumber(results.collection_rate.daily_rate)} tech scraps/day</span>
          </div>
          <div className="requirement-item">
            <span>Estimated scav runs per day:</span>
            <span>{formatDecimal(results.collection_rate.scav_runs_per_day)}</span>
          </div>
        </div>
      )}

      {/* Completion Estimate */}
      {estimateCompletion && results.completion_estimate && (
        <div className="results-section">
          <SectionHeader emoji="⏳" title="COMPLETION ESTIMATE" />
          <div className="requirement-item">
            <span>Days to completion:</span>
            <span>{formatDecimal(results.completion_estimate.days_to_completion)}</span>
          </div>
          <div className="requirement-item">
            <span>Estimated completion:</span>
            <span>{formatDate(results.completion_estimate.completion_date)}</span>
          </div>
        </div>
      )}

      {/* Bag Crafting Progress */}
      <div className="results-section">
        <SectionHeader emoji="🎒" title="BAG CRAFTING PROGRESS" />
        <div className="requirement-item progress-item">
          <span>ASU Progress:</span>
          <div className="progress-container">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${Math.min((results.eoc_progress / results.total_requirements.employee_office_cases) * 100, 100)}%` }}
              ></div>
              <span className="progress-text">{formatDecimal((results.eoc_progress / results.total_requirements.employee_office_cases) * 100)}% complete</span>
            </div>
          </div>
        </div>
        <div className="requirement-item">
          <span>Employee Office Cases:</span>
          <span>{formatDecimal(results.eoc_progress)} / {results.total_requirements.employee_office_cases}</span>
        </div>
      </div>

      {/* Remaining Gathering Requirements */}
      <div className="results-section">
        <SectionHeader emoji="⏰" title="REMAINING GATHERING REQUIREMENTS" />
        <div className="requirement-item">
          <span>Tech Scraps:</span>
          <span>{formatNumber(results.remaining_gathering.tech_scraps)}</span>
        </div>
        <div className="requirement-item">
          <span>Med Tech Clusters (MTC):</span>
          <span>{formatDecimal(results.remaining_gathering.mtc_needed)}</span>
        </div>
        {results.remaining_gathering.scav_time && (
          <>
            <div className="requirement-item">
              <span>Scav Time (without syn):</span>
              <span>{formatTime(results.remaining_gathering.scav_time.hours_no_syn)}</span>
            </div>
            <div className="requirement-item">
              <span>Scav Time (with syn):</span>
              <span>{formatTime(results.remaining_gathering.scav_time.hours_with_syn)}</span>
            </div>
          </>
        )}
      </div>

      {/* Remaining Bags to Craft */}
      <div className="results-section">
        <SectionHeader emoji="🔨" title="REMAINING BAGS TO CRAFT" />
        <div className="requirement-item">
          <span>Old Pouches:</span>
          <span>{formatNumber(results.remaining_bags.old_pouches)}</span>
        </div>
        <div className="requirement-item">
          <span>Fanny Packs:</span>
          <span>{formatNumber(results.remaining_bags.fanny_packs)}</span>
        </div>
        <div className="requirement-item">
          <span>Explorer's Backpacks:</span>
          <span>{formatNumber(results.remaining_bags.explorer_backpacks)}</span>
        </div>
        <div className="requirement-item">
          <span>Employee Office Cases:</span>
          <span>{formatNumber(results.remaining_bags.employee_office_cases)}</span>
        </div>
        <div className="requirement-item">
          <span>ASUs:</span>
          <span>{formatNumber(results.remaining_bags.asus)}</span>
        </div>
        <div className="divider">---</div>
        <div className="requirement-item">
          <span>Total crafting time (without syn):</span>
          <span>{formatTime(results.crafting_totals.time_hours)}</span>
        </div>
        <div className="requirement-item">
          <span>Total crafting time (with syn):</span>
          <span>{formatTime(results.crafting_totals.time_hours_syn)}</span>
        </div>
        <div className="requirement-item">
          <span>Total crafting BTC:</span>
          <span>{formatNumber(results.crafting_totals.btc)}</span>
        </div>
      </div>

      {/* Bag Buying */}
      <div className="results-section">
        <SectionHeader emoji="💰" title="BAG BUYING" />
        <div className="requirement-item">
          <span>Doras still needed:</span>
          <span>{formatNumber(results.bag_crafter_service.doras_still_needed)}</span>
        </div>

        <div className="requirement-item">
          <span>Doras you can craft:</span>
          <span>{formatNumber(results.bag_crafter_service.doras_you_can_craft)}</span>
        </div>
        <div className="requirement-item">
          <span>Doras to buy:</span>
          <span>{formatNumber(results.bag_crafter_service.doras_to_buy)}</span>
        </div>
        {results.bag_crafter_service.doras_to_buy > 0 && (() => {
          // Calculate MTC on hand and to be scavenged
          const currentMedTech = Number(inventory?.med_tech || 0);
          const currentMtc = Number(inventory?.med_tech_clusters || 0);
          const doraCostMtc = Number(inventory?.dora_cost_mtc || 20);
          console.log('Debug MTC calc:', { currentMedTech, currentMtc, inventory, CONVERSIONS });
          const mtcOnHand = currentMtc + (currentMedTech / CONVERSIONS.med_tech_per_cluster);
          const mtcToScavenge = Math.max(0, results.bag_crafter_service.mtc_cost - mtcOnHand);
          
          // Calculate scav time and BTC clustering based on mtc_to_scavenge
          const medTechToScavenge = mtcToScavenge * CONVERSIONS.med_tech_per_cluster;
          const scavTimeForMtc = medTechToScavenge > 0 ? calculateScavTime(medTechToScavenge, inventory?.scav_level || 1) : null;
          const btcForClustering = mtcToScavenge * CONVERSIONS.cluster_cost_mtc;
          
          return (
            <>
              <div className="requirement-item">
                <span>MTC cost for purchase ({doraCostMtc} MTC each):</span>
                <span>{formatNumber(results.bag_crafter_service.mtc_cost)} MTC</span>
              </div>
              <div className="requirement-item indent">
                <span>MTC on hand (including med tech):</span>
                <span>{formatDecimal(mtcOnHand)}</span>
              </div>
              <div className="requirement-item indent">
                <span>Total MTC to be scavenged:</span>
                <span>{formatDecimal(mtcToScavenge)}</span>
              </div>
              <div className="requirement-item indent">
                <span>BTC for clustering:</span>
                <span>{formatNumber(btcForClustering)} BTC</span>
              </div>
              {scavTimeForMtc && (
                <>
                  <div className="requirement-item indent">
                    <span>Scav Time (without syn):</span>
                    <span>{formatTime(scavTimeForMtc.hours_no_syn)}</span>
                  </div>
                  <div className="requirement-item indent">
                    <span>Scav Time (with syn):</span>
                    <span>{formatTime(scavTimeForMtc.hours_with_syn)}</span>
                  </div>
                </>
              )}
              {results.bag_crafter_service.after_buying_doras && (
                <>
                  <div className="requirement-item">
                    <span>After buying Doras:</span>
                    <span></span>
                  </div>
                  <div className="requirement-item indent">
                    <span>Total BTC needed:</span>
                    <span>{formatNumber(results.bag_crafter_service.after_buying_doras.btc_needed)} BTC</span>
                  </div>
                  <div className="requirement-item indent">
                    <span>Crafting time (without syn):</span>
                    <span>{formatTime(results.bag_crafter_service.after_buying_doras.crafting_time_hours)}</span>
                  </div>
                  <div className="requirement-item indent">
                    <span>Crafting time (with syn):</span>
                    <span>{formatTime(results.bag_crafter_service.after_buying_doras.crafting_time_hours_syn)}</span>
                  </div>
                </>
              )}
            </>
          );
        })()}
      </div>

    </div>
  );
};

export default ResultsDisplay;
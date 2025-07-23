// Date and completion estimation utilities

/**
 * Estimate completion date based on remaining requirements and collection rate
 * @param {number} remainingTechScraps - Remaining tech scraps needed
 * @param {number} dailyCollectionRate - Daily collection rate
 * @returns {Date|null} Estimated completion date or null if rate is 0
 */
export function estimateCompletionDate(remainingTechScraps, dailyCollectionRate) {
  if (dailyCollectionRate <= 0) {
    return null;
  }
  
  const daysRemaining = remainingTechScraps / dailyCollectionRate;
  const completionDate = new Date();
  completionDate.setDate(completionDate.getDate() + daysRemaining);
  
  return completionDate;
}

/**
 * Calculate days elapsed since start date
 * @param {string} startDateString - Start date in ISO format
 * @returns {number} Days elapsed
 */
export function calculateDaysElapsed(startDateString) {
  if (!startDateString) {
    return 0;
  }
  
  try {
    const startDate = new Date(startDateString);
    const now = new Date();
    const diffTime = now.getTime() - startDate.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    
    return Math.max(0, diffDays);
  } catch (error) {
    console.warn('Invalid start date:', startDateString);
    return 0;
  }
}

/**
 * Format date for display
 * @param {Date} date - Date to format
 * @returns {string} Formatted date string
 */
export function formatDate(date) {
  if (!date || !(date instanceof Date)) {
    return 'Invalid date';
  }
  
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
}

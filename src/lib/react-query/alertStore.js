import { useState, useEffect } from 'react';

let listeners = [];
let alerts = [];
let debounceTimeout = null;

/**
 * Generates a clean, human-readable bulleted breakdown from the tracked violations map.
 * @param {Object} registry - The accumulated violations dictionary.
 * @returns {string} Formatted markdown string.
 */
function compileEnrichedDescription(registry) {
  let summary = `The following distinct field validation failures were captured across records:\n`;
  
  Object.entries(registry).forEach(([field, meta]) => {
    summary += `\n• Field [${field}]: Found ${meta.count} occurrence(s) of [${meta.type}].`;
  });
  
  return summary;
}

export const alertStore = {
  getAlerts() {
    return alerts;
  },

  addAlert(alert) {
    const signature = alert.signature || `${alert.title}:${alert.variant}`;
    const existingIndex = alerts.findIndex(a => a.signature === signature);

    // Incoming field payload tracking descriptors
    const targetField = alert.metaField || 'unknown_field';
    const targetType = alert.metaType || 'generic_error';

    if (existingIndex !== -1) {
      const existing = alerts[existingIndex];
      
      // Initialize or update the sub-registry for granular field tracking
      const updatedRegistry = { ...(existing.violationsRegistry || {}) };
      if (!updatedRegistry[targetField]) {
        updatedRegistry[targetField] = { type: targetType, count: 0 };
      }
      updatedRegistry[targetField].count += 1;

      alerts = [...alerts];
      const nextCount = (existing.count || 1) + 1;

      alerts[existingIndex] = {
        ...existing,
        count: nextCount,
        violationsRegistry: updatedRegistry,
        // Dynamically compute the clean, informative markdown list description
        description: compileEnrichedDescription(updatedRegistry)
      };
    } else {
      // First time seeing this policy fingerprint signature
      const id = Math.random().toString(36).substring(2, 9);
      const initialRegistry = {
        [targetField]: { type: targetType, count: 1 }
      };

      alerts = [...alerts, { 
        ...alert, 
        id, 
        signature, 
        count: 1,
        violationsRegistry: initialRegistry,
        description: compileEnrichedDescription(initialRegistry)
      }];
    }

    if (alerts.length > 50) {
      alerts = alerts.slice(alerts.length - 50);
    }

    // Frame-rate throttle re-renders (Strategy A)
    if (debounceTimeout) clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
      listeners.forEach(listener => listener(alerts));
    }, 16);

    return signature;
  },

  removeAlert(id) {
    alerts = alerts.filter(a => a.id !== id);
    listeners.forEach(listener => listener(alerts));
  },

  subscribe(listener) {
    listeners.push(listener);
    return () => {
      listeners = listeners.filter(l => l !== listener);
    };
  }
};

export function useAlerts() {
  const [currentAlerts, setCurrentAlerts] = useState(alerts);

  useEffect(() => {
    return alertStore.subscribe((newAlerts) => {
      setCurrentAlerts(newAlerts);
    });
  }, []);

  return {
    alerts: currentAlerts,
    addAlert: alertStore.addAlert,
    removeAlert: alertStore.removeAlert
  };
}

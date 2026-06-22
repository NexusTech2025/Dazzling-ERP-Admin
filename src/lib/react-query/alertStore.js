import { useState, useEffect } from 'react';

let listeners = [];
let alerts = [];

export const alertStore = {
  getAlerts() {
    return alerts;
  },
  addAlert(alert) {
    const id = Math.random().toString(36).substring(2, 9);
    // Dedup: ignore exactly identical alerts if already shown
    const isDuplicate = alerts.some(a => 
      (a.title || '') === (alert.title || '') && 
      (a.description || '') === (alert.description || '')
    );
    if (isDuplicate) {
      return null;
    }
    let updatedAlerts = [...alerts, { ...alert, id }];
    if (updatedAlerts.length > 50) {
      updatedAlerts = updatedAlerts.slice(updatedAlerts.length - 50);
    }
    alerts = updatedAlerts;
    listeners.forEach(listener => listener(alerts));
    return id;
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

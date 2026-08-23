'use client';

// Lightweight client-side instrumentation for asset failures.
// Collects image/video load errors and exposes a small queue.

type LogItem = {
  ts: number;
  type: 'image' | 'video' | 'other';
  src: string;
  message?: string;
};

const QUEUE_KEY = 'site:assetLogs';

declare global {
  interface Window {
    __reefsideAssetDiagnostics?: {
      logAssetFailure: (item: LogItem) => void;
      getAssetLogs: () => LogItem[];
      clearAssetLogs: () => void;
    };
  }
}

export function logAssetFailure(item: LogItem) {
  try {
    const list = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]') as LogItem[];
    list.push(item);
    localStorage.setItem(QUEUE_KEY, JSON.stringify(list.slice(-200)));
    console.warn('Instrumentation: asset failure', item);
  } catch {}
}

export function getAssetLogs() {
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]') as LogItem[];
  } catch {
    return [];
  }
}

export function clearAssetLogs() {
  try {
    localStorage.removeItem(QUEUE_KEY);
  } catch {}
}

const assetInstrumentation = { logAssetFailure, getAssetLogs, clearAssetLogs };

if (typeof window !== 'undefined') {
  window.__reefsideAssetDiagnostics = assetInstrumentation;
}

export default assetInstrumentation;

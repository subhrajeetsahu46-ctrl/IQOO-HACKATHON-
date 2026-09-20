/**
 * Trigger mobile vibration haptics if supported by browser/device.
 * Fails silently if vibration is not supported or permission denied.
 */
export function triggerHaptic(type: 'light' | 'medium' | 'success' | 'warning' | 'error' = 'light') {
  if (typeof window === 'undefined' || !navigator.vibrate) return;

  try {
    switch (type) {
      case 'light':
        navigator.vibrate(12);
        break;
      case 'medium':
        navigator.vibrate(28);
        break;
      case 'success':
        navigator.vibrate([15, 40, 25]);
        break;
      case 'warning':
        navigator.vibrate([25, 30, 25]);
        break;
      case 'error':
        navigator.vibrate([40, 50, 40, 50, 40]);
        break;
    }
  } catch {
    // Ignore iframe vibration restrictions
  }
}

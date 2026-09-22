export function installInstructions(ua = '') {
  if (/iphone|ipad|ipod/i.test(ua)) {
    return 'In Safari, tap Share, then Add to Home Screen. The Vuna icon opens the installed app.'
  }
  if (/android/i.test(ua)) {
    return 'Tap the browser menu, then Install app or Add to Home screen. Vuna downloads onto this phone.'
  }
  return 'Use the install icon in the address bar, or the browser menu, then choose Install Vuna.'
}

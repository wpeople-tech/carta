// Minimal MV3 service worker — required by manifest
chrome.runtime.onInstalled.addListener(() => {
  console.log('[CARTA] Extension installed')
})

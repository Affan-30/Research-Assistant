// background.js

chrome.runtime.onInstalled.addListener(() => {
  // This ensures the side panel opens when the user clicks the extension icon
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
  console.log("Side panel behavior set!");
});

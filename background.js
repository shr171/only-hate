chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(["blockedChannels", "hideMethod"], (data) => {
    if (!data.blockedChannels) {
      chrome.storage.local.set({ blockedChannels: [] });
    }
    if (!data.hideMethod) {
      chrome.storage.local.set({ hideMethod: "hide" }); // Default to hiding videos
    }
  });

  // Set up alarm for periodic checks
  chrome.alarms.create("periodicCheck", { periodInMinutes: 5 });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url.includes("youtube.com")) {
    console.log("Sending message to content script in tab:", tabId);
    chrome.tabs.sendMessage(tabId, { action: "applyBlockedChannels" });
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "updateBlockedChannels") {
    chrome.tabs.query({ url: "*://*.youtube.com/*" }, (tabs) => {
      tabs.forEach((tab) => {
        console.log("Sending message to content script in tab:", tab.id);
        chrome.tabs.sendMessage(tab.id, { action: "applyBlockedChannels" });
      });
    });
  }
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "periodicCheck") {
    chrome.tabs.query({ url: "*://*.youtube.com/*" }, (tabs) => {
      tabs.forEach((tab) => {
        console.log("Sending message to content script in tab:", tab.id);
        chrome.tabs.sendMessage(tab.id, { action: "applyBlockedChannels" });
      });
    });
  }
});

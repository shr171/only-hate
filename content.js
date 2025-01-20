console.log("Content script loaded");

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Message received in content script:", request);
  if (request.action === "applyBlockedChannels") {
    applyBlockedChannels().catch(console.error);
  }
  return true; // Indicates that sendResponse will be called asynchronously
});

async function applyBlockedChannels() {
  try {
    const data = await chrome.storage.local.get("blockedChannels");
    const blockedChannels = data.blockedChannels || [];
    const videoItems = document.querySelectorAll(
      "ytd-rich-item-renderer, ytd-compact-video-renderer, ytd-grid-video-renderer"
    );

    videoItems.forEach((item) => {
      const channelLink = item.querySelector(
        "yt-formatted-string.ytd-channel-name a"
      );
      if (channelLink) {
        const channelUrl = channelLink.href;
        const username = channelUrl.split("/").pop();
        if (blockedChannels.includes(username)) {
          item.style.display = "none";
        } else {
          item.style.display = "";
        }
      }
    });
  } catch (error) {
    console.error("Error applying blocked channels:", error);
  }
}

// Initial application on page load
applyBlockedChannels().catch(console.error);

// Set up a MutationObserver to watch for dynamically added content
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.addedNodes.length) {
      applyBlockedChannels().catch(console.error);
    }
  });
});

observer.observe(document.body, { childList: true, subtree: true });

// Cleanup function
function cleanup() {
  if (observer) {
    observer.disconnect();
  }
  // Any other cleanup code...
}

// Listen for extension unload
window.addEventListener("unload", cleanup);

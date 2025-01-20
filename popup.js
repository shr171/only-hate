document.getElementById("addChannel").addEventListener("click", () => {
  const channelUsername = document
    .getElementById("channelUsername")
    .value.trim();
  if (channelUsername) {
    chrome.storage.local.get("blockedChannels", function (data) {
      const blockedChannels = data.blockedChannels || [];
      if (!blockedChannels.includes(channelUsername)) {
        blockedChannels.push(channelUsername);
        chrome.storage.local.set({ blockedChannels }, function () {
          displayBlockedChannels();
          document.getElementById("channelUsername").value = "";
        });
      }
    });
  }
});

function displayBlockedChannels() {
  chrome.storage.local.get("blockedChannels", function (data) {
    const blockedChannels = data.blockedChannels || [];
    const channelList = document.getElementById("channelList");
    channelList.innerHTML = "";
    blockedChannels.forEach((channel) => {
      const li = document.createElement("li");
      li.textContent = channel;
      const removeButton = document.createElement("button");
      removeButton.textContent = "Remove";
      removeButton.addEventListener("click", () => {
        removeChannel(channel);
      });
      li.appendChild(removeButton);
      channelList.appendChild(li);
    });
  });
}

function removeChannel(channel) {
  chrome.storage.local.get("blockedChannels", function (data) {
    let blockedChannels = data.blockedChannels || [];
    blockedChannels = blockedChannels.filter((c) => c !== channel);
    chrome.storage.local.set({ blockedChannels }, function () {
      displayBlockedChannels();
    });
  });
}

document.getElementById("exportData").addEventListener("click", () => {
  chrome.storage.local.get("blockedChannels", function (data) {
    const blockedChannels = data.blockedChannels || [];
    const blob = new Blob([JSON.stringify(blockedChannels, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "blockedChannels.json";
    a.click();
    URL.revokeObjectURL(url);
  });
});

document.getElementById("importDataBtn").addEventListener("click", () => {
  document.getElementById("importData").click();
});

document.getElementById("importData").addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      try {
        const blockedChannels = JSON.parse(e.target.result);
        chrome.storage.local.set({ blockedChannels }, function () {
          displayBlockedChannels();
        });
      } catch (error) {
        console.error("Error parsing JSON:", error);
      }
    };
    reader.readAsText(file);
  }
});

displayBlockedChannels();

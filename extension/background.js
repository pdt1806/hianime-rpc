var rpcStatus = false;
var appId = "";
var watching = false;
var title = "";
var url = "";
var titleTemp = "";

async function getStoredData() {
  return new Promise((resolve) => {
    chrome.storage.local.get(
      ["aniwatch_rpc_status", "aniwatch_appid"],
      function (result) {
        rpcStatus = result.aniwatch_rpc_status;
        if (!rpcStatus) {
          chrome.storage.local.set(
            { aniwatch_rpc_status: false },
            function () {}
          );
        }
        appId = result.aniwatch_appid;
        if (!appId) {
          chrome.storage.local.set({ aniwatch_appid: "" }, function () {});
        }
        resolve();
      }
    );
  });
}

chrome.runtime.onMessage.addListener(async (message) => {
  await getStoredData();
  title = message.title;
  url = message.url;
  if (rpcStatus && appId && !watching) {
    startRPC(true, message.title, message.url);
  }
});

chrome.tabs.onRemoved.addListener(async function () {
  stopRPC();
  if (title !== titleTemp && rpcStatus && appId && watching) {
    startRPC(false);
    startRPC(true, title, url);
  }
});

chrome.tabs.onUpdated.addListener(async function (tabId, changeInfo, tab) {
  if (changeInfo.status === "complete" && tab.active) {
    if (watching && !tab.url.includes("aniwatch.to/watch")) {
      stopRPC();
    } else if (
      tab.url.includes("aniwatch.to/watch") &&
      rpcStatus &&
      appId &&
      !watching &&
      !!url &&
      !!title
    ) {
      startRPC(true, title, url);
    }
  }
});

const stopRPC = async () => {
  var activeTab = false;
  var tabs = await chrome.tabs.query({});
  tabs.forEach(function (tab) {
    if (tab.url.includes("aniwatch.to/watch")) activeTab = true;
  });
  if (!activeTab) {
    startRPC(false);
  }
};

const startRPC = async (status, title = "", url = "") => {
  watching = status;
  titleTemp = title;
  const json = {
    status: status,
    title: title,
    url: url,
    appId: appId,
  };
  try {
    fetch("http://localhost:2021/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(json),
    });
  } catch (error) {
    console.log(error);
    return null;
  }
};

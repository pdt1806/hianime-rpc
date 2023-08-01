var rpcStatus = false;
var appId = "";
var watching = false;
var title = "";
var url = "";

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
  console.log(rpcStatus, appId, watching);
  if (rpcStatus && appId && !watching) {
    title = message.title;
    url = message.url;
    startRPC(true, message.title, message.url);
    watching = true;
  }
});

chrome.tabs.onRemoved.addListener(function () {
  watching = false;
  startRPC(false);
});

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (changeInfo.status === "complete" && tab.active) {
    console.log(tab.url);
    if (watching && !tab.url.includes("aniwatch.to/watch")) {
      watching = false;
      startRPC(false);
    } else if (
      tab.url.includes("aniwatch.to/watch") &&
      rpcStatus &&
      appId &&
      !watching &&
      !!url &&
      !!title
    ) {
      watching = true;
      startRPC(true, title, url);
    }
  }
});

const startRPC = async (status, title = "", url = "") => {
  console.log(status);
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

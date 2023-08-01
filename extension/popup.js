const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms || DEF_DELAY));
};

var rpcStatus;
var appId;

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

async function validateAppId() {
  let value = document.getElementById("appIdInput").value;
  const procedure = async (status) => {
    document.getElementById("appIdIndicator").classList.remove("hide");
    if (status) {
      document.getElementById("appIdIndicator").classList.add("green");
      document.getElementById("appIdIndicator").textContent = "Saved!";
    } else {
      document.getElementById("appIdIndicator").classList.add("red");
      document.getElementById("appIdIndicator").textContent = "Invalid App ID!";
    }
    await sleep(1000);
    document.getElementById("appIdIndicator").classList.add("hide");
  };
  if (
    (!value.length <= 19 && !value.length >= 17) ||
    !value.match(/^[0-9]+$/)
  ) {
    await procedure(false);
    return;
  }
  appId = value;
  chrome.storage.local.set({ aniwatch_appid: value }, function () {});
  await procedure(true);
}

const updateRPCStatus = async () => {
  var status = document.getElementById("rpcStatus").checked;
  chrome.storage.local.set({ aniwatch_rpc_status: status }, function () {});
  rpcStatus = status;
};

document.addEventListener("DOMContentLoaded", async () => {
  await getStoredData();
  if (rpcStatus) document.getElementById("rpcStatus").checked = rpcStatus;
  if (appId) document.getElementById("appIdInput").value = appId;
  document.querySelector("#saveAppId").addEventListener("click", validateAppId);
  document
    .querySelector("#rpcStatus")
    .addEventListener("click", updateRPCStatus);
});

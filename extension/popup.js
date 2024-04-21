const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms || DEF_DELAY));
};

var rpcStatus;

async function getStoredData() {
  return new Promise((resolve) => {
    chrome.storage.local.get(["hianime_rpc_status", "hianime_appid"], function (result) {
      rpcStatus = result.hianime_rpc_status;
      if (!rpcStatus) {
        chrome.storage.local.set({ hianime_rpc_status: false }, function () {});
      }

      resolve();
    });
  });
}

const updateRPCStatus = async () => {
  var status = document.getElementById("rpcStatus").checked;
  chrome.storage.local.set({ hianime_rpc_status: status }, function () {});
  rpcStatus = status;
};

document.addEventListener("DOMContentLoaded", async () => {
  await getStoredData();
  if (rpcStatus) document.getElementById("rpcStatus").checked = rpcStatus;
  document.querySelector("#rpcStatus").addEventListener("click", updateRPCStatus);
});

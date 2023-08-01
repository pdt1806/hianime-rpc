var watching = false;
var registered = false;
var RPC;

const cheerio = require("cheerio");
const axios = require("axios");

const DiscordRPC = require("discord-rpc");
RPC = new DiscordRPC.Client({ transport: "ipc" });

const express = require("express");
const app = express();
const port = 2021;

app.use((req, res, next) => {
  res.setHeader(
    "Access-Control-Allow-Origin",
    "chrome-extension://ombebikgpmfpkmmoglfpbgefcomjmfob"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});

app.use(express.json());

app.post("/", (req, res) => {
  runRpc(req.body);
  res.send("OK");
});

app.listen(port, () => {
  console.clear();
  console.log(
    `Aniwatch Discord Rich Presence Server listening on http://localhost:${port}`
  );
});

const runRpc = async (data) => {
  if (!data.status) {
    // TODO: turn off other tabs without turning off the rpc
    console.log("[RPC] Stopped!");
    if (watching) {
      try {
        RPC.clearActivity();
        watching = false;
      } catch (e) {
        console.log("An error occured while stopping RPC.");
      }
    }
    return;
  } else if (!!data.title && !watching) {
    watching = true;
    var title = data.title;
    var url = data.url;
    var appId = data.appId.toString().replace(" ", "");

    //

    if (!registered) {
      await DiscordRPC.register(appId);
      registered = true;
    }

    const time = Date.now();

    // await getEpisode(url);

    async function setActivity() {
      RPC.setActivity({
        details: `Watching ${title}`,
        startTimestamp: time,
        largeImageKey:
          "https://qph.cf2.quoracdn.net/main-qimg-51d20a352814adc74edda248a01f8b5d-lq",
        largeImageText: "Watching on Aniwatch.to",
        instance: false,
        buttons: [
          {
            label: "Watch with me!",
            url: url,
          },
        ],
      });
    }

    RPC.on("ready", () => {
      setActivity();
    });

    try {
      await RPC.login({ clientId: appId });
    } catch (e) {
      console.log("Invalid Application ID.");
    }
  }
};

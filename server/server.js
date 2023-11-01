var watching = false;
var registered = false;

const cheerio = require("cheerio");
const axios = require("axios");

const DiscordRPC = require("discord-rpc");
const RPC = new DiscordRPC.Client({ transport: "ipc" });

const express = require("express");
const app = express();
const port = 505;

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
    const getImageURL = async (url) => {
      const response = await await axios.request({
        method: "GET",
        url: url,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
        },
      });
      const data = cheerio.load(response.data);
      var imageURL = data(".film-poster-img");
      imageURL = imageURL["0"]["attribs"]["src"];
      return imageURL;
    };

    watching = true;
    var title = data.title;
    var url = data.url;
    var appId = data.appId.toString().replace(" ", "");

    if (!registered) {
      await DiscordRPC.register(appId);
      registered = true;
    }

    const imageURL = await getImageURL(url);

    async function setActivity() {
      RPC.setActivity({
        details: `Watching ${title}`,
        startTimestamp: new Date(),
        largeImageKey: imageURL,
        largeImageText: title,
        smallImageKey:
          "https://lh3.googleusercontent.com/pw/AIL4fc8KM5Y4Mz04sX_rAxSS8B7I4klceLU9ETvGfVYY-QGkuHyeiXimJ-fZgJNoZa4edF3Uyr7M2Ym5d6NDIp4ZxjL5EnVRE0FpCADShCFkgxDz6pdaqiI=w2400",
        smallImageText: "Aniwatch.to",
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
      console.log("[RPC] OK!");
      setActivity();
    });

    try {
      await RPC.login({ clientId: appId });
    } catch (e) {
      console.log("Invalid Application ID.");
    }
  }
};

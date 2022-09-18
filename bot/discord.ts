const axios = require("axios");
const Discord = require("discord.js");
const api = require(__dirname + "/api.ts");
const client = new Discord.Client({ intents: ["GUILDS", "GUILD_MESSAGES"] });

require("dotenv").config();

client.on("ready", async () => {
    console.log("Online");

    client.channels.cache
        .get(`${process.env.CHANNEL}`)
        .send(`https://discord.com/api/oauth2/authorize?response_type=token&client_id=${process.env.CLIENT}&scope=identify&redirect_uri=${process.env.SERVER}`);

    axios.get(`http://${process.env.SERVER}/api/update`);
    var cnt = 1;
    setInterval(async () => {
        axios.get(`http://${process.env.SERVER}/api/update`);
        console.log(`Updated: ${cnt}`);
        cnt++;
    }, 1000 * 60 * 60 * 12);
});
client.login(process.env.TOKEN);

export {};

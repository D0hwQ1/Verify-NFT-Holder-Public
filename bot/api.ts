const express = require("express");
const cors = require("cors");
const axios = require("axios");
const sqlite3 = require("sqlite3");
const Caver = require("caver-js-ext-kas");
const caver = new Caver("8217", "KASKNTPVQIRESVQIWRHOQS8G", "BJEkbNeSJqKORDwwLUFsd8-J78Tfsvt7x2LOr7tX");
var delay = (ms: any) => new Promise((resolve) => setTimeout(resolve, ms));

require("dotenv").config();
const contract = new caver.kct.kip17(process.env.GATSBY_ADDR);

const app = express();
app.use(cors());
app.use(express.static("files"));

const db = new sqlite3.Database(__dirname + "/../db/Users.db", sqlite3.OPEN_READWRITE, async (err: any) => {
    if (err) {
        console.log(err);
    } else {
        console.log("Users.db connected");
    }
});

app.get("/", function (_: any, res: any) {
    res.send("Hello World!");
});

app.get("/api/verify", async function (req: any, res: any) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    var discord = req.query.discord.toString();
    var addr = req.query.addr.toString();
    console.log(addr);

    try {
        db.run(`INSERT OR REPLACE INTO holder(discord, addr) VALUES('${discord}', '${addr}')`);
    } catch (e) {
        console.log(e);
    }

    try {
        await axios(`https://discord.com/api/guilds/${process.env.CHANNEL}/members/${discord}/roles/${process.env.ROLES}`, {
            method: "PUT",
            headers: {
                authorization: `Bot ${process.env.TOKEN}`,
            },
        });
        res.status(204).send("Success");
    } catch (e) {
        console.log(e);
        res.send("failed");
    }
});

app.get("/api/update", async function (req: any, res: any) {
    let tmp = req;
    let sql = `SELECT * FROM holder`;

    var holder: any = [];
    var addr: any = [];
    var max: any = 70;

    try {
        await db.all(sql, [], async (err: any, rows: any) => {
            if (err) {
                throw err;
            }

            for (var i = 0; i < rows.length; i++) {
                addr.push(rows[i]["addr"].toString());
                holder.push(rows[i]["discord"].toString());
            }

            var amount: any = [];
            if (holder.length > max) {
                for (var i = 0; i < Math.ceil(holder.length / max); i++) {
                    var arr = [];
                    if ((i + 1) * max > holder.length) {
                        if (holder.length % max == 0) {
                            for (var j = 0; j < max; j++) {
                                arr.push(addr[i * max + j]);
                            }
                        } else {
                            for (var j = 0; j < holder.length % max; j++) {
                                arr.push(addr[i * max + j]);
                            }
                        }
                    } else {
                        for (var j = 0; j < max; j++) {
                            arr.push(addr[i * max + j]);
                        }
                    }
                    var tmp = arr.map((data) => {
                        return contract.balanceOf(data);
                    });
                    var tmp = await Promise.all(tmp);
                    amount = amount.concat(tmp);

                    await delay(1200);
                }
            } else {
                var arr = [];
                for (var i = 0; i < holder.length; i++) {
                    arr.push(addr[i]);
                }

                var tmp = arr.map((data) => {
                    return contract.balanceOf(data);
                });
                amount = amount.concat(await Promise.all(tmp));
            }
            console.log(amount);

            for (var i = 0; i < amount.length; i++) {
                if (amount[i] >= 1) {
                    axios(`https://discord.com/api/guilds/${process.env.CHANNEL}/members/${holder[i]}/roles/${process.env.ROLES}`, {
                        method: "PUT",
                        headers: {
                            authorization: `Bot ${process.env.TOKEN}`,
                        },
                    }).catch(function () {});
                } else {
                    axios(`https://discord.com/api/guilds/${process.env.CHANNEL}/members/${holder[i]}/roles/${process.env.ROLES}`, {
                        method: "DELETE",
                        headers: {
                            authorization: `Bot ${process.env.TOKEN}`,
                        },
                    }).catch(function () {});
                }
                await delay(3000);
            }
            console.log("Success: Update roles");
            res.send("Success Update roles");
        });
    } catch (e) {
        console.log(e);
        res.send("Failed Update roles");
    }
});

app.listen(process.env.BACK_PORT, () => {
    console.log("Ready Express api");
});

export {};

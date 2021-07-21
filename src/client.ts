import * as Discord from "discord.js";

//
// Start the bot.
//
export function start_bot() {
    const client = new Discord.Client();

    client.on("ready", () => {
        if (client.user) {
            console.log(`Logged in as ${client.user.tag}!`);
        }
    });

    client.on("message", msg => {
        if (msg.author.bot || msg.content.length == 0 || msg.content[0] != "/") {
            return;
        }

        msg.author.send("Hey!");
    });

    if(process.env.DISCORD_BOT_TOKEN == undefined) {
        console.log("please set ENV: DISCORD_BOT_TOKEN");
        process.exit(0);
    }

    client.login(process.env.DISCORD_BOT_TOKEN);
}

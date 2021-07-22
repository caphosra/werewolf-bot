import * as Discord from "discord.js";
import { start_game } from "./game-manager";

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

        parse_args(client, msg);
    });

    if(process.env.DISCORD_BOT_TOKEN == undefined) {
        console.log("please set ENV: DISCORD_BOT_TOKEN");
        process.exit(0);
    }

    client.login(process.env.DISCORD_BOT_TOKEN);
}

function parse_args(client: Discord.Client, msg: Discord.Message) {
    const arg_regex = /^\/([^#\s]+)(\s+(.+))?/;
    const matched_arg = msg.content.match(arg_regex);

    if (!matched_arg) {
        return;
    }

    const param_name = matched_arg[1];
    const args = matched_arg[3];

    if (param_name == "wolf-start" || param_name == "ws") {
        start_game(client, msg, param_name, args);
    }
}

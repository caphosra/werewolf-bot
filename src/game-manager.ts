import * as Discord from "discord.js";

export function start_game(client: Discord.Client, msg: Discord.Message, param_name: string, args: string) {
    if (msg.channel.isText()) {
        let id = msg.channel.id;
        msg.reply(`ゲームを開始します! よろしくお願いします! (Channel ID: ${id})`);
    }
    else {
        msg.reply("DMには対応していないコマンドです!");
    }
}

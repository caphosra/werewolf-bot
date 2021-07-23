import * as Discord from "discord.js";
import * as Table from "./table";
import * as GM from "./game-manager";

const timeout = 30;

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

        parse_args(msg);
    });

    if(process.env.DISCORD_BOT_TOKEN == undefined) {
        console.log("please set ENV: DISCORD_BOT_TOKEN");
        process.exit(0);
    }

    client.login(process.env.DISCORD_BOT_TOKEN);
}

function is_game_started(msg: Discord.Message, showMessage: boolean): boolean {
    if (!GM.tables[msg.channel.id]) {
        if (showMessage) {
            msg.reply("まだこの卓ではゲームは始まっていません!");
        }
        return false;
    }
    else {
        return true;
    }
}

function call_start(msg: Discord.Message, args: string) {
    if (msg.channel.type == "text") {
        if (is_game_started(msg, false)) {
            msg.reply("今やっているゲームを終わらせてください!");
            return;
        }

        let start = GM.start_game(msg.channel.id, () => {
            msg.reply(`ごめんなさい。サーバー負荷の問題で${timeout}分経ったので強制終了させてもらいます。`);
            GM.close_game(msg.channel.id);
        }, timeout);

        if (!start) {
            msg.reply("今、他の卓が忙しいのでゲームを開始できません。");
        }
        else {
            msg.reply(`ゲームを開始します! よろしくお願いします! (Channel ID: ${msg.channel.id})\n:warning:サーバー負荷の問題で${timeout}分で強制終了します。注意してください!\nコマンドはここで確認を: https://github.com/capra314cabra/werewolf-bot/blob/master/README.md`);
        }
    }
    else {
        msg.reply("DMには対応していないコマンドです!");
    }
}

function call_info(msg: Discord.Message, args: string) {
    if (!is_game_started(msg, true)) {
        return;
    }

    let message = "今の状況はこんな感じです。";
    for (let count = 0; count < GM.tables[msg.channel.id].players.length; count++) {
        const player = GM.tables[msg.channel.id].players[count];
        message += `\n${player.death ? ":thinking:" : ":skull:"} ${player.name}`;
    }

    msg.reply(message);
}

function call_close(msg: Discord.Message, args: string) {
    if (!is_game_started(msg, true)) {
        return;
    }

    GM.close_game(msg.channel.id);

    msg.reply("ゲームは終了です。お疲れ様でした!");
}

function call_set(msg: Discord.Message, args: string) {
    if (!is_game_started(msg, true)) {
        return;
    }

    const arg_regex = /(.+)\s+(.+)/;
    const matched_arg = args.match(arg_regex);

    if (!matched_arg) {
        msg.reply("すみません。よくわかりません。");
        return;
    }

    const role_name = matched_arg[1];
    const role = Table.roleNumbers[role_name];

    if (!role) {
        msg.reply("ごめんなさい。その役職を知りません。");
        return;
    }

    const role_value = Number(matched_arg[2]);

    GM.add_role(msg.channel.id, role, role_value);

    msg.reply("役職を登録しました。");
}

function call_jobs(msg: Discord.Message, args: string) {
    if (!is_game_started(msg, true)) {
        return;
    }

    let message = "現在の役職の状況は、"
    for (const roleName in Table.roleNumbers) {
        const role = Table.roleNumbers[roleName];
        const value = GM.tables[msg.channel.id].roles[role];
        if (value) {
            message += `\n${roleName}が${value}人`;
        }
    }

    msg.reply(message);
}

function call_join(msg: Discord.Message, args: string) {
    if (!is_game_started(msg, true)) {
        return;
    }

    if (GM.tables[msg.channel.id].players.filter((player) => msg.author.id == player.id).length){
        msg.reply("もう既に登録しています。");
        return;
    }

    let player = new Table.Player();
    player.id = msg.author.id;
    player.name = msg.author.username;
    GM.tables[msg.channel.id].players.push(player);

    msg.reply(`${player.name}の参戦を受け付けました!`);
}

async function call_ready(msg: Discord.Message, args: string) {
    if (!is_game_started(msg, true)) {
        return;
    }

    GM.decide_role(msg.channel.id);

    for (const player of GM.tables[msg.channel.id].players) {
        let player_instance = await msg.client.users.fetch(player.id);
        player_instance.send(`あなたは${Table.roleNames[player.role]}です。`);

        if (player.role == Table.Role.WEREWOLF) {
            let wolfs = GM.tables[msg.channel.id].players
                .filter((player) => player.isWereWolf())
                .map((player) => `\"${player.name}\"`)
                .join(", ");
            msg.reply(`人狼は${wolfs}です。互いに意思疎通をするとよいでしょう。`)
        }
    }

    msg.reply("では、初日の朝になりました。\n昨日の夜、人狼の目撃情報が相次ぎました。誰が人狼なのでしょうか...\n心配ですね。");

    GM.tables[msg.channel.id].turn = 1;
    GM.tables[msg.channel.id].state = Table.TableState.DAYTIME;
}

function parse_args(msg: Discord.Message) {
    const arg_regex = /^w\/([^#\s]+)\s+(.+)?/;
    const matched_arg = msg.content.match(arg_regex);

    if (!matched_arg) {
        return;
    }

    const param_name = matched_arg[1];
    const args = matched_arg[2];

    if (param_name == "start") {
        call_start(msg, args);
    }

    if (param_name == "info") {
        call_info(msg, args);
    }

    if (param_name == "close") {
        call_close(msg, args);
    }

    if (param_name == "set") {
        call_set(msg, args);
    }

    if (param_name == "jobs") {
        call_jobs(msg, args);
    }

    if (param_name == "join") {
        call_join(msg, args);
    }

    if (param_name == "ready") {
        call_ready(msg, args);
    }

    //if (param_name == "vote") {
    //    call_vote(msg, args);
    //}

    //if (param_name == "exile") {
    //    call_exile(msg, args);
    //}

    //if (param_name == "select") {
    //    call_select(msg, args);
    //}
}

import * as Discord from "discord.js";
import * as Table from "./table";

let table_counter = 0;
export let tables: { [server_id: string]: Table.Table } = { };

const timeoutLimit = 30;
const tableLimit = 10;

function start_game(channel_id: string, onTimeout: () => void) {
    const table = new Table.Table();
    table.channel_id = channel_id;
    table.timeout = setTimeout(onTimeout, timeoutLimit * 60 * 1000);
    tables[channel_id] = table;
    table_counter++;
}

function close_game(channel_id: string) {
    const timeout = tables[channel_id].timeout;
    if (timeout) {
        clearTimeout(timeout);
    }
    delete tables[channel_id];
    table_counter--;
}

function add_role(channel_id: string, role: Table.Role, values: number) {
    tables[channel_id].roles[role] = values;
}

export function is_game_started(msg: Discord.Message, showMessage: boolean): boolean {
    if (!tables[msg.channel.id]) {
        if (showMessage) {
            msg.reply("まだこの卓ではゲームは始まっていません!");
        }
        return false;
    }
    else {
        return true;
    }
}

export function call_start_game(msg: Discord.Message, args: string) {
    if (msg.channel.type == "text") {
        if (table_counter >= tableLimit) {
            msg.reply("ごめんなさい。他の卓が忙しくてゲームを開始できません。もう少しお待ちを!");
            return;
        }

        if (is_game_started(msg, false)) {
            msg.reply("今やっているゲームを終わらせてください!");
            return;
        }

        msg.reply(`ゲームを開始します! よろしくお願いします! (Channel ID: ${msg.channel.id})\n:warning:サーバー負荷の問題で${timeoutLimit}分で強制終了します。注意してください!`);
        msg.reply("それでは役職の数を`/wolf-set`で使って私に教えてください。\n> ex.) `/wolf-set 人狼 2` `/ws 人狼 2`");
        msg.reply("現在追加されている役職は`/wolf-jobs`で確認できます。\n> ex.) `/wolf-jobs`");
        msg.reply("参加者は全員`/wolf-join`で私に教えてください。\n> ex.) `/wolf-join` `/wj`");
        msg.reply("準備が出来たら`/wolf-ready`で開始しましょう!\n> ex.) `/wolf-ready`");
        msg.reply("ゲームの終了は`/wolf-close`です。\n> ex.) `/wolf-close`");

        start_game(msg.channel.id, () => {
            msg.reply(`ごめんなさい。サーバー負荷の問題で${timeoutLimit}分経ったので強制終了させてもらいます。`);
            close_game(msg.channel.id);
        });
    }
    else {
        msg.reply("DMには対応していないコマンドです!");
    }
}

export function call_close_game(msg: Discord.Message, args: string) {
    if (!is_game_started(msg, true)) {
        return;
    }

    close_game(msg.channel.id);

    msg.reply("ゲームは終了です。お疲れ様でした!");
}

export function call_add_role(msg: Discord.Message, args: string) {
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
        let message = "私が知っている役職は、"
        for (const roleName in Table.roleNumbers) {
            message += `\n- \"${roleName}\"`;
        }
        msg.reply(message);
    }

    const role_value = Number(matched_arg[2]);

    add_role(msg.channel.id, role, role_value);

    msg.reply("役職を登録しました。");
}

export function call_jobs(msg: Discord.Message, args: string) {
    if (!is_game_started(msg, true)) {
        return;
    }

    let message = "現在の役職の状況は、"
    for (const roleName in Table.roleNumbers) {
        const role = Table.roleNumbers[roleName];
        message += `\n- ${roleName}が${tables[msg.channel.id].roles[role] ?? 0}人`;
    }
    message += "です。";

    msg.reply(message);
}

export function call_join(msg: Discord.Message, args: string) {
    if (!is_game_started(msg, true)) {
        return;
    }

    if (tables[msg.channel.id].players.filter((player) => msg.author.id == player.id)){
        msg.reply("もう既に登録しています。");
        return;
    }

    let player = new Table.Player();
    player.id = msg.author.id;
    player.name = msg.author.username;
    tables[msg.channel.id].players.push(player);

    msg.reply(`${player.name}の参戦を受け付けました!`);
}

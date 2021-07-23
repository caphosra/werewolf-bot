import * as Table from "./table";

let table_counter = 0;

export let tables: { [server_id: string]: Table.Table } = {};
export const tableLimit = 10;

export function start_game(channel_id: string, onTimeout: () => void, timeoutLimit: number): boolean {
    if (table_counter >= tableLimit) {
        return false;
    }
    else {
        const table = new Table.Table();
        table.channel_id = channel_id;
        table.timeout = setTimeout(onTimeout, timeoutLimit * 60 * 1000);
        tables[channel_id] = table;
        table_counter++;
        return true;
    }
}

export function close_game(channel_id: string) {
    const timeout = tables[channel_id].timeout;
    if (timeout) {
        clearTimeout(timeout);
    }
    delete tables[channel_id];
    table_counter--;
}

export function add_role(channel_id: string, role: Table.Role, values: number) {
    tables[channel_id].roles[role] = values;
}

function shuffle<T>(array: T[]) {
    const out = Array.from(array);
    for (let i = out.length - 1; i > 0; i--) {
        const r = Math.floor(Math.random() * (i + 1));
        const tmp = out[i];
        out[i] = out[r];
        out[r] = tmp;
    }
    return out;
}

export function decide_role(channel_id: string): boolean {
    const players = tables[channel_id].players;
    const roles = Object.entries(tables[channel_id].roles);

    let role_array: Table.Role[] = [];
    for (const [role_raw, value] of roles) {
        const role = Table.roleNumbers[role_raw];
        for (let count = 0; count < value; count++) {
            role_array.push(role);
        }
    }
    role_array = shuffle(role_array);

    if (players.length != role_array.length) {
        return false;
    }

    for (let count = 0; count < players.length; count++) {
        tables[channel_id].players[count].role = role_array[count];
    }

    return true;
}

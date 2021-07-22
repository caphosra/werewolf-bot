export enum Role {
    VILLAGER,
    WEREWOLF,
    MAD,
    FORTUNE_TELLER,
    PSYCHIC,
    KNIGHT
}

export const roleNames: { [role: number]: string } = {
    0: "村人",
    1: "人狼",
    2: "狂人",
    3: "占い師",
    4: "霊媒師",
    5: "騎士",
}

export const roleNumbers: { [roleName: string]: Role } = {
    "村人": 0,
    "人狼": 1,
    "狂人": 2,
    "占い師": 3,
    "霊媒師": 4,
    "騎士": 5,
}

export class Player {
    id: string = "";
    name: string = "";
    role: Role = Role.VILLAGER;
    death: boolean = false;
    done: boolean = true;

    isWereWolf(): boolean {
        return this.role == Role.WEREWOLF;
    }
}

export class Table {
    channel_id: string = "";
    turn: number = 0;
    roles: { [role: number]: number } = { };
    players: Player[] = [];
    timeout: NodeJS.Timeout | null = null;
}

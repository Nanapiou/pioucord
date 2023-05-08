declare module 'pioucord' {
    type ActivityData = {
        name: string,
        type: number
    }
    type PresenceData = {
        status?: "online" | "dnd" | "invisible" | "idle" | undefined;
        afk?: boolean | undefined;
        activities?: ActivityData[] | undefined;
    }

    type IntentResolvable = string[] | number

    interface ClientOptions {
        intents?: IntentResolvable;
        presence?: PresenceData;
        shards?: number[];
        shardsCount?: number | null;
        useRecommendedShardCount?: boolean;
        userBot?: boolean;
        apiVersion?: string;
    }

    interface WebSocket {
        on(event: string, listener: (data: any) => void): this;
    }

    interface Rest {
        get: (endpoint: string) => Promise<any>;
        post: (endpoint: string, data: object) => Promise<any> | void;
        patch: (endpoint: string, data: object) => Promise<any> | void;
        put: (endpoint: string, data: object) => Promise<any> | void;
        delete: (endpoint: string, data: object) => Promise<any>;
    }

    class Client{
        constructor(options: {
            intents?: IntentResolvable;
            presence?: PresenceData;
            shards?: number[];
            shardsCount?: number | null;
            useRecommendedShardCount?: boolean;
            userBot?: boolean;
            apiVersion?: string;
        });

        user: any;
        startedTimestamp: Date;
        ws: WebSocket;
        rest: Rest;
        login: (token: string) => void;
        setPresence: (presenceObject: PresenceData) => void;
        addGuildEvents: (guildId: string) => void;
        readonly uptime: Date;
        destroy: () => void;
    }

    export {Client, ClientOptions, PresenceData, IntentResolvable}
}
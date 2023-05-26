declare module 'pioucord' {
    interface ActivityData {
        name: string,
        type: number
    }
    interface PresenceData {
        status?: "online" | "dnd" | "invisible" | "idle";
        afk?: boolean;
        activities?: ActivityData[] ;
    }
    interface RestOptions {
        authPrefix?: "Bot" | "Bearer";
        version?: string
        baseUrl?: string
        token?: string
    }

    type IntentResolvable = string[] | number

    interface ClientOptions {
        intents?: IntentResolvable;
        presence?: PresenceData;
        shards?: number[];
        shardsCount?: number;
        useRecommendedShardCount?: boolean;
        userBot?: boolean;
        apiVersion?: string;
        api?: RestOptions;
    }

    interface WebSocket {
        on(event: string, listener: (data: unknown) => void): this;
    }

    interface Rest {
        get: (endpoint: string) => Promise<unknown>;
        post: (endpoint: string, data: object) => Promise<unknown> | void;
        patch: (endpoint: string, data: object) => Promise<unknown> | void;
        put: (endpoint: string, data?: object) => Promise<unknown> | void;
        delete: (endpoint: string, data?: object) => Promise<unknown>;
    }

    class Client{
        constructor(options: {
            intents?: IntentResolvable;
            presence?: PresenceData;
            shards?: number[];
            shardsCount?: number;
            useRecommendedShardCount?: boolean;
            userBot?: boolean;
            apiVersion?: string;
            api?: RestOptions;
        });

        user: unknown;
        startedTimestamp: Date;
        ws: WebSocket;
        rest: Rest;
        login: (token: string) => void;
        setPresence: (presenceObject: PresenceData) => void;
        addGuildEvents: (guildId: string) => void;
        readonly uptime: Date;
        destroy: () => void;
    }

    export {Client, ClientOptions, PresenceData, IntentResolvable, RestOptions}
}

declare module 'pioucord' {
    import { APIUser } from 'pioucord';
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

    type IntentResolvable = string | number | bigint | IntentResolvable[];

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
        on(event: string, listener: (data: {[key: string]: any}) => void): this;
    }

    class Rest {
        constructor(options: RestOptions);

        get: (endpoint: string, data?: {[key: string]: any}, reason?: string) => Promise<{[key: string]: any}>;
        post: (endpoint: string, data: {[key: string]: any}, reason?: string) => Promise<{[key: string]: any}> | void;
        patch: (endpoint: string, data: {[key: string]: any}, reason?: string) => Promise<{[key: string]: any}> | void;
        put: (endpoint: string, data?: {[key: string]: any}, reason?: string) => Promise<{[key: string]: any}> | void;
        delete: (endpoint: string, data?: {[key: string]: any}, reason?: string) => Promise<{[key: string]: any}>;
    }

    class Client {
        constructor(options: ClientOptions);
        user: APIUser;
        startedTimestamp: number | null;
        ws: WebSocket;
        rest: Rest;
        login: (token: string) => Promise<APIUser>;
        setPresence: (presenceObject: PresenceData) => void;
        addGuildEvents: (guildId: string) => void;
        readonly uptime: number | null;
        destroy: () => void;
    }
    export * from 'discord-api-types/v10'
    export {Client, ClientOptions, PresenceData, IntentResolvable, Rest, RestOptions, WebSocket}
}

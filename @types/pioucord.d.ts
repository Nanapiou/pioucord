declare module 'pioucord' {
    import {APIApplication, APIChannel, APIGuild, APIGuildMember, APIRole, APIUser} from "discord-api-types/v10";
    import EventEmitter from "events";

    interface ActivityData {
        name: string,
        type: number,
        url?: string,
    }

    interface PresenceData {
        status?: "online" | "dnd" | "invisible" | "idle";
        afk?: boolean;
        activities?: ActivityData[];
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

    interface CacheOptions {
        guilds?: boolean;
        channels?: boolean;
        users?: boolean;
        roles?: boolean;
    }

    class Cache {
        constructor(options: CacheOptions, client: Client);

        guilds: Map<string, APIGuild>;
        channels: Map<string, APIChannel>;
        users: Map<string, APIUser>;
        roles: Map<string, APIRole>;
    }

    class Rest {
        constructor(options: RestOptions);

        setToken: (token: string) => this;
        defaultHeaders: { [key: string]: string };
        resolvedToken: string | null;
        request: (url: string, body: string | object, headers: {
            [key: string]: string
        }, method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE" | "HEAD") => Promise<any>;
        extractEndpoint: (endpoint: string) => string | null;
        buildFormData: (data: { [key: string]: any }) => any; // form-data typing is broken

        get: (endpoint: string, data?: { [key: string]: any }, reason?: string) => Promise<{ [key: string]: any }>;
        post: (endpoint: string, data: { [key: string]: any }, reason?: string) => Promise<{
            [key: string]: any
        }> | void;
        patch: (endpoint: string, data: { [key: string]: any }, reason?: string) => Promise<{
            [key: string]: any
        }> | void;
        put: (endpoint: string, data?: { [key: string]: any }, reason?: string) => Promise<{
            [key: string]: any
        }> | void;
        delete: (endpoint: string, data?: { [key: string]: any }, reason?: string) => Promise<{ [key: string]: any }>;
    }

    class WebSocketShard {
        constructor(manager: WebSocketManager, gatewayUrl: string, shardId?: number | null);

        setupWs: (url?: string) => void;
        handleMessage: (data: { op: number, s: number, t?: string, d?: { [key: string]: any } }) => void;
        handleEvent: (name: string, data: { [key: string]: any }) => void;
        sendPayload: (payload: { op: number, d?: any }) => unknown;
        heartbeat: () => void;
        zombied: () => void;
        identify: (options?: {
            token: string,
            intents: number,
            properties: {
                os: string,
                browser: string,
                device: string
            },
            shard?: number[],
            largeThreshold?: number,
            compress?: boolean,
            presence?: PresenceData
        }) => unknown;
        resume: () => unknown;
        setPresence: (presenceObject: PresenceData) => void;
        requestGuildMembers: (options: {
            guildId: string,
            query?: string,
            limit?: number,
            presences?: boolean,
            userIds?: string[]
        }) => Promise<APIGuildMember[]>;
        addGuildEvents: (guildId: string) => unknown;
        destroy: () => void;
    }

    class WebSocketManager extends EventEmitter {
        constructor(client: Client, gatewayParams: { v: string, encoding: string, compress?: string });

        createShard: (shardId: number) => Promise<void | APIUser>;
        startShards: () => Promise<void | APIUser>;
        setBotGatewayOptions: (options: {
            url: string,
            shards: number,
            sessionStartLimit: {
                total: number,
                remaining: number,
                reset_after: number,
                max_concurrency: number
            }
        }) => void;
        setGatewayOptions: (options: { url: string }) => void;
        setShardsData: (shardsIds: number[], shardsCount: number, useRecommendedShardCount: boolean) => void;
        requestGuildMembers: (options: {
            guildId: string,
            query?: string,
            limit?: number,
            presences?: boolean,
            userIds?: string[]
        }) => Promise<APIGuildMember[]>
        forGuild: (guildId: string) => WebSocketShard;
        destroy: () => void;

        readonly ping: number;
        readonly shardsCount: number;
    }

    class Client {
        constructor(options: ClientOptions);

        user: APIUser;
        application: APIApplication;
        startedTimestamp: number | null;
        ws: WebSocketManager;
        rest: Rest;
        login: (token: string) => Promise<APIUser>;
        setPresence: (presenceObject: PresenceData) => void;
        addGuildEvents: (guildId: string) => void;
        readonly uptime: number | null;
        destroy: () => void;
    }

    export * from 'discord-api-types/v10'
    export {Client, ClientOptions, PresenceData, IntentResolvable, Rest, RestOptions, Cache, CacheOptions}
}

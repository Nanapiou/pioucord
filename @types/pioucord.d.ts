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

    interface CacheOptions {
        guilds?: boolean;
        channels?: boolean;
        roles?: boolean;
    }

    interface WebSocket {
        on(event: string, listener: (data: unknown) => void): this;
    }

    interface UserApi {
        get: (userId: string) => Promise<unknown> | void;
        getCurrent: () => Promise<unknown> | void;
        edit: (body: object) => Promise<unknown> | void;
        getGuilds: (query: object) => Promise<unknown> | void;
        getGuildsMember: (guildId: string) => Promise<unknown> | void;
        leaveGuild: (guildId: string) => Promise<unknown> | void;
        createDM: (body: object) => Promise<unknown> | void;
        getConnections: () => Promise<unknown> | void;
        getApplicationRoleConnection: (applicationId: string) => Promise<unknown> | void;
        updateApplicationRoleConnection: (applicationId: string, body: object) => Promise<unknown> | void;
    }
    
    interface Guild {
        id: string,
        channels?: Map<string, Channel>,
        roles?: Map<string, Role>,
        [key: string]: any
    }

    interface Channel {
        id: string,
        [key: string]: any
    }

    interface Role {
        id: string,
        [key: string]: any
    }

    class Rest {
        constructor(options: RestOptions);

        get: (endpoint: string) => Promise<unknown>;
        post: (endpoint: string, data: object) => Promise<unknown> | void;
        patch: (endpoint: string, data: object) => Promise<unknown> | void;
        put: (endpoint: string, data: object) => Promise<unknown> | void;
        delete: (endpoint: string, data: object) => Promise<unknown>;
    }

    class Api {
        constructor(rest: Rest);

        user: UserApi;
    }

    class Cache {
        constructor(options: CacheOptions);

        guilds: Map<string, Guild>;
    }

    class Client {
        constructor(options: {
            intents: IntentResolvable;
            presence?: PresenceData;
            shards?: number[];
            shardsCount?: number;
            useRecommendedShardCount?: boolean;
            userBot?: boolean;
            apiVersion?: string;
            api?: Api;
            cache?: Cache;
        });

        cache: Cache;
        api: Api;
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

    export {Client, ClientOptions, PresenceData, IntentResolvable, Cache, Guild, CacheOptions, Rest, RestOptions, Api, UserApi, WebSocket}
}

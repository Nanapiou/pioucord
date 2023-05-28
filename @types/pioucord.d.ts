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
        on(event: string, listener: (data: {[key: string]: any}) => void): this;
    }

    interface UserApi {
        get: (userId: string) => Promise<{[key: string]: any}> | void;
        getCurrent: () => Promise<{[key: string]: any}> | void;
        edit: (body: object) => Promise<{[key: string]: any}> | void;
        getGuilds: (query: object) => Promise<{[key: string]: any}> | void;
        getGuildsMember: (guildId: string) => Promise<{[key: string]: any}> | void;
        leaveGuild: (guildId: string) => Promise<{[key: string]: any}> | void;
        createDM: (body: object) => Promise<{[key: string]: any}> | void;
        getConnections: () => Promise<{[key: string]: any}> | void;
        getApplicationRoleConnection: (applicationId: string) => Promise<{[key: string]: any}> | void;
        updateApplicationRoleConnection: (applicationId: string, body: object) => Promise<{[key: string]: any}> | void;
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

        get: (endpoint: string) => Promise<{[key: string]: any}>;
        post: (endpoint: string, data: object) => Promise<{[key: string]: any}> | void;
        patch: (endpoint: string, data: object) => Promise<{[key: string]: any}> | void;
        put: (endpoint: string, data: object) => Promise<{[key: string]: any}> | void;
        delete: (endpoint: string, data: object) => Promise<{[key: string]: any}>;
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
        user: {[key: string]: any};
        startedTimestamp: Date;
        ws: WebSocket;
        rest: Rest;
        login: (token: string) => void;
        setPresence: (presenceObject: PresenceData) => void;
        addGuildEvents: (guildId: string) => void;
        readonly uptime: Date;
        destroy: () => void;
    }
    export * from 'discord-api-types/v10'
    export {Client, ClientOptions, PresenceData, IntentResolvable, Cache, Guild, CacheOptions, Rest, RestOptions, Api, UserApi, WebSocket}
}

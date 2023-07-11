declare module 'pioucord' {
    import { APIUser, APIGuild, APIRole, APITextChannel, RESTAPIPartialCurrentUserGuild, APIGuildMember, APIDMChannel, APIGroupDMChannel, APIConnection, RESTGetAPICurrentUserGuildsQuery, RESTPatchAPICurrentUserJSONBody, RESTPostAPICurrentUserCreateDMChannelJSONBody, RESTPutAPICurrentUserApplicationRoleConnectionJSONBody } from 'pioucord';
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
        get: (userId: string) => Promise<APIUser>;
        getCurrent: () => Promise<APIUser>;
        edit: (body: RESTPatchAPICurrentUserJSONBody) => Promise<APIUser>;
        getGuilds: (query: RESTGetAPICurrentUserGuildsQuery) => Promise<RESTAPIPartialCurrentUserGuild>;
        getGuildsMember: (guildId: string) => Promise<APIGuildMember>;
        leaveGuild: (guildId: string) => Promise<{[key: string]: any}>;
        createDM: (body: RESTPostAPICurrentUserCreateDMChannelJSONBody) => Promise<APIDMChannel | APIGroupDMChannel>;
        getConnections: () => Promise<APIConnection>;
        getApplicationRoleConnection: (applicationId: string) => Promise<RESTPutAPICurrentUserApplicationRoleConnectionJSONBody>;
        updateApplicationRoleConnection: (applicationId: string, body: RESTPutAPICurrentUserApplicationRoleConnectionJSONBody) => Promise<RESTPutAPICurrentUserApplicationRoleConnectionJSONBody>;
    }

    class Rest {
        constructor(options: RestOptions);

        get: (endpoint: string, data?: {[key: string]: any}, reason?: string) => Promise<{[key: string]: any}>;
        post: (endpoint: string, data: {[key: string]: any}, reason?: string) => Promise<{[key: string]: any}> | void;
        patch: (endpoint: string, data: {[key: string]: any}, reason?: string) => Promise<{[key: string]: any}> | void;
        put: (endpoint: string, data?: {[key: string]: any}, reason?: string) => Promise<{[key: string]: any}> | void;
        delete: (endpoint: string, data?: {[key: string]: any}, reason?: string) => Promise<{[key: string]: any}>;
    }

    class Api {
        constructor(rest: Rest);

        user: UserApi;
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
        api: Api;
        user: APIUser;
        startedTimestamp: Date;
        ws: WebSocket;
        rest: Rest;
        login: (token: string) => Promise<APIUser>;
        setPresence: (presenceObject: PresenceData) => void;
        addGuildEvents: (guildId: string) => void;
        readonly uptime: Date;
        destroy: () => void;
    }
    export * from 'discord-api-types/v10'
    export {Client, ClientOptions, PresenceData, IntentResolvable, CacheOptions, Rest, RestOptions, Api, UserApi, WebSocket}
}

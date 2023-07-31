declare module 'pioucord' {
    import {
    APIApplication,
    APIChannel,
    APIGuild,
    APIGuildMember,
    APIRole,
    APIUser,
    GatewayReadyDispatchData,
    GatewayGuildCreateDispatchData,
    GatewayGuildDeleteDispatchData,
    GatewayGuildUpdateDispatchData,
    GatewayGuildRoleCreateDispatchData,
    GatewayGuildRoleUpdateDispatchData,
    GatewayGuildRoleDeleteDispatchData,
    GatewayChannelCreateDispatchData,
    GatewayChannelUpdateDispatchData,
    GatewayChannelDeleteDispatchData,
    GatewayChannelPinsUpdateDispatchData,
    GatewayThreadCreateDispatchData,
    GatewayThreadUpdateDispatchData,
    GatewayThreadDeleteDispatchData,
    GatewayThreadListSyncDispatchData,
    GatewayThreadMemberUpdateDispatchData,
    GatewayThreadMembersUpdateDispatchData,
    GatewayStageInstanceCreateDispatchData,
    GatewayStageInstanceUpdateDispatchData,
    GatewayStageInstanceDeleteDispatchData,
    GatewayGuildMemberAddDispatchData,
    GatewayGuildMemberUpdateDispatchData,
    GatewayGuildMemberRemoveDispatchData,
    GatewayGuildAuditLogEntryCreateDispatchData,
    GatewayGuildBanAddDispatchData,
    GatewayGuildBanRemoveDispatchData,
    GatewayGuildEmojisUpdateDispatchData,
    GatewayGuildStickersUpdateDispatchData,
    GatewayGuildIntegrationsUpdateDispatchData,
    GatewayIntegrationCreateDispatchData,
    GatewayIntegrationUpdateDispatchData,
    GatewayIntegrationDeleteDispatchData,
    GatewayWebhooksUpdateDispatchData,
    GatewayInviteCreateDispatchData,
    GatewayInviteDeleteDispatchData,
    GatewayPresenceUpdateData,
    GatewayMessageCreateDispatchData,
    GatewayMessageUpdateDispatchData,
    GatewayMessageDeleteDispatchData,
    GatewayMessageDeleteBulkDispatchData,
    GatewayMessageReactionAddDispatchData,
    GatewayMessageReactionRemoveDispatchData,
    GatewayMessageReactionRemoveAllDispatchData,
    GatewayMessageReactionRemoveEmojiDispatchData,
    GatewayTypingStartDispatchData,
    GatewayGuildScheduledEventCreateDispatchData,
    GatewayGuildScheduledEventUpdateDispatchData,
    GatewayGuildScheduledEventDeleteDispatchData,
    GatewayGuildScheduledEventUserAddDispatchData,
    GatewayGuildScheduledEventUserRemoveDispatchData,
    GatewayAutoModerationRuleCreateDispatchData,
    GatewayAutoModerationRuleUpdateDispatchData,
    GatewayAutoModerationRuleDeleteDispatchData,
    GatewayAutoModerationActionExecutionDispatchData,
    GatewayUserUpdateDispatchData,
    GatewayVoiceServerUpdateDispatchData,
    GatewayVoiceStateUpdateDispatchData
} from "discord-api-types/v10";
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

        on(event: "READY", listener: (data: GatewayReadyDispatchData) => void): this;
        on(event: "GUILD_CREATE", listener: (data: GatewayGuildCreateDispatchData) => void): this;
        on(event: "GUILD_UPDATE", listener: (data: GatewayGuildUpdateDispatchData) => void): this;
        on(event: "GUILD_DELETE", listener: (data: GatewayGuildDeleteDispatchData) => void): this;
        on(event: "GUILD_ROLE_CREATE", listener: (data: GatewayGuildRoleCreateDispatchData) => void): this;
        on(event: "GUILD_ROLE_UPDATE", listener: (data: GatewayGuildRoleUpdateDispatchData) => void): this;
        on(event: "GUILD_ROLE_DELETE", listener: (data: GatewayGuildRoleDeleteDispatchData) => void): this;
        on(event: "CHANNEL_CREATE", listener: (data: GatewayChannelCreateDispatchData) => void): this;
        on(event: "CHANNEL_UPDATE", listener: (data: GatewayChannelUpdateDispatchData) => void): this;
        on(event: "CHANNEL_DELETE", listener: (data: GatewayChannelDeleteDispatchData) => void): this;
        on(event: "CHANNEL_PINS_UPDATE", listener: (data: GatewayChannelPinsUpdateDispatchData) => void): this;
        on(event: "THREAD_CREATE", listener: (data: GatewayThreadCreateDispatchData) => void): this;
        on(event: "THREAD_UPDATE", listener: (data: GatewayThreadUpdateDispatchData) => void): this;
        on(event: "THREAD_DELETE", listener: (data: GatewayThreadDeleteDispatchData) => void): this;
        on(event: "THREAD_LIST_SYNC", listener: (data: GatewayThreadListSyncDispatchData) => void): this;
        on(event: "THREAD_MEMBER_UPDATE", listener: (data: GatewayThreadMemberUpdateDispatchData) => void): this;
        on(event: "THREAD_MEMBERS_UPDATE", listener: (data: GatewayThreadMembersUpdateDispatchData) => void): this;
        on(event: "STAGE_INSTANCE_CREATE", listener: (data: GatewayStageInstanceCreateDispatchData) => void): this;
        on(event: "STAGE_INSTANCE_UPDATE", listener: (data: GatewayStageInstanceUpdateDispatchData) => void): this;
        on(event: "STAGE_INSTANCE_DELETE", listener: (data: GatewayStageInstanceDeleteDispatchData) => void): this;
        on(event: "GUILD_MEMBER_ADD", listener: (data: GatewayGuildMemberAddDispatchData) => void): this;
        on(event: "GUILD_MEMBER_UPDATE", listener: (data: GatewayGuildMemberUpdateDispatchData) => void): this;
        on(event: "GUILD_MEMBER_REMOVE", listener: (data: GatewayGuildMemberRemoveDispatchData) => void): this;
        on(event: "GUILD_AUDIT_LOG_ENTRY_CREATE", listener: (data: GatewayGuildAuditLogEntryCreateDispatchData) => void): this;
        on(event: "GUILD_BAN_ADD", listener: (data: GatewayGuildBanAddDispatchData) => void): this;
        on(event: "GUILD_BAN_REMOVE", listener: (data: GatewayGuildBanRemoveDispatchData) => void): this;
        on(event: "GUILD_EMOJIS_UPDATE", listener: (data: GatewayGuildEmojisUpdateDispatchData) => void): this;
        on(event: "GUILD_STICKERS_UPDATE", listener: (data: GatewayGuildStickersUpdateDispatchData) => void): this;
        on(event: "GUILD_INTEGRATIONS_UPDATE", listener: (data: GatewayGuildIntegrationsUpdateDispatchData) => void): this;
        on(event: "INTEGRATION_CREATE", listener: (data: GatewayIntegrationCreateDispatchData) => void): this;
        on(event: "INTEGRATION_UPDATE", listener: (data: GatewayIntegrationUpdateDispatchData) => void): this;
        on(event: "INTEGRATION_DELETE", listener: (data: GatewayIntegrationDeleteDispatchData) => void): this;
        on(event: "WEBHOOKS_UPDATE", listener: (data: GatewayWebhooksUpdateDispatchData) => void): this;
        on(event: "INVITE_CREATE", listener: (data: GatewayInviteCreateDispatchData) => void): this;
        on(event: "INVITE_DELETE", listener: (data: GatewayInviteDeleteDispatchData) => void): this;
        on(event: "PRESENCE_UPDATE", listener: (data: GatewayPresenceUpdateData) => void): this;
        on(event: "MESSAGE_CREATE", listener: (data: GatewayMessageCreateDispatchData) => void): this;
        on(event: "MESSAGE_UPDATE", listener: (data: GatewayMessageUpdateDispatchData) => void): this;
        on(event: "MESSAGE_DELETE", listener: (data: GatewayMessageDeleteDispatchData) => void): this;
        on(event: "MESSAGE_DELETE_BULK", listener: (data: GatewayMessageDeleteBulkDispatchData) => void): this;
        on(event: "MESSAGE_REACTION_ADD", listener: (data: GatewayMessageReactionAddDispatchData) => void): this;
        on(event: "MESSAGE_REACTION_REMOVE", listener: (data: GatewayMessageReactionRemoveDispatchData) => void): this;
        on(event: "MESSAGE_REACTION_REMOVE_ALL", listener: (data: GatewayMessageReactionRemoveAllDispatchData) => void): this;
        on(event: "MESSAGE_REACTION_REMOVE_EMOJI", listener: (data: GatewayMessageReactionRemoveEmojiDispatchData) => void): this;
        on(event: "TYPING_START", listener: (data: GatewayTypingStartDispatchData) => void): this;
        on(event: "CHANNEL_PIN_UPDATE", listener: (data: GatewayChannelPinsUpdateDispatchData) => void): this;
        on(event: "GUILD_SCHEDULED_EVENT_CREATE", listener: (data: GatewayGuildScheduledEventCreateDispatchData) => void): this;
        on(event: "GUILD_SCHEDULED_EVENT_UPDATE", listener: (data: GatewayGuildScheduledEventUpdateDispatchData) => void): this;
        on(event: "GUILD_SCHEDULED_EVENT_DELETE", listener: (data: GatewayGuildScheduledEventDeleteDispatchData) => void): this;
        on(event: "GUILD_SCHEDULED_EVENT_USER_ADD", listener: (data: GatewayGuildScheduledEventUserAddDispatchData) => void): this;
        on(event: "GUILD_SCHEDULED_EVENT_USER_REMOVE", listener: (data: GatewayGuildScheduledEventUserRemoveDispatchData) => void): this;
        on(event: "AUTO_MODERATION_RULE_CREATE", listener: (data: GatewayAutoModerationRuleCreateDispatchData) => void): this;
        on(event: "AUTO_MODERATION_RULE_UPDATE", listener: (data: GatewayAutoModerationRuleUpdateDispatchData) => void): this;
        on(event: "AUTO_MODERATION_RULE_DELETE", listener: (data: GatewayAutoModerationRuleDeleteDispatchData) => void): this;
        on(event: "AUTO_MODERATION_ACTION_EXECUTION", listener: (data: GatewayAutoModerationActionExecutionDispatchData) => void): this;

        on(event: "USER_UPDATE", listener: (data: GatewayUserUpdateDispatchData) => void): this;
        on(event: "VOICE_STATE_UPDATE", listener: (data: GatewayVoiceStateUpdateDispatchData) => void): this;
        on(event: "VOICE_SERVER_UPDATE", listener: (data: GatewayVoiceServerUpdateDispatchData) => void): this;
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

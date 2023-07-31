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
        GatewayVoiceStateUpdateDispatchData,
        GatewayIntentBits,
        GatewayIdentifyData
    } from "discord-api-types/v10";
    import EventEmitter from "events";

    interface RestOptions {
        authPrefix?: "Bot" | "Bearer";
        version?: string
        baseUrl?: string
        token?: string
    }

    type IntentResolvable = keyof typeof GatewayIntentBits | number | bigint | IntentResolvable[];

    interface ClientOptions {
        intents: IntentResolvable;
        presence?: GatewayPresenceUpdateData;
        shards?: number[];
        shardsCount?: number;
        useRecommendedShardCount?: boolean;
        userBot?: boolean;
        apiVersion?: string;
        rest?: RestOptions;
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
        identify: (options?: GatewayIdentifyData) => unknown;
        resume: () => unknown;
        setPresence: (presenceObject: GatewayPresenceUpdateData) => void;
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

        public on<K extends keyof WebsocketEvents>(event: K, listener: (data: WebsocketEvents[K]) => any): this;
        public once<K extends keyof WebsocketEvents>(event: K, listener: (data: WebsocketEvents[K]) => any): this;
    }

    export interface WebsocketEvents {
        READY: GatewayReadyDispatchData,
        GUILD_CREATE: GatewayGuildCreateDispatchData,
        GUILD_UPDATE: GatewayGuildUpdateDispatchData,
        GUILD_DELETE: GatewayGuildDeleteDispatchData,
        GUILD_ROLE_CREATE: GatewayGuildRoleCreateDispatchData,
        GUILD_ROLE_UPDATE: GatewayGuildRoleUpdateDispatchData,
        GUILD_ROLE_DELETE: GatewayGuildRoleDeleteDispatchData,
        CHANNEL_CREATE: GatewayChannelCreateDispatchData,
        CHANNEL_UPDATE: GatewayChannelUpdateDispatchData,
        CHANNEL_DELETE: GatewayChannelDeleteDispatchData,
        CHANNEL_PINS_UPDATE: GatewayChannelPinsUpdateDispatchData,
        THREAD_CREATE: GatewayThreadCreateDispatchData,
        THREAD_UPDATE: GatewayThreadUpdateDispatchData,
        THREAD_DELETE: GatewayThreadDeleteDispatchData,
        THREAD_LIST_SYNC: GatewayThreadListSyncDispatchData,
        THREAD_MEMBER_UPDATE: GatewayThreadMemberUpdateDispatchData,
        THREAD_MEMBERS_UPDATE: GatewayThreadMembersUpdateDispatchData,
        STAGE_INSTANCE_CREATE: GatewayStageInstanceCreateDispatchData,
        STAGE_INSTANCE_UPDATE: GatewayStageInstanceUpdateDispatchData,
        STAGE_INSTANCE_DELETE: GatewayStageInstanceDeleteDispatchData,
        GUILD_MEMBER_ADD: GatewayGuildMemberAddDispatchData,
        GUILD_MEMBER_UPDATE: GatewayGuildMemberUpdateDispatchData,
        GUILD_MEMBER_REMOVE: GatewayGuildMemberRemoveDispatchData,
        GUILD_AUDIT_LOG_ENTRY_CREATE: GatewayGuildAuditLogEntryCreateDispatchData,
        GUILD_BAN_ADD: GatewayGuildBanAddDispatchData,
        GUILD_BAN_REMOVE: GatewayGuildBanRemoveDispatchData,
        GUILD_EMOJIS_UPDATE: GatewayGuildEmojisUpdateDispatchData,
        GUILD_STICKERS_UPDATE: GatewayGuildStickersUpdateDispatchData,
        GUILD_INTEGRATIONS_UPDATE: GatewayGuildIntegrationsUpdateDispatchData,
        INTEGRATION_CREATE: GatewayIntegrationCreateDispatchData,
        INTEGRATION_UPDATE: GatewayIntegrationUpdateDispatchData,
        INTEGRATION_DELETE: GatewayIntegrationDeleteDispatchData,
        WEBHOOKS_UPDATE: GatewayWebhooksUpdateDispatchData,
        INVITE_CREATE: GatewayInviteCreateDispatchData,
        INVITE_DELETE: GatewayInviteDeleteDispatchData,
        PRESENCE_UPDATE: GatewayPresenceUpdateData,
        MESSAGE_CREATE: GatewayMessageCreateDispatchData,
        MESSAGE_UPDATE: GatewayMessageUpdateDispatchData,
        MESSAGE_DELETE: GatewayMessageDeleteDispatchData,
        MESSAGE_DELETE_BULK: GatewayMessageDeleteBulkDispatchData,
        MESSAGE_REACTION_ADD: GatewayMessageReactionAddDispatchData,
        MESSAGE_REACTION_REMOVE: GatewayMessageReactionRemoveDispatchData,
        MESSAGE_REACTION_REMOVE_ALL: GatewayMessageReactionRemoveAllDispatchData,
        MESSAGE_REACTION_REMOVE_EMOJI: GatewayMessageReactionRemoveEmojiDispatchData,
        TYPING_START: GatewayTypingStartDispatchData,
        CHANNEL_PIN_UPDATE: GatewayChannelPinsUpdateDispatchData,
        GUILD_SCHEDULED_EVENT_CREATE: GatewayGuildScheduledEventCreateDispatchData,
        GUILD_SCHEDULED_EVENT_UPDATE: GatewayGuildScheduledEventUpdateDispatchData,
        GUILD_SCHEDULED_EVENT_DELETE: GatewayGuildScheduledEventDeleteDispatchData,
        GUILD_SCHEDULED_EVENT_USER_ADD: GatewayGuildScheduledEventUserAddDispatchData,
        GUILD_SCHEDULED_EVENT_USER_REMOVE: GatewayGuildScheduledEventUserRemoveDispatchData,
        AUTO_MODERATION_RULE_CREATE: GatewayAutoModerationRuleCreateDispatchData,
        AUTO_MODERATION_RULE_UPDATE: GatewayAutoModerationRuleUpdateDispatchData,
        AUTO_MODERATION_RULE_DELETE: GatewayAutoModerationRuleDeleteDispatchData,
        AUTO_MODERATION_ACTION_EXECUTION: GatewayAutoModerationActionExecutionDispatchData,
        USER_UPDATE: GatewayUserUpdateDispatchData,
        VOICE_STATE_UPDATE: GatewayVoiceStateUpdateDispatchData,
        VOICE_SERVER_UPDATE: GatewayVoiceServerUpdateDispatchData
    }


    class Client {
        constructor(options: ClientOptions);

        user: APIUser;
        application: APIApplication;
        startedTimestamp: number | null;
        ws: WebSocketManager;
        rest: Rest;
        login: (token: string) => Promise<APIUser>;
        setPresence: (presenceObject: GatewayPresenceUpdateData) => void;
        addGuildEvents: (guildId: string) => void;
        readonly uptime: number | null;
        destroy: () => void;
    }

    export * from 'discord-api-types/v10'
    export {Client, ClientOptions, IntentResolvable, Rest, RestOptions, Cache, CacheOptions}
}

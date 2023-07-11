import WebSocketManager from "./WebSocketManager.js";
import {GatewayIntentBits, Routes} from "discord-api-types/v10";
import Rest from "./Rest.js";
import {Cache} from "./Cache.js";
import BitField from "./BitField.js";
import VoiceManager from "./voice/VoiceManager.js";

/**
 * @typedef {number | string | BitField | IntentResolvable[]} IntentResolvable
 */

/**
 * @typedef ActivityData
 * @property {string} name
 * @property {number} type
 */

/**
 * @typedef PresenceData
 * @property {"online" | "dnd" | "invisible" | "idle"} [status="online"]
 * @property {boolean} [afk=false]
 * @property {ActivityData[]} [activities]
 */

/**
 * @typedef CacheOptions
 * @property {boolean} [guilds]
 * @property {boolean} [channels]
 * @property {boolean} [roles]
 * @property {boolean} [users]
 */

/**
 * @typedef ClientOptions
 * @property {IntentResolvable} intents
 * @property {PresenceData} [presence]
 * @property {number[]} [shards=[]]
 * @property {number | null} [shardsCount=null]
 * @property {boolean} [useRecommendedShardCount=false]
 * @property {boolean} [userBot=false]
 * @property {string} [apiVersion="10"]
 * @property {CacheOptions} [cache]
 */

export default class Client {
    /**
     * @param {ClientOptions} clientOptions
     */
    constructor({ intents, presence, shards, shardsCount, useRecommendedShardCount, userBot, apiVersion, cache }) {
        if (shards?.length > 0 && shardsCount === null && !useRecommendedShardCount) throw new Error("Cannot specify shards without shardsCount");
        if ((shardsCount !== null || useRecommendedShardCount) && shards?.length < 1) throw new Error("If you provide a shardsCount, you must also provide shards");

        this.intents = intents instanceof BitField ? intents : new BitField(intents, GatewayIntentBits);
        this.presence = presence;
        this.user = null;
        this.startedTimestamp = null;
        this.userBot = userBot ?? false;
        this.apiVersion = apiVersion ?? "10";
        this.rest = new Rest({ version: this.apiVersion, authPrefix: userBot ? undefined : 'Bot' });
        this.voiceManager = new VoiceManager(this);
        this.ws = new WebSocketManager(this, {
            v: this.apiVersion,
            encoding: 'json'
        });
        this.cache = new Cache(cache ?? {}, this);
    };
    /**
     * Login the client
     * @param token The token to use
     * @returns {Promise<object>} The user object of the client
     */
    async login(token) {
        this.token = token;
        this.rest.setToken(token);
        if (this.userBot) {
            const gatewayUser = await this.rest.get(Routes.gateway());
            this.ws.setGatewayOptions(gatewayUser);
        } else {
            const gatewayBot = await this.rest.get(Routes.gatewayBot());
            this.ws.setBotGatewayOptions(gatewayBot);
        }
        this.startedTimestamp = Date.now();
        return await this.ws.startShards();
    };

    /**
     * Set the presence of the client
     * @param {PresenceData} presenceObject
     */
    setPresence(presenceObject) {
        this.ws.shards.forEach(shard => shard.setPresence(presenceObject));
    };

    /**
     * Start to receive events from the guild (just send it to every shard)
     * @param {string} guildId
     */
    addGuildEvents(guildId) {
        if (!this.userBot) throw new Error("Cannot add guild events if you are using a bot account");
        this.ws.shards.forEach(shard => shard.addGuildEvents(guildId));
    };

    get uptime() {
        return this.startedTimestamp ? Date.now() - this.startedTimestamp : null;
    };

    destroy() {
        this.ws.destroy();
    }
}

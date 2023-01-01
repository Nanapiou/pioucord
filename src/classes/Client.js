import WebSocketManager from "./WebSocketManager.js";
import {GatewayIntentBits, Routes} from "discord-api-types/v10";
import Rest from "./Rest.js";
import BitField from "./BitField.js";

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
 * @typedef ClientOptions
 * @property {IntentResolvable} intents
 * @property {PresenceData} [presence]
 * @property {number[]} [shards=[]]
 * @property {number | null} [shardCount=null]
 * @property {boolean} [useRecommendedShardCount=false]
 * @property {boolean} [userBot=false]
 * @property {string} [apiVersion="10"]
 */

export default class Client {
    /**
     * @param {ClientOptions} clientOptions
     */
    constructor({ intents, presence, shards, shardCount, useRecommendedShardCount, userBot, apiVersion }) {
        if (shards?.length > 0 && shardCount === null && !useRecommendedShardCount) throw new Error("Cannot specify shards without shardCount");
        if ((shardCount !== null || useRecommendedShardCount) && shards?.length < 1) throw new Error("If you provide a shardCount, you must also provide shards");

        this.intents = intents instanceof BitField ? intents : new BitField(intents, GatewayIntentBits);
        this.presence = presence;
        this.user = null;
        this.userBot = userBot ?? false;
        this.apiVersion = apiVersion ?? "10";

        this.rest = new Rest({ version: apiVersion, authPrefix: userBot ? undefined : 'Bot' });
        this.ws = new WebSocketManager(this, {
            v: apiVersion,
            encoding: 'json'
        });
        this.ws.setShardsData(shards ?? [], shardCount ?? null, useRecommendedShardCount);
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
        const user = await this.ws.startShards();
        this.user = user;
        return user;
    };

    /**
     * Set the presence of the client
     * @param {PresenceData} presenceObject
     */
    setPresence(presenceObject) {
        this.ws.shards.forEach(shard => shard.setPresence(presenceObject));
    };
}
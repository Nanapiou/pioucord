import WebSocketShard from "./WebSocketShard.js";
import EventEmitter from 'node:events';

export default class WebSocketManager extends EventEmitter {
    constructor(client, gatewayParams) {
        super();
        this.client = client;
        this.gatewayParams = gatewayParams;

        this.shards = new Map();
        this.gatewayUrl = null;
        this.recommendedShardsCount = null;
        this._shardCount = null;
        this.sessionStartLimit = null;
    };

    createShard(shardId) {
        const shard = new WebSocketShard(this, this.gatewayUrl, shardId);
        this.shards.set(shardId ?? 0, shard);
        return shard.setupWs();
    };

    async startShards() {
        if (this.shardCount === null) return this.createShard();
        else {
            let last;
            for (const i of this.shardsId) {
                last = await this.createShard(i);
            }
            return last
        }
    };

    get ping() {
        let ping = 0;
        this.shards.forEach(shard => ping += shard.ping);
        return ping;
    };

    /**
     * Set new options
     * @param {object} options
     * @param {string} options.url
     * @param {number} options.shards
     * @param {object} options.session_start_limit
     * @param {number} options.session_start_limit.total
     * @param {number} options.session_start_limit.remaining
     * @param {number} options.session_start_limit.reset_after
     * @param {number} options.session_start_limit.max_concurrency
     */
    setBotGatewayOptions(options) {
        this.gatewayUrl = options.url;
        this.recommendedShardsCount = options.shards;
        this.sessionStartLimit = options.session_start_limit;
    };

    /**
     * Set the shards' data
     * @param {number[]} shardsId
     * @param {number} shardCount
     * @param {boolean} useRecommendedShardCount
     */
    setShardsData(shardsId, shardCount, useRecommendedShardCount) {
        this.shardsId = shardsId;
        this._shardCount = shardCount;
        this.useRecommendedShardCount = useRecommendedShardCount;
    };
    
    get shardCount() {
        if (this.useRecommendedShardCount) return this.recommendedShardsCount;
        else return this._shardCount;
    }
};

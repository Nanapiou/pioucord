import WebSocketShard from "./WebSocketShard.js";
import EventEmitter from 'node:events';

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

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
        if (this.shardsCount === null) return this.createShard();
        else {
            let last;
            for (let i = 1; i < this.shardsId.length + 1; i++) {
                last = await this.createShard(this.shardsId[i - 1]);
                if (i % this.sessionStartLimit.max_concurrency === 0) await wait(5_000);
            }
            return last;
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
        if (this._shardCount ?? 1 !== options.shards) console.warn("The shard count is not the recommended one");
        this.gatewayUrl = options.url;
        this.recommendedShardsCount = options.shards;
        this.sessionStartLimit = options.session_start_limit;
    };


    /**
     * Set new options
     * @param {object} options
     * @param {string} options.url
     */
    setGatewayOptions(options) {
        this.gatewayUrl = options.url;
        this.useRecommendedShardCount = false;
        this._shardCount = null;
    };

    /**
     * Set the shards' data
     * @param {number[]} shardsId
     * @param {number} shardsCount
     * @param {boolean} useRecommendedShardCount
     */
    setShardsData(shardsId, shardsCount, useRecommendedShardCount) {
        if (shardsId.some(shardId => typeof shardId !== "number")) throw new Error("Shard ID should be a number");
        if (shardsId.some(shardId => shardId < 0)) throw new Error("Shard ID cannot be negative");
        if (shardsId.some(shardId => shardId >= shardsCount)) throw new Error("Shard ID cannot be greater than shardsCount");
        if (shardsId.some((shardId, i) => shardsId.indexOf(shardId) !== i)) throw new Error("Shard ID cannot be duplicated");
        if (shardsId.length > shardsCount) throw new Error("Shard ID cannot be greater than shardsCount");
        this.shardsId = shardsId;
        this._shardCount = shardsCount;
        this.useRecommendedShardCount = useRecommendedShardCount;
    };
    
    get shardsCount() {
        if (this.useRecommendedShardCount) return this.recommendedShardsCount;
        else return this._shardCount;
    };

    destroy() {
        this.shards.forEach(shard => shard.destroy());
    }
};

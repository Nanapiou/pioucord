const EventsEmitter = require('node:events');
const Client = require('./Client');
const Shard = require('./Shard');

/**
 * A manager for the websocket, handle shards.
 * Only receive the `debug` event for now.
 * @extends {EventsEmitter}
 */
class WebSocketManager extends EventsEmitter {
    /**
     * @param {Client} client 
     */
    constructor(client) {
        super();
        this.client = client;
        this.shards = new Map();
    };

    /**
     * Init the connection to the gateway.
     * @private
     * @param {Object} options Options from {@link https://discord.com/developers/docs/topics/gateway#get-gateway-bot}
     */
    init(options) {
        this.options = options;

        this.lastShardIndex = 0;
        this.startShard();
    };

    /**
     * Start a shard (init the websocket connection, and identify)
     * @param {Object} shard 
     * @param {Number} shard.shardIndex The index in {@link Client.options.shards}
     * @param {Number} shard.shardId The discord shard id 
     */
    startShard({
        shardIndex,
        shardId
    } = {
        shardIndex: this.lastShardIndex,
    }) {
        if (typeof shardId != "undefined") {
            if (this.shards.has(shardId)) this.shards.get(shardId).delete();
            this.shards.set(shardId, new Shard(this, shardId));
        } else {
            const shard = this.client.gatewayOptions.shards?.[shardIndex];
            if (!shard) {
                if (shardIndex == 0) {
                    this.shardsCount = 1;
                    this.shards.set(0, new Shard(this));
                } else {
                    this.emit('debug', 'FULLY STARTED!');  
                    if (this.shardsCount != this.options.shards) this.emit('debug', 'WARNING: Shard cound different from shards recommanded by discord.');
                };
                delete this.lastShardIndex;
            } else {
                if (!this.shardsCount) this.shardsCount = shard[1];
                if (this.shardsCount != shard[1] || this.shardsCount <= shard[0]) throw new Error('Invalid shards');

                setTimeout(() => this.shards.set(shard[0], new Shard(this, shard[0])), shardIndex % this.options.session_start_limit.max_concurrency == 0 ? 5000 : 0);
                this.lastShardIndex++;
            };
        };
    }

    /**
     * Get the ping
     * @return {Number} The websocket's ping
     */
    get ping() {
        let total = 0;
        this.shards.forEach(shard => total += shard.ping);
        return total / this.shards.size;
    };
};

module.exports = WebSocketManager;
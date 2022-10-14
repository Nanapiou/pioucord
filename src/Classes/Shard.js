const WebSocket = require('ws');
const WebSocketManager = require('./WebSocketManager');
const { buildEventData } = require('../Util/functions');
const { GATEWAY_OPCODES, GATEWAY_CLOSE_EVENT_CODES } = require('../Util/Constants');

/**
 * @typedef APIpayload
 * @prop {Number} op The op code
 * @prop {Number} s The current sequence
 * @prop {Object} d The payload data
 * @prop {String} [t] The event's name (When {@link APIpayload.op} is equal to 0)
 */

/**
 * @typedef {Object} PresenceOptions
 * @property {"online"|"dnd"|"idle"|"offline"|"invisible"} status The client user's status
 * @property {number} [since] The creation date's timestamp of the presence
 * @property {boolean} [afk] If the client user is AFK or not
 * @property {ActivityOptions[]} [activities] Client user's activities
 */

/**
 * A single connection to the gateway, receiving specific events
 */
class Shard {
    /**
     * @param {WebSocketManager} wsManager 
     * @param {Number} shardId 
     */
    constructor(wsManager, shardId=undefined) {
        this.wsManager = wsManager;
        this.shardId = shardId;
        this.ping = 100;
        this.session_id = null;
        this.ws = new WebSocket(wsManager.options.url);

        this.#wsListeners();
    };
    
    /**
     * Resume the session, using {@link Shard.session_id} // Idk how to define class properties with JSDOC, so not util
     * @private
     */
    #resume() {
        this.wsManager.emit('debug', 'Resuming session ' + this.session_id);
        this.ws.send(JSON.stringify({
            op: GATEWAY_OPCODES.RESUME,
            d: {
                token: this.wsManager.client.token,
                session_id: this.session_id,
                seq: this.sequence
            }
        }));
    };

    /**
     * Identify using the {@link WebSocketManager.client}'s token
     * @private
     */
    #identify() {
        this.wsManager.emit('debug', 'Identifying with token ' + this.wsManager.client.token, this.shardId);
        const d = Object.assign({
            token: this.wsManager.client.token,
            properties: { os: process.platform },
        }, this.wsManager.client.gatewayOptions);
        if (this.shardId !== undefined) d.shard = [ this.shardId, this.wsManager.shardsCount ];
        this.ws.send(JSON.stringify({
            op: GATEWAY_OPCODES.IDENTIFY,
            d
        }));
    };

    /**
     * Send a heartbeat with the websocket
     * @private
     */
    #heartbeat() {
        this.ws.send(JSON.stringify({ op: GATEWAY_OPCODES.HEARTBEAT, d: this.sequence }));
        this.heartbeat_timestamp = Date.now();
        this.ack_timeout = setTimeout(() => {
            this.wsManager.emit('debug', 'Didn\'t received the ACK...', this.shardId);
            this.ws.close(4016);
        }, this.heartbeat_interval);
        clearTimeout(this.heartbeat_timeout);
        this.wsManager.emit('debug', 'Heartbeat send!', this.shardId);
    };

    /**
     * To handle websocket's messages received
     * @private
     * @param {APIpayload} data
     */
    #message(data) {
        this.wsManager.emit('debug', "Op: " + GATEWAY_OPCODES[data.op] + (data.s ? " Seq: " + data.s : ''), this.shardId);
        this.wsManager.emit(GATEWAY_OPCODES[data.op], data);
        this.sequence = data.s ?? this.sequence;
        this.session_timestamp = Date.now();
        switch (data.op) {
            case GATEWAY_OPCODES.DISPATCH:
                this.wsManager.emit('debug', 'Received an event: ' + data.t, this.shardId);
                this.wsManager.client.emit(...buildEventData(this, data));
                break;
            case GATEWAY_OPCODES.HEARTBEAT:
                this.#heartbeat();
                break;
            case GATEWAY_OPCODES.INVALID_SESSION:
                throw new Error('Invalid session', this.shardId);
            case GATEWAY_OPCODES.HELLO:
                this.heartbeat_interval = data.d.heartbeat_interval;
                if (this.session_id) {
                    this.#resume();
                } else {
                    this.#identify();
                }
                this.heartbeat_timeout = setTimeout(() => {
                    this.#heartbeat();
                }, Math.random() * this.heartbeat_interval);
                break;
            case GATEWAY_OPCODES.HEARTBEAT_ACK:
                this.ping = Date.now() - this.heartbeat_timestamp;
                clearTimeout(this.ack_timeout);
                this.heartbeat_timeout = setTimeout(() => {
                    this.#heartbeat();
                }, this.heartbeat_interval);
                break;
        }
    };

    /**
     * Just used to launch websocket's listeners
     * @private
     */
    #wsListeners() {
        this.ws.on('open', () => {
            this.wsManager.emit('debug', 'WebSocket connected!');
        });

        this.ws.on('message', data => {
            this.#message(JSON.parse(String(data)));
        });

        this.ws.on('close', code => {
            const close = GATEWAY_CLOSE_EVENT_CODES[code];
            if (close) {
                if (close.reconnect) {
                    this.wsManager.emit('debug', close.description + "... Reconnecting", this.shardId)
                    this.ws = new WebSocket(this.wsManager.options.url);
                    this.#wsListeners();
                } else {
                    this.ws.removeAllListeners();
                    this.wsManager.emit('debug', "Websocket closed: " + close.description, this.shardId);
                    this.delete(false);
                }
            } else {
                // Reconnect
                setTimeout(() => {
                    if (Date.now() - this.session_timestamp > 120000) throw new Error('Cannot connect to the gateway');
                    this.ws = new WebSocket(this.wsManager.options.url);
                    this.#wsListeners();
                }, 5000);
                clearTimeout(this.ack_timeout);
            }
        });

        this.ws.on('error', e => {
            this.wsManager.emit('debug', 'Error: ', e)
        });
    };

    /**
     * Set the shard's presence
     * @param {PresenceOptions} options 
     */
    setPresence({ since, activities, status, afk }) {
        this.ws.send(JSON.stringify({
            op: GATEWAY_OPCODES.PRESENCE_UPDATE,
            d: { since, activities, status, afk }
        }));
    };

    /**
     * Delete a shard
     * @private
     * @param {Boolean} [close=true] Whether the ws will be closed or not _**Don't touch it as a user of the package, or it will leave a ws connection working alone in background**_
     */
    delete(close=true) {
        if (close) this.ws.close(4015);
        clearTimeout(this.heartbeat_timeout);
        clearTimeout(this.ack_timeout);
        this.wsManager.shards.delete(this.shardId);
    };
}

module.exports = Shard;
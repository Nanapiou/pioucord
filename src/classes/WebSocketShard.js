import Websocket from 'ws';
import {GatewayOPCodes} from "discord-api-types/v6";
import {GatewayCloseCodes, PresenceUpdateStatus} from "discord-api-types/v10";
import {stringify} from 'node:querystring';

/**
 * @typedef IdentifyOptions
 * @property {string} token
 * @property {number} intents
 * @property {object} properties
 * @property {string} properties.os
 * @property {string} properties.browser
 * @property {string} properties.device
 * @property {number[]} [shard]
 * @property {number} [largeThreshold=50]
 * @property {boolean} [compress=false]
 * @property {PresenceData} [presence]
 */


export default class WebSocketShard {
    /**
     * @param {WebSocketManager} manager
     * @param {string} gatewayUrl
     * @param {number | null} [shardId=null]
     */
    constructor(manager, gatewayUrl, shardId = null) {
        this.manager = manager
        this.gatewayUrl = gatewayUrl;
        this.shardId = shardId;

        this.ws = null;
        this.sequence = 0;
        this.ping = 0;
        this.heartbeatSendTimestamp = null;
        this.ackTimeout = null;
        this.heartbeatTimeInterval = 0;
        this.heartbeatIntervalId = null;
        this.sessionId = null;
        /**
         * @type {IdentifyOptions}
         */
        this.sessionOptions = {};

        this.readyResolve = null;
        this.loginTimeout = null;
        this.pendingGuildMembersRequests = new Map();
    };

    /**
     * Setups the websocket connection
     * @param {string} url
     * @returns {Promise<object> | void} The user object
     */
    setupWs(url = this.gatewayUrl) {
        try {
            this.ws = new Websocket(url + '?' + stringify(this.manager.gatewayParams));
        } catch (e) {
            this.manager.emit('debug', this.shardId, "Connection lost");
            return;
        }
        this.ws.on('error', console.error);
        this.ws.once('open', () => this.manager.emit('debug', this.shardId, 'Open!'));
        this.ws.once('close', (code, buffer) => {
            this.manager.emit('debug', this.shardId, code, buffer.toString())
            clearInterval(this.heartbeatIntervalId);
            clearTimeout(this.ackTimeout);
            this.ackTimeout = null;
            switch (code) {
                case 1006:
                case 4015:  // Zombied
                    setTimeout(this.setupWs.bind(this), Math.floor(this.heartbeatTimeInterval / 2));
                    break;
                case 4016: // Voluntary close
                    this.manager.emit('debug', this.shardId, 'Voluntary close');
                    break;
                case 1001: // Going away, sometimes happens, act by restarting the connection
                case GatewayCloseCodes.UnknownError:
                case GatewayCloseCodes.UnknownOpcode:
                case GatewayCloseCodes.DecodeError:
                case GatewayCloseCodes.NotAuthenticated:
                case GatewayCloseCodes.AlreadyAuthenticated:
                case GatewayCloseCodes.InvalidSeq:
                case GatewayCloseCodes.RateLimited:
                case GatewayCloseCodes.SessionTimedOut:
                    this.setupWs();
                    break;
                default:
                    throw new Error(GatewayCloseCodes[code]);
            }
        });
        this.ws.on('message', buffer => {
            const data = JSON.parse(buffer.toString());
            this.handleMessage(data);
        });
        return new Promise(resolve => {
            this.loginTimeout = setTimeout(this.zombied.bind(this), 10_000);
            this.readyResolve = resolve;
        });
    };

    /**
     * Handle a message, received from the gateway
     * @param {object} data
     * @param {number} data.op
     * @param {*} data.d
     * @param {number | null} data.s
     * @param {string | null} data.t
     */
    handleMessage(data) {
        this.manager.emit('debug', this.shardId, 'Op: ' + GatewayOPCodes[data.op]);
        if (data.s) this.sequence = data.s;
        switch (data.op) {
            case GatewayOPCodes.Hello:
                this.heartbeatTimeInterval = data.d.heartbeat_interval;
                this.heartbeatIntervalId = setInterval(this.heartbeat.bind(this), data.d.heartbeat_interval);
                this.heartbeat();  // To init this.ping
                if (this.sessionId) {
                    this.resume();
                } else {
                    this.identify({
                        token: this.manager.client.token,
                        intents: Number(this.manager.client.intents.bitfield),
                        presence: this.manager.client.presence,
                        properties: {
                            os: process.platform,
                            browser: 'pioucord',
                            device: 'pioucord'
                        }
                    });
                }
                break;
            case GatewayOPCodes.Heartbeat:
                this.heartbeat();
                break;
            case GatewayOPCodes.HeartbeatAck:
                this.ping = Date.now() - this.heartbeatSendTimestamp;
                clearTimeout(this.ackTimeout);
                this.ackTimeout = null;
                break;
            case GatewayOPCodes.Reconnect:
                this.ws.close(GatewayCloseCodes.UnknownError);
                break;
            case GatewayOPCodes.Dispatch:
                this.handleEvent(data.t, data.d);
                break;
            case GatewayOPCodes.InvalidSession:
                if (data.d) {
                    this.resume();
                } else {
                    this.identify();
                }
        }
    };

    /**
     * Handle events (op DISPATCH)
     * @param {string} name
     * @param {*} data
     */
    handleEvent(name, data) {
        this.manager.emit('debug', this.shardId, name);
        Object.assign(data, {shardId: this.shardId, client: this.manager.client}); // Client is here while there isn't a better way to get it (with classes)
        switch (name) {
            case 'READY':
                clearTimeout(this.loginTimeout);
                this.loginTimeout = null;
                this.readyResolve(data.user);
                this.sessionId = data.session_id;
                this.gatewayUrl = data.resume_gateway_url;

                this.manager.client.user = data.user;
                this.manager.client.application = data.application;
                break;
            case 'RESUMED':
                clearTimeout(this.loginTimeout);
                this.loginTimeout = null;
                this.readyResolve();
                break;
            case 'VOICE_SERVER_UPDATE':
                this.manager.client.voiceManager.handleVoiceServerUpdate(data);
                break
            case 'GUILD_MEMBERS_CHUNK':
                this.handleGuildMembersChunk(data);
                break;
        }
        this.manager.emit(name, data);
    };

    /**
     * Send a payload to the gateway
     * @param {object} payload
     * @param {number} payload.op
     * @param {*} payload.d
     * @returns {*}
     */
    sendPayload(payload) {
        return this.ws.send(JSON.stringify(payload))
    };

    /**
     * Send a heartbeat to the gateway
     * @returns {*}
     */
    heartbeat() {
        this.manager.emit('debug', this.shardId, "Heartbeat");
        if (this.ackTimeout === null) this.ackTimeout = setTimeout(this.zombied.bind(this), this.heartbeatTimeInterval * 2.5);
        this.heartbeatSendTimestamp = Date.now();
        return this.sendPayload({
            op: GatewayOPCodes.Heartbeat,
            d: this.sequence
        });
    };

    /**
     * Close the connection, because the gateway didn't answer to a heartbeat
     * @returns {*}
     */
    zombied() {
        this.manager.emit('debug', this.shardId, 'Zombied');
        return this.ws.close(4015);
    };

    /**
     * Identify to the gateway, using the client token
     * @param {IdentifyOptions} options
     * @returns {*}
     */
    identify(options = this.sessionOptions) {
        this.manager.emit('debug', this.shardId, 'Identifying');
        this.sessionOptions = options;
        if (this.shardId === null) {
            return this.sendPayload({
                op: GatewayOPCodes.Identify,
                d: options
            });
        } else {
            return this.sendPayload({
                op: GatewayOPCodes.Identify,
                d: Object.assign({
                    shard: [this.shardId, this.manager.shardsCount]
                }, options)
            });
        }
    };

    /**
     * Resume the session
     * @returns {*}
     */
    resume() {
        this.manager.emit('debug', this.shardId, 'Resuming');
        return this.sendPayload({
            op: GatewayOPCodes.Resume,
            d: {
                token: this.sessionOptions.token,
                session_id: this.sessionId,
                seq: this.sequence
            }
        });
    };

    /**
     * Set the shard's presence
     * @param {PresenceData} presence
     * @returns {*}
     */
    setPresence({since, activities, status, afk}) {
        return this.sendPayload({
            op: GatewayOPCodes.PresenceUpdate,
            d: {
                since: since ?? null,
                activities: activities ?? [],
                status: status ?? PresenceUpdateStatus.Online,
                afk: afk ?? false
            }
        });
    };

    /**
     * @typedef {object} RequestGuildMembersOptions
     * @property {string} guildId
     * @property {?string} query
     * @property {?number} limit
     * @property {?boolean} presences
     * @property {?string[]} userIds
     */

    /**
     * Request guilds members through the gateway
     * @param {RequestGuildMembersOptions} options
     */
    requestGuildMembers({guildId, query, limit, presences, userIds}) {
        let nonce;
        do {
            nonce = Math.random().toString(36).substring(2); // TODO : Find a better way to generate a nonce
        } while (this.pendingGuildMembersRequests.has(nonce));
        const promise = new Promise(resolve => {
            this.pendingGuildMembersRequests.set(nonce, {
                members: [],
                resolve
            });
        });
        this.sendPayload({
            op: GatewayOPCodes.RequestGuildMembers,
            d: {
                guild_id: guildId,
                query: query ?? '',
                limit: limit ?? 0,
                presences: presences ?? false,
                user_ids: userIds ?? [],
                nonce
            }
        });
        return promise;
    };

    /**
     * Handle guild members chunk
     * @param data
     */
    handleGuildMembersChunk(data) {
        const request = this.pendingGuildMembersRequests.get(data.nonce);
        if (request) {
            request.members.push(...data.members);
            if (data.chunk_index + 1 === data.chunk_count) {
                request.resolve(request.members);
                this.pendingGuildMembersRequests.delete(data.nonce);
            }
        }
    };

    /**
     * Start to receive events from the guild
     * @param {string} guildId
     */
    addGuildEvents(guildId) {
        this.sendPayload({
            op: 14, // For an unknown reason, this is the "secret" op code to ask for guilds events
            d: {
                guild_id: guildId,
                typing: true
            }
        });
    };

    destroy() {
        this.ws.close(4016);
        this.manager.shards.delete(this.shardId);
    };
};
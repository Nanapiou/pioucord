const WebSocketManager = require('./WebSocketManager');
const Rest = require('./Rest');
const EventsEmitter = require('node:events');

/**
 * @typedef {Object} PresenceOptions
 * @property {"online"|"dnd"|"idle"|"offline"|"invisible"} status The client user's status
 * @property {number} [since] The creation date's timestamp of the presence
 * @property {boolean} [afk] If the client user is AFK or not
 * @property {ActivityOptions[]} [activities] Client user's activities
 */

/**
 * @typedef {Object} ClientOptions
 * @property {number} intents The websocket's connection intents, see {@link https://discord.com/developers/docs/topics/gateway#list-of-intents}
 * @property {PresenceOptions} [presence] The client user's presence
 */

/**
 * @typedef ActivityOptions See {@link https://discord.com/developers/docs/topics/gateway#activity-object-activity-structure}
 * @property {string} name The activity's name
 * @property {number} type The activity's type, see {@link https://discord.com/developers/docs/topics/gateway#activity-object-activity-types}
 * @property {string} [url] Stream url, is validated when type is 1
 */

/**
 * The main object to interact with the discord API
 * To know which events are throwed, look to {@link https://discord.com/developers/docs/topics/gateway#commands-and-events-gateway-events}
 * [Events name syntax]{@link https://discord.com/developers/docs/topics/gateway#event-names}
 * @extends {EventsEmitter}
 */
class Client extends EventsEmitter {
    /**
     * @constructor
     * @param {ClientOptions} gatewayOptions
     */
    constructor(gatewayOptions) {
        super();
        this.gatewayOptions = gatewayOptions;
        this.rest = new Rest({ 
            dns: 'discord.com',
            version: 10,
            authPrefix: 'Bot'
        });
        this.wsManager = new WebSocketManager(this);
    };
    
    /**
     * Set the client presence.
     * Every shard have a different presence, so shards which are not managed by this client will keep their previous presence.
     * @param {PresenceOptions} options 
     */
    setPresence(options) {
        for (const shard of this.wsManager.shards.values()) {
            shard.setPresence(options);
        };
    };

    /**
     * Login the client (Connect to the gateway and prepare for rest requests)
     * @param {String} token The bot's token to use
     * @return {Client} The client
     */
    login(token) {
        this.token = token;
        this.rest.setToken(token);
        this.rest.get(this.rest.authPrefix ? '/gateway/bot' : '/gateway').then(data => {
            this.wsManager.init(data);
        });
        return this;
    };
};

module.exports = Client;
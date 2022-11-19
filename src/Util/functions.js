import fetch from 'node-fetch'

/**
 * @typedef FetchOptions
 * @property {"GET"|"POST"|"PUT"|"PATCH"|"DELETE"} method
 * @property {*} body
 * @property {Object} headers
 */

/**
 * 
 * @param {String} url 
 * @param {FetchOptions} options 
 * @returns {Promise<Response>}
 */
export async function request(url, options) {
    return fetch(url, options)
}

/**
 * Build some data from a gateway payload (Only work with op 0)
 * @param {Shard} shard The shard who received the event
 * @param {object} payload The event data payload
 * @param {string} payload.t
 * @param {object} payload.d
 * @param {number} payload.op
 * @returns {(string|object)[]}
 */
export function buildEventData(shard, payload) {
    if (payload.op !== 0 || !payload.t || typeof payload.d != "object") throw new Error('Invalid payload received');
    const { client } = shard.wsManager;
    switch (payload.t) {
        case "READY": // Only case for now, maybe more in updates (Classes instead of API types for example)
            client.user = payload.d.user;
            shard.wsManager.startShard();
            break;
    };
    // const camelCase = payload.t.replace(/_?[A-Z]/g, e => e[0] == "_" ? e : e.toLowerCase()); Not used for now
    return [payload.t, Object.assign(payload.d, { client })];
};
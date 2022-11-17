export const GATEWAY_OPCODES = _enum([
    "DISPATCH",
    "HEARTBEAT",
    "IDENTIFY",
    "PRESENCE_UPDATE",
    "VOICE_STATE_UPDATE",
    null,
    "RESUME",
    "RECONNECT",
    "REQUEST_GUILD_MEMBERS",
    "INVALID_SESSION",
    "HELLO",
    "HEARTBEAT_ACK"
]);

export const GATEWAY_CLOSE_EVENT_CODES = _enum([
    { description: "UNKNOWN_ERROR", reconnect: true },
    { description: "UNKNOWN_OPCODE", reconnect: true },
    { description: "DECODE_ERROR", reconnect: true },
    { description: "NOT_AUTHENTICATED", reconnect: true },
    { description: "AUTHENTICATION_FAILED", reconnect: false },
    { description: "ALREADY_AUTHENTICATED", reconnect: true },
    null,
    { description: "INVALID_SEQ", reconnect: true },
    { description: "RATE_LIMITED", reconnect: true },
    { description: "SESSION_TIMED_OUT", reconnect: true },
    { description: "INVALID_SHARD", reconnect: false },
    { description: "SHARDING_REQUIRED", reconnect: false },
    { description: "INVALID_API_VERSION", reconnect: false },
    { description: "INVALID_INTENTS", reconnect: false },
    { description: "DISALLOWED_INTENTS", reconnect: false },
    // Custom
    { description: "DELETING_SHARD", reconnect: false },
    { description: "NO_ACK", reconnect: true },
], 4000, e => e.description);

export const HTTP_RESPONSE_CODES = _mirror({
    "200": "OK",
    "201": "CREATED",
    "204": "NO_CONTENT",
    "304": "NOT_MODIFIED",
    "400": "BAD_REQUEST",
    "401": "UNAUTHORIZED",
    "403": "FORBIDDEN",
    "404": "NOT_FOUND",
    "405": "METHOD_NOT_ALLOWED",
    "429": "TOO_MANY_REQUESTS",
    "502": "GATEWAY_UNAVAILABLE",
}, e => parseInt(e));

function _enum(arr, padding=0, fct=e=>e) {
    const obj = {};
    arr.forEach((e, i) => {
        if (e !== null) {
            obj[i + padding] = e;
            if (typeof fct(e) != "object") obj[fct(e)] = i + padding;
        }
    });
    return obj;
}

function _mirror(obj, fn=e=>e) {
    const n = {};
    for (const key in obj) {
        n[key] = obj[key];
        n[obj[key]] = fn(key)
    }
    return n;
}
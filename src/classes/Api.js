import User from "./api/User.js"

/**
 * @typedef RestOptions
 * @property {"Bot" | "Bearer"} [authPrefix=null]
 * @property {string} version
 * @property {string} [baseUrl="https://discord.com/api"]
 * @property {string} [token=null]
 */

export default class Api {
    /**
     * @param {RestOptions} rest
     */
    constructor(rest) {
        this.user = new User(rest)
    };
};
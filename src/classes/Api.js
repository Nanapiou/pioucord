import User from "./api/User.js"
import Rest from "./Rest.js"

export default class Api {
    /**
     * @param {Rest} rest
     */
    constructor(rest) {
        this.user = new User(rest)
    };
};

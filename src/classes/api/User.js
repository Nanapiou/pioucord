import {
    Routes, 
    RESTPostAPICurrentUserCreateDMChannelJSONBody, 
    RESTPutAPICurrentUserApplicationRoleConnectionJSONBody, 
    RESTGetAPICurrentUserGuildsQuery, 
    RESTPatchAPICurrentUserJSONBody
} from 'discord-api-types/v10';

/**
 * @typedef RestOptions
 * @property {"Bot" | "Bearer"} [authPrefix=null]
 * @property {string} version
 * @property {string} [baseUrl="https://discord.com/api"]
 * @property {string} [token=null]
 */

export default class User {
    /**
     * @param {RestOptions} rest
     */
    constructor(rest) {
        this.rest = rest
    }

    /**
	 * Returns a user object for a given user ID
	 * @param {string} userId
	 */

    async get(userId) {
        return await this.rest.get(Routes.user(userId));
    }

    /**
	 * Returns the user object of the requester's account
	 */

    async getCurrent() {
        return await this.rest.get(Routes.user());
    }

    /**
	 * Modify the requester's user account settings. Returns a user object on success
	 * @param {RESTPatchAPICurrentUserJSONBody} body
	 */

    async edit(body) {
        return await this.rest.patch(Routes.user(), {
            body
        });
    }

    /**
	 * Returns a list of partial guild objects the current user is a member of
	 * @param {RESTGetAPICurrentUserGuildsQuery} query
	 */

    async getGuilds(query) {
        return await this.rest.get(Routes.userGuilds(), {
            query
        });
    }

    /**
	 * Returns a guild member object for the current user
	 * @param {string} guildId
	 */

    async getGuildsMember(guildId) {
        return await this.rest.get(Routes.userGuildMember(guildId));
    }

    /**
	 * Leave a guild. Returns a 204 empty response on success
	 * @param {string} guildId
	 */

    async leaveGuild(guildId) {
        return await this.rest.delete(Routes.userGuild(guildId));
    }

    /**
	 * Returns the user object of the requester's account
	 * @param {RESTPostAPICurrentUserCreateDMChannelJSONBody} body
	 */

    async createDM(body) {
        return await this.rest.post(Routes.userChannels(), {body});
    }

    /**
	 * Returns a list of connection objects
	 */

    async getConnections() {
        return await this.rest.get(Routes.userConnections());
    }

    /**
	 * Returns the application role connection for the user
	 * @param {string} applicationId
	 */

    async getApplicationRoleConnection(applicationId) {
        return await this.rest.get(Routes.userApplicationRoleConnection(applicationId));
    }

    /**
	 * Updates and returns the application role connection for the user
	 * @param {string} applicationId
     * @param {RESTPutAPICurrentUserApplicationRoleConnectionJSONBody} body
	 */
    
    async updateApplicationRoleConnection(applicationId, body) {
        return await this.rest.put(Routes.userApplicationRoleConnection(applicationId), {
            body
        });
    }
};

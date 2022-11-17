export class Routes {

    /**
     * applicationCommand
     * @param {string} application_id 
     * @param {string} command_id 
     * @returns /applications/${application_id}/commands/${command_id}
     */

    static applicationCommand(application_id, command_id) {
       return `/applications/${application_id}/commands/${command_id}`;
    };

    /**
     * applicationCommandPermissions
     * @param {string} application_id 
     * @param {string} guild_id 
     * @param {string} command_id 
     * @returns /applications/${application_id}/guilds/${guild_id}/commands/${command_id}/permissions
     */

    static applicationCommandPermissions(application_id, guild_id, command_id) {
         return `/applications/${application_id}/guilds/${guild_id}/commands/${command_id}/permissions`;
    };

    /** 
     * applicationCommands
     * @param {string} application_id
     * @returns /applications/${application_id}/commands
     */
    
    static applicationCommands(application_id) {
        return `/applications/${application_id}/commands`;
    };

    /**
     * applicationGuildCommands
     * @param {string} application_id 
     * @param {string} guild_id 
     * @returns /applications/${application_id}/guilds/${guild_id}/commands/
     */

    static applicationGuildCommands(application_id, guild_id) {
        return `/applications/${application_id}/guilds/${guild_id}/commands`;
    };

    /**
     * applicationGuildCommand
     * @param {string} application_id 
     * @param {string} guild_id 
     * @param {string} command_id 
     * @returns /applications/${application_id}/guilds/${guild_id}/commands/${command_id}
     */

    static applicationGuildCommand(application_id, guild_id, command_id) {
        return `/applications/${application_id}/guilds/${guild_id}/commands/${command_id}`;
    };

    /**
     * channel
     * @param {string} channel_id 
     * @returns /channels/${channel_id}
     */

    static channel(channel_id) {
        return `/channels/${channel_id}`;
    };

    /**
     * channelBulkDelete
     * @param {string} channel_id 
     * @returns /channels/${channel_id}/messsages/bulk-delete
     */

    static channelBulkDelete(channel_id) {
        return `/channels/${channel_id}/messages/bulk-delete`;
    };

    /**
     * channelFollowers
     * @param {string} channel_id 
     * @returns /channels/${channel_id}/followers
     */
    
    static channelFollowers(channel_id) {
        return `/channels/${channel_id}/followers`;
    };

    /**
     * channelInvites
     * @param {string} channel_id 
     * @returns /channels/${channel_id}/invites
     */

    static channelInvites(channel_id) {
        return `/channels/${channel_id}/invites`;
    };

    /**
     * channelJoinedArchivedThreads
     * @param {string} channel_id 
     * @returns /channels/${channel_id}/users/@me/threads/archived/private
     */

    static channelJoinedArchivedThreads(channel_id) {
        return `/channels/${channel_id}/users/@me/threads/archived/private`;
    };

    /**
     * channelMessage
     * @param {string} channel_id 
     * @param {string} message_id 
     * @returns /channels/${channel_id}/messages/${message_id}
     */

    static channelMessage(channel_id, message_id) {
        return `/channels/${channel_id}/messages/${message_id}`;
    };

    /**
     * channelMessageAllReactions
     * @param {string} channel_id 
     * @param {string} message_id 
     * @returns /channels/${channel_id}/messages/${message_id}/reactions
     */

    static channelMessageAllReactions(channel_id, message_id) {
        return `/channels/${channel_id}/messages/${message_id}/reactions`;
    };

    /**
     * channelMessageCrosspost
     * @param {string} channel_id 
     * @param {string} message_id 
     * @returns /channels/${channel_id}/messages/${message_id}/crosspost
     */

    static channelMessageCrosspost(channel_id, message_id) {
        return `/channels/${channel_id}/messages/${message_id}/crosspost`;
    };

    /**
     * channelMessageOwnReaction
     * @param {string} channel_id 
     * @param {string} message_id 
     * @param {string} emoji 
     * @returns /channels/${channel_id}/messages/${message_id}/reactions/${emoji}/@me
     */

    static channelMessageOwnReaction(channel_id, message_id, emoji) {
        return `/channels/${channel_id}/messages/${message_id}/reactions/${emoji}/@me`;
    };

    /**
     * channelMessageUserReaction
     * @param {string} channel_id 
     * @param {string} message_id 
     * @param {string} emoji 
     * @param {string} user_id 
     * @returns /channels/${channel_id}/messages/${message_id}/reactions/${emoji}/${user_id}
     */

    static channelMessageUserReaction(channel_id, message_id, emoji, user_id) {
        return `/channels/${channel_id}/messages/${message_id}/reactions/${emoji}/${user_id}`;
    };

    /**
     * channelMessageReaction
     * @param {string} channel_id 
     * @param {string} message_id 
     * @param {string} emoji 
     * @returns /channels/${channel_id}/messages/${message_id}/reactions/${emoji}
     */

    static channelMessageReaction(channel_id, message_id, emoji) {
        return `/channels/${channel_id}/messages/${message_id}/reactions/${emoji}`;
    };

    /**
     * channelMessages
     * @param {string} channel_id 
     * @returns /channels/${channel_id}/messages
     */

    static channelMessages(channel_id) {
        return `/channels/${channel_id}/messages`;
    };
}

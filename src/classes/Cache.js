export class Cache {
    /**
     * A cache class, bound to the client.
     * @param {CacheOptions} options
     * @param {Client} client
     */
    constructor(options, client) {
        this.options = options;
        this.client = client;

        if (options.guilds) {
            this.guilds = new Map();
            client.ws.on("GUILD_CREATE", this.handleGuildCreate.bind(this));
            client.ws.on("GUILD_DELETE", this.handleGuildDelete.bind(this));
            client.ws.on("GUILD_UPDATE", this.handleGuildUpdate.bind(this));
        }
        if (options.users) {
            this.users = new Map();

            client.ws.on("MESSAGE_CREATE", this.handleMessageCreate.bind(this));
            client.ws.on("MESSAGE_DELETE", this.handleMessageDelete.bind(this));
            client.ws.on("MESSAGE_UPDATE", this.handleMessageUpdate.bind(this));
            client.ws.on("GUILD_MEMBER_ADD", this.handleGuildMemberAdd.bind(this));
            client.ws.on("GUILD_MEMBER_UPDATE", this.handleGuildMemberUpdate.bind(this));
        }
        if (options.channels) {
            this.channels = new Map();
            client.ws.on("CHANNEL_CREATE", this.handleChannelCreate.bind(this));
            client.ws.on("CHANNEL_DELETE", this.handleChannelDelete.bind(this));
            client.ws.on("CHANNEL_UPDATE", this.handleChannelUpdate.bind(this));
            client.ws.on("THREAD_CREATE", this.handleThreadCreate.bind(this));
            client.ws.on("THREAD_DELETE", this.handleThreadDelete.bind(this));
            client.ws.on("THREAD_UPDATE", this.handleThreadUpdate.bind(this));
            if (!options.guilds) {
                client.ws.on("GUILD_ROLE_CREATE", this.handleGuildRoleCreate.bind(this));
                client.ws.on("GUILD_ROLE_DELETE", this.handleGuildRoleDelete.bind(this));
                client.ws.on("GUILD_ROLE_UPDATE", this.handleGuildRoleUpdate.bind(this));
            }
        }
        if (options.roles) {
            this.roles = new Map();
            client.ws.on("GUILD_ROLE_CREATE", this.handleGuildRoleCreate.bind(this));
            client.ws.on("GUILD_ROLE_DELETE", this.handleGuildRoleDelete.bind(this));
            client.ws.on("GUILD_ROLE_UPDATE", this.handleGuildRoleUpdate.bind(this));
            if (!(options.channels || options.guilds)) {
                client.ws.on("GUILD_CREATE", this.handleGuildCreate.bind(this));
                client.ws.on("GUILD_DELETE", this.handleGuildDelete.bind(this));
                client.ws.on("GUILD_UPDATE", this.handleGuildUpdate.bind(this));
            }
        }
    }

    handleGuildCreate(guild) {
        if (this.options.guilds) this.guilds.set(guild.id, guild);
        if (this.options.channels) for (const channel of guild.channels) {
            this.channels.set(channel.id, channel);
        }
        if (this.options.roles) for (const role of guild.roles) {
            this.roles.set(role.id, role);
        }
    }

    handleGuildDelete(guild) {
        if (this.options.guilds) this.guilds.delete(guild.id);
        if (this.options.channels) for (const channel of guild.channels) {
            this.channels.delete(channel.id);
        }
        if (this.options.roles) for (const role of guild.roles) {
            this.roles.delete(role.id);
        }
    }

    handleGuildUpdate(guild) {
        this.guilds.set(guild.id, guild);
    }

    handleChannelCreate(channel) {
        this.channels.set(channel.id, channel);
    }

    handleChannelDelete(channel) {
        this.channels.delete(channel.id);
    }

    handleChannelUpdate(channel) {
        this.channels.set(channel.id, channel);
    }

    handleGuildRoleCreate(role) {
        this.roles.set(role.id, role);
    }

    handleGuildRoleDelete(role) {
        this.roles.delete(role.id);
    }

    handleGuildRoleUpdate(role) {
        this.roles.set(role.id, role);
    }

    handleMessageCreate(message) {
        this.users.set(message.author.id, message.author);
    }

    handleMessageDelete(message) {
        this.users.set(message.author.id, message.author);
    }

    handleMessageUpdate(message) {
        this.users.set(message.author.id, message.author);
    }

    handleThreadCreate(thread) {
        this.channels.set(thread.id, thread);
    }

    handleThreadDelete(thread) {
        this.channels.delete(thread.id);
    }

    handleThreadUpdate(thread) {
        this.channels.set(thread.id, thread);
    }

    handleGuildMemberAdd(member) {
        this.users.set(member.id, member.user);
    }

    handleGuildMemberUpdate(member) {
        this.users.set(member.id, member.user);
    }
}
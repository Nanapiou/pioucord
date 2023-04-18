import {Routes, ChannelType} from 'discord-api-types/v10';
import VoiceConnection from "./VoiceConnection.js";
import EventEmitter from "node:events";

export default class VoiceManager extends EventEmitter {
    constructor(client) {
        super();
        this.client = client;
        this.pending = new Map();
        this.voices = new Map();
    };

    async joinVoiceChannel(channelId, {self_mute, self_deaf}={}) {
        const channel = await this.client.rest.get(Routes.channel(channelId)).catch(() => null);
        if (!channel) throw new Error('Channel not found');
        if (channel.type !== ChannelType.GuildVoice) throw new Error('Channel is not a voice channel');
        if (!channel.guild_id) throw new Error('Channel is not in a guild');
        this.client.ws.forGuild(channel.guild_id).sendPayload({
            op: 4,
            d: {
                guild_id: channel.guild_id,
                channel_id: channelId,
                self_mute: self_mute ?? false,
                self_deaf: self_deaf ?? false
            }
        });
        const serverData = await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                this.pending.delete(channel.guild_id);
                reject(new Error('Timeout'));
            }, 10_000);
            this.pending.set(channel.guild_id, {
                resolve,
                reject,
                timeout
            });
        });
        const connection = new VoiceConnection(this, serverData, 4);
        this.voices.set(channel.guild_id, connection);
        connection.setupWS();
        return connection;
    };

    handleVoiceServerUpdate(data) {
        this.pending.get(data.guild_id)?.resolve(data);
    }
}
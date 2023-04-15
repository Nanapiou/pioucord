import Websocket from "ws";

export default class VoiceConnection {
    constructor(manager, {guild_id: guildId, channel_id: channelId, token, endpoint: gatewayUrl}, version=4) {
        this.manager = manager;
        this.guildId = guildId;
        this.channelId = channelId;
        this.token = token;
        this.gatewayUrl = 'wss://' + gatewayUrl + '?v=' + version;
        this.ws = null;
        this.heartbeatTimeInterval = 0;
        this.heartbeatIntervalId = null;
        this.ackTimeout = null;
    }

    setupWS(url=this.gatewayUrl) {
        try {
            this.ws = new Websocket(url);
        } catch (e) {
            console.error(e);
            return;
        }
        this.ws.on('error', console.error);
        this.ws.once('open', () => this.manager.emit('debug', this.guildId, 'Open!'));
        this.ws.once('close', (code, buffer) => {
            this.manager.emit('debug', this.guildId, `Close: ${code} ${buffer}`);
            clearInterval(this.heartbeatIntervalId);
            clearTimeout(this.ackTimeout);
            this.ackTimeout = null;
            this.manager.voices.delete(this.guildId); // For now
        });
        this.ws.once('message', buffer => {
            const data = JSON.parse(buffer.toString());
            this.handleMessage(data);
        });
    }

    identify() {
        return this.sendPayload({
            op: 0,
            d: {
                server_id: this.guildId,
                user_id: this.manager.client.user.id,
                session_id: this.manager.client.ws.forGuild(this.guildId).sessionId,
                token: this.token
            }
        });
    }

    handleMessage(data) {
        this.manager.emit('debug', this.guildId, `Message: ${data.op} ${JSON.stringify(data.d)}`);
        switch (data.op) {
            case 8: // Hello
                this.heartbeatTimeInterval = data.d.heartbeat_interval;
                this.heartbeatIntervalId = setInterval(this.heartbeat.bind(this), this.heartbeatTimeInterval);
                this.identify();
                break;
            case 6: // Ack
                clearTimeout(this.ackTimeout);
                this.ackTimeout = null;
        }
    }

    heartbeat() {
        this.manager.emit('debug', this.guildId, 'Sending heartbeat');
        if (this.ackTimeout === null) this.ackTimeout = setTimeout(this.zombied.bind(this), this.heartbeatTimeInterval * 2.5);
        return this.sendPayload({op: 3, d: Date.now()});
    }

    sendPayload(data) {
        console.log(data);
        return this.ws.send(JSON.stringify(data));
    }

    zombied() {
        this.manager.emit('debug', this.guildId, 'Zombied');
        return this.ws.close(4015);
    };
}
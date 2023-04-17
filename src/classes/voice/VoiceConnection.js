import Websocket from "ws";

export default class VoiceConnection {
    constructor(manager, {guild_id: guildId, channel_id: channelId, token, endpoint: gatewayUrl}, version=4) {
        this.manager = manager;
        this.guildId = guildId;
        this.channelId = channelId;
        this.token = token;
        this.gatewayUrl = 'wss://' + gatewayUrl + '?v=' + version;

        // Initialized with the HELLO payload
        this.ws = null;
        this.heartbeatTimeInterval = 0;
        this.heartbeatIntervalId = null;
        this.ackTimeout = null;

        // Received in the READY payload
        this.adress = null;
        this.port = null;
        this.ssrc = null;
        this.modes = null;
        this.streams = null;

        // Received in the SESSION_DESCRIPTION payload
        this.videoCodec = null;
        this.secretKey = null;
        this.mode = null;
        this.audioCodec = null;
        this.mediaSessionId = null;
    };

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
            this.ws.removeAllListeners();
            this.ws = null;
            clearInterval(this.heartbeatIntervalId);
            clearTimeout(this.ackTimeout);
            this.ackTimeout = null;
            this.manager.voices.delete(this.guildId); // For now
        });
        this.ws.on('message', buffer => {
            const data = JSON.parse(buffer.toString());
            this.handleMessage(data);
        });
    };

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
    };

    selectUDPProtocol() {
        this.sendPayload({
            op: 1,
            d: {
                protocol: 'udp',
                data: {
                    address: this.adress,
                    port: this.port,
                    mode: this.modes.includes('xsalsa20_poly1305') ? 'xsalsa20_poly1305' : this.modes[0]
                }
            }
        });
    };

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
                break;
            case 2: // Ready
                this.manager.emit('debug', this.guildId, 'Ready');
                // console.log(data.d);
                this.adress = data.d.ip;
                this.port = data.d.port;
                this.ssrc = data.d.ssrc;
                this.modes = data.d.modes;
                this.streams = data.d.streams;
                this.selectUDPProtocol();
                break;
            case 4: // Session Description
                console.log(data.d);
                this.videoCodec = data.d.video_codec;
                this.secretKey = data.d.secret_key;
                this.mode = data.d.mode;
                this.audioCodec = data.d.audio_codec;
                this.mediaSessionId = data.d.media_session_id;
                break;
            case 9: // Resumed
                this.manager.emit('debug', this.guildId, 'Resumed');
        }
    };

    heartbeat() {
        this.manager.emit('debug', this.guildId, 'Sending heartbeat');
        if (this.ackTimeout === null) this.ackTimeout = setTimeout(this.zombied.bind(this), this.heartbeatTimeInterval * 2.5);
        return this.sendPayload({op: 3, d: Date.now()});
    };

    speak({ microphone, soundShare, priority }) {
        return this.sendPayload({
            op: 5,
            d: {
                speaking: (microphone ?? 0) | ((soundShare ?? 0) << 1) | ((priority ?? 0) << 2),
                delay: 0,
                ssrc: this.ssrc,
            }
        });
    };

    sendPayload(data) {
        console.log(data);
        return this.ws.send(JSON.stringify(data));
    };

    zombied() {
        this.manager.emit('debug', this.guildId, 'Zombied');
        return this.ws.close(4015);
    };
}
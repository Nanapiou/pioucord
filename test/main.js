import {ActivityType, RouteBases, Routes, CDNRoutes, Client} from "../src/index.js";
import {TOKEN} from "./config.js";

const client = new Client({
    intents: ['Guilds', 'GuildMessages', 'MessageContent'],
    presence: {
        status: 'dnd',
        activities: [
            {
                name: 'Alt-J',
                type: ActivityType.Listening
            }
        ]
    }
});

client.ws.once('READY', data => {
    console.log(`Logged in as ${data.user.username}#${data.user.discriminator} (${data.user.id})`);
});
client.ws.on('MESSAGE_CREATE', async message => {
    if (message.content === '!ping') {
        return fetch(RouteBases.api + Routes.channelMessages(message.channel_id), {
            method: 'POST',
            body: JSON.stringify({
                embeds: [
                    {
                        title: 'Pong 🏓',
                        author: {
                            icon_url: RouteBases.cdn + CDNRoutes.userAvatar(message.author.id, message.author.avatar, 'png'),
                            name: message.author.username + '#' + message.author.discriminator
                        },
                        thumbnail: {
                            url: RouteBases.cdn + CDNRoutes.userAvatar(client.user.id, client.user.avatar, 'png')
                        },
                        description: `**WS ping :** \`${client.ws.ping}ms\``,
                        timestamp: new Date().toISOString()
                    }
                ],
                message_reference: {
                    message_id: message.id
                }
            }),
            headers: {
                Authorization: 'Bot ' + TOKEN,
                'content-type': 'application/json'
            }
        });
    } else if (message.content === '!spam') {
        for (let i = 0; i < 16; i++) client.rest.post(Routes.channelMessages(message.channel_id), { content: i.toString() })
    } else if (message.content.startsWith('!eval')) console.log(eval(message.content.slice(5)));
});

client.ws.on('debug', (shardId, text) => {
    console.log(`Shard ${shardId ?? 'MAIN'} | ${text}`);
});

await client.login(TOKEN);
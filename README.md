# Pioucord

*Don't except too much from this package for now, if you want something easier to use , then use [discord.js](https://www.npmjs.com/package/discord.js).*

This package is an API wrapper for discord.
It helps in different point, such as:

- Connection to the gateway with a WebSocket (including shards)
- Requests to the API
- Rate limits

## A simple bot

To know more about intents, check [here](https://discord.com/developers/docs/topics/gateway#gateway-intents).

To know more about presence, check [here](https://discord.com/developers/docs/topics/gateway#update-presence).

```js
const { Client, ActivityType, Routes } = require('pioucord');
const client = new Client({
    intents: ['Guilds', 'GuildMessages', 'MessageContent'],
    presence: {
        status: 'dnd',
        activities: [
            {
                name: '!ping',
                type: ActivityType.Playing
            }
        ]
    }
});

client.ws.on('READY', (data) => {
    console.log(`Logged in as ${data.user.username}#${data.user.discriminator} (${data.user.id})`);
});

client.ws.on('MESSAGE_CREATE', message => {
    if (message.content == "!ping") {
        client.rest.post(Routes.channelMessages(message.channel_id), {
            content: 'Pong!'
        });
    }
});

client.login('Some secret token goes here');
```

Here, when the bot will see a message with `!ping` as content, it will send `Pong!` in the same channel.

Since there's no classes for now, to reply to a message, you need to add the field `message_reference` in the message payload, check [here](https://discord.com/developers/docs/resources/channel#message-reference-object-message-reference-structure) for more infos.

It will look like:

```js
client.rest.post(Routes.channelMessages(message.channel_id), {
    content: 'Pong!',
    message_reference: {
        message_id: message.id
    }
});
```

You may have noticed two points:
- We should use `client.ws.on` instead of `client.on` to listen to events. (`client.on` is not implemented yet, and will be used for constructed objects)
- We cannot use `client.user` in the `READY` event. (Events received from `ws` don't wait for the building of `client`)

## Sharding

To know more about shards, check [here](https://discord.com/developers/docs/topics/gateway#sharding).

You can use specific shards to start your bot with:

```js
const { Client } = require('pioucord');
const client = new Client({
    intents: 'some intents, check above',
    shards: [0, 2],
    shardCount: 3
});
```

If you don't put any, it will identify to the gateway without providing shards.

## Handler

It isn't supported by the package itself, it's much better to let the user create it himself.

### A little handler example

If you want, you can create a commands' handler, which will make your bot easier to manage.

*You can create an events one if you want, but I will not show it here.*

```js
const { readdirSync } = require('node:fs'); // Used to read dirs, need an absolute path
const { Client } = require('pioucord');

// Simple client creation
const client = new Client({
    intents: ['GuildMessages', 'MessageContent']
});

// Reading the commands folder
client.commands = new Map();
const path = 'absolute path goes here';
for (const file of readdirSync(path)) {
    const command = require(path + file);
    client.commands.set(command.name, command);
};

// Listening messages
const prefix = '!';
client.on('MESSAGE_CREATE', message => {
    if (message.author.bot || !message.content.startsWith(prefix)) return;

    const args = message.content.split(/ +/);
    const command = client.commands.get(args.shift().slice(prefix.length));

    if (!command) return;

    command.execute(message, args);
});

client.login('token goes here as always');
```

And then, put some files in the commands folder which looks like:

```js
import { Routes } from 'pioucord';

module.exports = {
    name: 'ping',
    execute: (message, args) => {
        // The client is in each events objects
        message.client.rest.post(Routes.channelMessages(message.channel_id), {
            content: 'Pong!',
            message_reference: {
                message_id: message.id
            }
        });
    }
};
```

*Call it as you want, it won't change anything, but try to make something understandable.*

### Upgrade the handler

You may be tired because of all these `client.rest`, because the package still don't have classes (it should be out for the __V2__).

If you don't want to wait (and you are right), you are free to add some functions to your handler, here is a little example:

```js
client.on('MESSAGE_CREATE', message => {
    if (message.author.bot || !message.content.startsWith(prefix)) return;

    const args = message.content.split(/ +/);
    const command = client.commands.get(args.shift().slice(prefix.length));

    if (!command) return;

    // Here, modifications
    const functions = {
        channelSend: (data) => {
            return client.rest.post(Routes.channelMessages(message.channel_id), data);
        },
        messageReply: (data) => {
            return client.rest.post(Routes.channelMessages(message.channel_id), Object.assign(data,
                {
                    message_reference: {
                        message_id: message.id
                    }
                }
            ));            
        }
    };

    // Don't forget to send them
    command.execute(message, args, functions);
});
```

And then, the `ping` command file:

```js
module.exports = {
    name: 'ping',
    execute: (message, args, functions) => {
        functions.messageReply({ content: 'Pong!' });
    }
};
```

See? Much clearer!

## Debug

That's not something very important, but you can use the `debug` event on the ws, like:
```js
client.ws.on('debug', (shardId, text) => {
    console.log(`Shard ${shardId ?? 'MAIN'} | ${text}`);
});
```

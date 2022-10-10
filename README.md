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
const { Client } = require('pioucord');
const client = new Client({
    intents: (1 << 9) | (1 << 15), // GUILD_MESSAGES and MESSAGE_CONTENT, equals to 33280
    presence: {
        status: 'dnd',
        activities: [
            {
                name: '!ping',
                type: 0 // Playing
            }
        ]
    }
});

client.on('READY', () => {
    console.log(`Logged in as ${client.user.username}#${client.user.discriminator} (${client.user.id})`);
});

client.on('MESSAGE_CREATE', message => {
    if (message.content == "!ping") {
        client.rest.post(`/channels/${message.channel_id}/messages`, {
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
client.rest.post(`/channels/${message.channel_id}/messages`, {
    content: 'Pong!',
    message_reference: {
        message_id: message.id
    }
});
```

## Sharding

To know more about shards, check [here](https://discord.com/developers/docs/topics/gateway#sharding).

You can use specific shards to start your bot with:

```js
const { Client } = require('pioucord');
const client = new Client({
    intents: 'some intents, check above',
    shards: [
        [0, 3],
        [2, 3]
    ]
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
    intents: 33280, // GUILD_MESSAGES and MESSAGE_CONTENT
});

// Reading the commands folder
client.commands = new Map();
const path = 'absolute path goes here';
for (const file of readdirSync(path)) {
    const command = require(path + file);
    client.commands.set(command.name, command);
};

// Listenning messages
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
module.exports = {
    name: 'ping',
    execute: (message, args) => {
        client.rest.post(`/channels/${message.channel_id}/messages`, {
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
            return client.rest.post(`/channels/${message.channel_id}/messages`, data);
        },
        messageReply: (data) => {
            return client.rest.post(`/channels/${message.channel_id}/messages`, Object.assign(data,
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

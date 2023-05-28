# Pioucord

<div align="center">
	<p>
		<a href="https://www.npmjs.com/package/pioucord"><img src="https://img.shields.io/npm/dt/pioucord?logo=npm" alt="npm download" /></a>
		<a href="https://github.com/Nanapiou/pioucord"><img src="https://img.shields.io/github/package-json/v/Nanapiou/pioucord?logo=github" alt="github version" /></a>
	</p>
</div>

*Don't except too much from this package for now, if you want something easier to use , then
use [discord.js](https://www.npmjs.com/package/discord.js).*

`pioucord` is an ES package that allows you to create a discord bot with ease.
It helps in different point, such as:

- Connection to the gateway with a WebSocket (including shards)
- Requests to the API
- Rate limits

## Installation

```bash
npm install pioucord
```

## A simple bot

To know more about intents, check [here](https://discord.com/developers/docs/topics/gateway#gateway-intents).

To know more about presence, check [here](https://discord.com/developers/docs/topics/gateway#update-presence).

```js
import {Client, ActivityType, Routes} from 'pioucord';

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
    console.log(`Logged in as ${client.user.username}#${client.user.discriminator} (${client.user.id})`);
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

Since there's no classes for now, to reply to a message, you need to add the field `message_reference` in the message
payload,
check [here](https://discord.com/developers/docs/resources/channel#message-reference-object-message-reference-structure)
for more infos.

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

- We should use `client.ws.on` instead of `client.on` to listen to events. (`client.on` is not implemented yet, and will
  be used for constructed objects)
- We can use `client.user` as soon as the `READY` event is thrown.
- Events are in screaming case, and the provided parameters are raw data from the gateway, check event
  list [here](https://discord.com/developers/docs/topics/gateway-events#receive-events).

## Sharding

To know more about shards, check [here](https://discord.com/developers/docs/topics/gateway#sharding).

You can use specific shards to start your bot with:

```js
import {Client} from 'pioucord';

const client = new Client({
    intents: 'some intents, check above',
    shards: [0, 2],
    shardsCount: 3
});
```

If you don't put any, it will identify to the gateway without providing shards.

## Uploading files

To know how files upload works, check [here](https://discord.com/developers/docs/reference#uploading-files).

To upload files, you just need to use the `files` field in the payload, and put an array of files.

```js
// ...
client.ws.on('MESSAGE_CREATE', message => {
    if (message.content == "!image") {
        client.rest.post(Routes.channelMessages(message.channel_id), {
            content: 'Beautiful image!',
            message_reference: {
                message_id: message.id
            },
            files: [{
              name: 'image.png',
              description: 'Image',
              file: "A buffer goes here"
            }]
        });
    }
});
// ...
```

## Handler

It isn't supported by the package itself, it's much better to let the user create it himself.

### A little handler example

If you want, you can create a commands' handler, which will make your bot easier to manage.

*You can create an events one if you want, but I will not show it here.*

```js
import {readdir} from 'node:fs/promises'; // Used to read dirs, need an absolute path
import {Client} from 'pioucord';

// Simple client creation
const client = new Client({
    intents: ['GuildMessages', 'MessageContent']
});

// Reading the commands folder
client.commands = new Map();
const path = 'absolute path goes here';
for (const file of await readdir(path)) {
    const command = (await import('file://' + path + file)).default;
    client.commands.set(command.name, command);
}
;

// Listening messages
const prefix = '!';
client.ws.on('MESSAGE_CREATE', message => {
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
import {Routes} from 'pioucord';

export default {
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

You can access the client from every event.

*Call it as you want, it won't change anything, but try to make something understandable.*

### Upgrade the handler

You may be tired because of all these `client.rest`, because the package still don't have classes (it should be out for
the __V2__).

If you don't want to wait (and you are right), you are free to add some functions to your handler, here is a little
example:

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
export default {
    name: 'ping',
    execute: (message, args, functions) => {
        functions.messageReply({content: 'Pong!'});
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

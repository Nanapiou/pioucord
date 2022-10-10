const { readdirSync } = require('node:fs'); // Used to read dirs, need an absolute path
const { Client } = require('./src/index');

// Simple client creation
const client = new Client({
    intents: 33280, // GUILD_MESSAGES and MESSAGE_CONTENT
});

client.on('READY', () => {
    console.log(`Logged in as ${client.user.username}`);
})

// Reading the commands folder
client.commands = new Map();
const path = './commands/';
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

client.login('OTM3Mzk3NDgyNTE2Nzg3MjQw.GWao_q.wSrLJOULDbH6TQ6QW8CshmDh3BcUZThkkXOU2U');
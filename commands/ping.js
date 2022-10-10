module.exports = {
    name: 'ping',
    execute: (message, args) => {
        message.client.rest.post(`/channels/${message.channel_id}/messages`, {
            content: 'Pong!' + (args.length > 0 ? `\n${args.join(', ')}` : ''),
            message_reference: {
                message_id: message.id
            }
        });
    }
};
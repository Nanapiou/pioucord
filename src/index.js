const { Client, WebSocketManager, Shard, Rest } = require('./Classes/index');

module.exports= {
    Client,
    WebSocketManager,
    Shard,
    Rest,
    GatewayIntents: require('./Util/GatewayIntents'),
    Routes: require('./Util/Routes'),
    Constants: require('./Util/Constants'),
    functions: require('./Util/functions'),
};
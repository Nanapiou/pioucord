const { Client, WebSocketManager, Shard, Rest } = require('./Classes/index');

module.exports= {
    Client,
    WebSocketManager,
    Shard,
    Rest,
    Constants: require('./Util/Constants'),
    functions: require('./Util/functions')
}
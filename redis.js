const Redis = require('ioredis');
const redis = new Redis();

async function get(key) {
    let value = await redis.get(key);
    value = JSON.parse(value);
    return value;
}

function set(key, value) {
    return redis.set(key, JSON.stringify(value));
}

async function getRequests(address) {
    return get(address);
}
module.exports = { get, set };
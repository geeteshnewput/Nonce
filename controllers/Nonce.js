const { get, set } = require('../redis');

class Nonce {

    constructor() {
        
    }
    // this service should be used and nonce last value and failed value can be kept
    async getNonce (address) {
        let newNonce = 1;
        let failNonce = 0;
        const nonceForAddress = await get(`${address}nonce`);
        if (nonceForAddress) {
            const { nonce, failedNonce } = nonceForAddress;
            newNonce = nonce + 1;
            if (failedNonce) {
                failNonce = 0;
                return failedNonce;
            }
        }
        await set(`${address}nonce`, {nonce: newNonce, failedNonce: failNonce});
        return newNonce;
    }

    async putNonce (address, failedNonce) {
        const { preNonce } = await get(`${address}nonce`);
        await set(`${address}nonce`, {nonce: preNonce, failedNonce});
    }
}

module.exports = Nonce;

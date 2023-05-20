class BlockChain {
    constructor() {
    }

    sendreq (req) {
        console.log('request reached to blockchain network', req);
        if (req.isFailed) return { status: 'FAILED'};
        return { status: 'SUCCESS'}
    }
}

module.exports = BlockChain;
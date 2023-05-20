class BlockChain {
    constructor() {
    }

    sendreq (req) {
        if (req.isFailed) return { status: 'FAILED'};
        return { status: 'SUCCESS'}
    }
}

module.exports = BlockChain;
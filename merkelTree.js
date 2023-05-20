const crypto = require('crypto');

class MerkelTree {
    merkelTree = [];
    constructor(transactions = []) {
        this.transactions = transactions;
        this.start();
      }
    
    start() {
        // hashTransactions
        this.createTree(this.transactions)
    }

    hash(hashString) {
        // create Hash
        return hashString ? crypto.createHash('sha256').update(hashString).digest('hex') : ''   ;
    }

    createTree() {
            // Example:- 
            //             0123
            //     01              23
            
            // 0       1       2       3

        // if transactions are not even we duplicate the last transactions.
        if (this.transactions.length % 2 !== 0) {
            this.transactions.push(this.transactions[this.transactions.length - 1]);
        }

        // creating tree with leaf nodes and hashing it.
        this.transactions.map(transaction => {
            const transactionHash = this.hash(transaction);
            this.merkelTree.push(transactionHash);
        });

        // Now creating the whole merkelTree.
        let curLayer = this.merkelTree;
        // updating current layer recursivly
        while (curLayer.length > 1) {
            let nextLayer = [];
            for (let index = 0; index < curLayer.length; index += 2) {
                const combinedHash = this.hash(curLayer[index] + curLayer[index+1]);
                nextLayer.push(combinedHash);
            }
            curLayer = nextLayer;
            // concating layer wise inside the merkelTree.
            this.merkelTree = [...this.merkelTree, ...nextLayer];
        }
    }

    getMerkelTree() {
        return this.merkelTree;
    }

    // fetching the merkel root which is in the last index
    fetchMerkelRoot() {
        return this.merkelTree[this.merkelTree.length - 1];
    }
    // verify the transactions
    verifyTransaction() {

    }

}
module.exports = MerkelTree;
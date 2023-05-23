const crypto = require('crypto');
const Nonce = require('./Nonce');
const BlockChain = require('./BlockChain');
const { get, set } = require('../redis');
const { ADDRESSES } =  require('../constant');
const TxnStatus = {
    PENDING: 'PENDING',
    SUCCESS: 'SUCCESS',
    FAILED: 'FAILED'
}


class Address {
    address;
    // requestPool = [];
    constructor() {
        this.lock = false;
        this.address = this.generateAddress();
    }

    async generateAddressOnStartUp(NumberOfaddress = 3) {
        const addresses = [];
        for (let i = 0; i< NumberOfaddress; i++) {
            const address = this.generateAddress();
            set(address, []);
            addresses.push(address);
        }
        await set(ADDRESSES, addresses);
        const addresse = await get(ADDRESSES);
        console.log('all address ', addresse);
    }

    generateAddress(i = 0) {
        const address = crypto.randomBytes(16);
        return address.toString('hex');
    }

    async setReqToAddress(address, req) {
        // const addressLock = await get(`${address}-lock`);
        // console.log('lock is',req.id, this.lock);
        while (this.lock) {
        // while (addressLock) {
            // console.log('lock is active so waiting',req.id)
            // If the lock is acquired by another service, wait
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        // console.log('setting lock before going to nonce', req.id);
        // await set(`${address}-lock`, true);
        // console.log('lock is set to true', req.id);
        this.lock = true;
        await this.setNonce(address, req);
    }

    async setNonce(address, req) {
        // const addressLock = await get(`${address}-lock`);
        // console.log('lock is active',req.id , addressLock);
        // fetching nonce latest value from the pool
        let previousRequestOfThisAddress = await get(address);
        const selectedAddressReq = previousRequestOfThisAddress;
        let updatedRequest = req;
        const nonceInstance = new Nonce();
        const nonce = await nonceInstance.getNonce(address);
        console.log('nonce for',req.id, nonce);

        if (nonce) {
            updatedRequest = {
                ...req,
                nonce
            }
        }
        // pushing the new nonce to the pool while using redis;
        selectedAddressReq.push(updatedRequest);
        await set(address, selectedAddressReq);
        let pre = await get(address);
        this.lock = false;
        // set(`${address}-lock`, false);
        // const addressLockClosed = await get(`${address}-lock`, true);
        // console.log('lock is closed',req.id , addressLockClosed);
        return updatedRequest;
    }

    async sendReqToNetwork () {
        const blockChain = new BlockChain();
        const nonceInstance = new Nonce();
        const requestPool = await get(ADDRESSES);
        // request nonce are set now sending the req to network/BC
        for (let i = 0; i < requestPool?.length; i++ ) {
            let isFailed = false;
            let selectedAddressValue = await get(requestPool[i]);
            for (let j = 0; !isFailed && j <= selectedAddressValue?.length; j++ ) {
                let selectedReq = selectedAddressValue[j];
                if (selectedReq) {
                    const blockChainResponse = await blockChain.sendreq(selectedReq);
                    if (blockChainResponse?.status == TxnStatus.FAILED) {
                        isFailed = true;
                        const reqWithNoFailedTxn = selectedAddressValue.filter(req => req.id != selectedReq.id);
                        await nonceInstance.putNonce(requestPool[i], selectedReq?.nonce)
                        await set(requestPool[i], reqWithNoFailedTxn);
                        // wait for new request to come
                        selectedReq.status = TxnStatus.SUCCESS;
                    }
                }
                // Move to next request
            }
            // console.log('selectedAddressValue', await get(requestPool[i]));
                // Move to next Address
        }
    }

    async findMissingNumber (sequenceArray) {
        if (sequenceArray?.length == 1) {
            return 0;
        }
        // Calculate the expected sum using the sum formula
        var n = sequenceArray.length + 1;
        var expectedSum = (n * (n + 1)) / 2;
      
        // Calculate the actual sum of the array elements
        var actualSum = 0;
        for (var i = 0; i < sequenceArray.length; i++) {
          actualSum += sequenceArray[i];
        }
      
        // The missing number is the difference between the expected sum and the actual sum
        var missingNumber = expectedSum - actualSum;
      
        return missingNumber;
      }
}

module.exports = Address;



// async setNonce(address, req) {
//     // fetching nonce latest value from the pool
//     let previousRequestOfThisAddress = await get(address);
//     const selectedAddressReq = previousRequestOfThisAddress;
//     const newRequestOfThisAddress = previousRequestOfThisAddress;
//     let updatedRequest = req
//     if (!selectedAddressReq?.length) {
//         updatedRequest = {
//             ...req,
//             nonce: 1
//         }
//     }
//     if (selectedAddressReq?.length) {
//         // Liner search is not possible for large data
//         const sortedAddressReq = selectedAddressReq.sort(function(a, b) {
//             return b?.nonce - a?.nonce;
//         });
//         const lastNonceValue = sortedAddressReq[selectedAddressReq?.length - 1]?.nonce;
//         // Fining the failed txn 
//         const seqArray = sortedAddressReq.map(r => r.nonce);
//         const failedNonceValue = await this.findMissingNumber(seqArray);
//         if (failedNonceValue) {
//             updatedRequest = {
//                 ...req,
//                 status: '',
//                 nonce: failedNonceValue
//             }
//         }
//         updatedRequest = {
//             ...req,
//             status: '',
//             nonce: lastNonceValue + 1
//         }
//     }
//     // pushing the new nonce to the pool while using redis;
//     newRequestOfThisAddress.push(updatedRequest);
//     await set(address, newRequestOfThisAddress);
//     let pre = await get(address);
//     return updatedRequest;
// }
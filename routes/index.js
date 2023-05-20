const express = require('express');
const router = express.Router();
const Address = require('../controllers/Address');
const { get, set } = require('../redis');

router.get('/setNonce', async (req, res) => {
    /* 

    // address generated at the start of the app
    address = ['A1', 'A2', 'A3];
    */
   const req1 = {
    id: 'req1',
    isFailed: false,
    transaction: [{amount: 100, from : 'c', to: 'd'}]
   };
   const req2 = {
    id: 'req2',
    isFailed: true,
    transaction: [{amount: 100, from : 'e', to: 'd'},]
   };
   const req3 = {
    id: 'req3',
    isFailed: false,
    transaction: [{amount: 100, from : 'c', to: 'h'},]
   };
   const req4 = {
    id: 'req4',
    isFailed: false,
    transaction: [{amount: 100, from : 'j', to: 'h'},]
   };
    const requestsArray = [req1, req2, req3, req4];
    const allAddress = await get('addresses');
    const address = new Address();
    for (let i = 0; i < requestsArray.length; i++) {
      const randomNumber = Math.floor(Math.random() * 90) + 10;
      addressIndex = randomNumber % allAddress.length;
      await address.setReqToAddress(allAddress[addressIndex], requestsArray[i]);
    }
    await address.sendReqToNetwork()
    res.status(200).json({allAddress})
});

module.exports = router;
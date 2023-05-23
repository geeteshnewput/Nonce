const express = require('express');
const router = express.Router();
const Address = require('../controllers/Address');
const { get, set, getRequests } = require('../redis');
const { ADDRESSES, ADDRESS_THRESHOLD } =  require('../constant');

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

    const requestsArray = [req1, req2, req3];
    const allAddress = await get(ADDRESSES);
    const address = new Address();
    for (let i = 0; i < requestsArray.length; i++) {
      const randomNumber = Math.floor(Math.random() * 90) + 10;
      addressIndex = randomNumber % allAddress.length;
      await address.setReqToAddress(allAddress[addressIndex], requestsArray[i]);
    }
    await address.sendReqToNetwork()
    res.status(200).json({allAddress})
});


router.get('/sendConcurrentReq', async (req, res) => {

 const req4 = {
  id: 'req4',
  isFailed: false,
  transaction: [{amount: 100, from : 'j', to: 'h'},]
 };
 const req5 = {
  id: 'req5',
  isFailed: false,
  transaction: [{amount: 100, from : 'j', to: 'h'},]
 };
  const requestsArray = [req4, req5];
  const allAddress = await get(ADDRESSES);
  const address = new Address();
  await Promise.all([address.setReqToAddress(allAddress[0], requestsArray[0]), address.setReqToAddress(allAddress[0], requestsArray[1])]);
  // await Promise.all([address.setReqToAddress(allAddress[1], requestsArray[0]), address.setReqToAddress(allAddress[1], requestsArray[1])]);
  await address.sendReqToNetwork();
  res.status(200).json({allAddress})
});

module.exports = router;
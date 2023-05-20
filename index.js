const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const routes = require('./routes');
const Address = require('./controllers/Address');
const {get, set} = require('./redis');
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api', routes);

app.listen(PORT, () => {
  const address = new Address()
  address.generateAddressOnStartUp(1);
  console.log(`Server listening on port ${PORT}`);
});

const routes = require('express').Router();
const main = require('./main');

// View for dashboard
routes.get('/', (req, res) => {
  res.sendFile('client/index.html', { root: __dirname });
});

// Transaction View
routes.get('/transactions/:address', (req, res) => {
  res.render('transactions', { address: req.params.address });
});

// JSON routes
// Get ether address data from etherscan.
routes.get('/ether/:address', (req, res) => {
  main.getAddressData(req.params.address, req.query).then((data) => {
    res.json(data);
  });
});

// Get all transactions from database.
routes.get('/address/all', (req, res) => {
  main.getAllTransactions().then((data) => {
    res.json(data);
  });
});

// Get balance only for particular address.
routes.get('/ether/balance/:address', (req, res) => {
  main.getAddressData(req.params.address, false, true).then((data) => {
    res.json(data);
  });
});

module.exports = routes;

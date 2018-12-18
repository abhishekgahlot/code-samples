const request = require('request-promise');
const { to } = require('await-to-js');
const BigNumber = require('bignumber.js');
const WAValidator = require('wallet-address-validator');

const { ethertransactionurl, etherscankey, etherbalanceurl } = require('./config');
const { getDB } = require('./dbConnect');

const Wei = new BigNumber(10 ** -18); // 1 wei = 10**-18 ether

/**
 * Returns the prepared etherscan api url by putting apikey and address in url.
 * @param {string} url
 * @param {string} apikey
 * @param {string} address
 */
function getUrl(url, apikey, address) {
  return url.replace('APIKEY', etherscankey).replace('ADDRESS', address);
}

/**
 * Fetch the balance using etherscan api
 * @param {string} address of ether wallet
 * @returns {float} ether balance
 */
async function getBalance(address) {
  const url = getUrl(etherbalanceurl, etherscankey, address);
  const [err, requestData] = await to(request.get(url));
  if (err) throw new Error('Error fetching balance.');

  const etherBalance = new BigNumber(JSON.parse(requestData).result).multipliedBy(Wei);
  return etherBalance.toNumber();
}

/**
 * Fetch the transactions using etherscan api
 * @param {string} address of ether wallet
 * @returns {Array} ether transactions
 */
async function getTransactions(address) {
  const url = getUrl(ethertransactionurl, etherscankey, address);
  const [err, requestData] = await to(request.get(url));
  if (err) throw new Error('Error sending request.');
  return JSON.parse(requestData).result;
}

/**
 * Fetch the transactions and balance and store in database
 * @param {string} address of ether wallet can be uppercase or lowercase
 * @returns {Array} ether transactions
 */
async function getAddressData(rawAddress, searchParam = false, needBalance = false) {
  // Search param can be used to search in mongodb itself or filter objects.
  const address = rawAddress.toLowerCase(); // for future filtering.

  if (!WAValidator.validate(address, 'ETH')) return 'Invalid Address.';

  const [err, dbVal] = await to(getDB().findOne({ address }));

  // Address found in DB return.
  if (!err && dbVal) {
    if (needBalance) return { balance: dbVal.balance };
    return dbVal;
  }

  // Get balance and transactions and store in DB
  const [balance, transactions] = [await getBalance(address), await getTransactions(address)];

  transactions.map(tx => tx.ether = new BigNumber(tx.value).multipliedBy(Wei).toNumber()); // eslint-disable-line

  const dbInsertVal = {
    address,
    transactions,
    balance,
  };

  const [errInsert] = await to(getDB().insertOne(dbInsertVal));

  if (!errInsert) {
    if (needBalance) return { balance: dbInsertVal.balance };
    return dbInsertVal;
  }

  return [];
}

/**
 * Get all transactions from db.
 * @param {null}
 * @returns {null}
 */
async function getAllTransactions() {
  const [err, dbVal] = await to(getDB().find({}).toArray());
  if (!err && dbVal) {
    return dbVal;
  }

  return {};
}

module.exports = {
  getAddressData,
  getAllTransactions,
};

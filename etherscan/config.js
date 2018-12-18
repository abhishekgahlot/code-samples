module.exports = {
  db: {
    url: 'mongodb://localhost:27017/',
    name: 'etherscan',
    collection: 'transactions',
    index: {
      address: 1,
    },
  },
  ethertransactionurl: 'https://api.etherscan.io/api?module=account&action=txlist&address=ADDRESS&startblock=0&endblock=99999999&sort=asc&apikey=APIKEY',
  etherscankey: 'RIRQPJ1T7392IDFMI8SJUBZMB95JZHHDEP',
  etherbalanceurl: 'https://api.etherscan.io/api?module=account&action=balance&address=ADDRESS&tag=latest&apikey=APIKEY',
  appPort: 3000,
};

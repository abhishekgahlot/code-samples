const request = require('request-promise');

const redis = require('redis');
const bluebird = require('bluebird');

bluebird.promisifyAll(redis);

const client = redis.createClient();

const { exchangesMap } = require('../exchanges');

async function coinTickerRequest(exchangesMap, exchangeName) {
  function extractHuobiTickerData(data) {
    let newData = {};
    let originalSymbols = exchangesMap[exchangeName].symbols;
    for (let ticker of data) {
      ticker.symbol = ticker.symbol.toUpperCase();
      for (let symbol of originalSymbols) {
        if (symbol.split('/').join('') === ticker.symbol) {
          ticker.symbol = symbol;
          newData[symbol] = ticker;
        }
      }
    }
    return newData;
  }
  
  function extractZbTickerData(data) {
    let newData = {};
    let originalSymbols = exchangesMap[exchangeName].symbols;
    for (let symbol of originalSymbols) {
      let convertedSymbol = symbol.split('/').join('').toLowerCase();
      if (convertedSymbol in data) {
        data[convertedSymbol].symbol = symbol;
        newData[symbol] = data[convertedSymbol]
      }
    }
    return newData;
  }
  
  async function fetchTickerOneByOne() {
    let n = []
    let newData = {};
    for (let symbol of exchangesMap[exchangeName].symbols) {
      n.push(exchangesMap[exchangeName].fetchTicker(symbol))
    }
    let allTickers = await Promise.all(n);
    for(ticker of allTickers) {
      newData[ticker.symbol] = ticker;
    }
    return newData;
  }
  
  switch (exchangeName) {
    case 'ZB':
      let zbData = await request.get('http://api.zb.cn/data/v1/allTicker');
      return extractZbTickerData(JSON.parse(zbData));
      break;
    case 'Huobi Pro':
      let huobiData = await request.get('http://api.huobi.pro/market/tickers')
      return extractHuobiTickerData(JSON.parse(huobiData).data)
      break;
    default:
      return fetchTickerOneByOne(exchangesMap, exchangeName)
      break;
  }
}

async function fetchCoinTickers(exchangesMap) {
  let tickers = {};
  for (let exchangeName in exchangesMap) {
    await exchangesMap[exchangeName].loadMarkets();
    if (exchangesMap[exchangeName].has['fetchTickers']) {
      tickers[exchangeName] = await exchangesMap[exchangeName].fetchTickers();
    } else {
      tickers[exchangeName] = await coinTickerRequest(exchangesMap, exchangeName);
    }
  }
  return tickers;
}

async function tickerToRedis() {
    let tickers = await fetchCoinTickers(exchangesMap);
    for (ticker in tickers) {
      await client.set('satbot_ticker_' + ticker, JSON.stringify(tickers[ticker]));
      console.log(`Setting redis for ${ticker}`);
    }
}

module.exports = {
  tickerToRedis
}

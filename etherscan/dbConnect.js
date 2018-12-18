const { MongoClient } = require('mongodb');
const { to } = require('await-to-js');
const { db } = require('./config');

let _db = null; // eslint-disable-line

async function ensureIndex(dbWrapper) {
  const collection = dbWrapper.collection(db.collection);
  const [err, indexes] = await to(collection.createIndex(db.index, { unique: true }));
  if (err) throw new Error('MongoDB Indexing failed.');
  return indexes;
}

async function connectToMongo() {
  const [err, dbWrapper] = await to(MongoClient.connect(db.url, { useNewUrlParser: true }));
  if (err) throw new Error('MongoDB connection failed.');
  await ensureIndex(dbWrapper.db(db.name));
  _db = dbWrapper.db(db.name).collection(db.collection);
}

function getDB() {
  if (!_db) {
    throw new Error('DB instance not available.');
  }
  return _db;
}

module.exports = {
  connectToMongo,
  ensureIndex,
  getDB,
};

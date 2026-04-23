const sql = require('./connection');
const mModels = require('../models/mongoModels');

// This handles the dual db mess - sql is primary, mongo is for backup/hosting
class DBStore {
  constructor() {
    this.sqlUp = true;
    this.mongoUp = true;
  }

  // Wrapper for selects, falls back to mongo if sql dies
  async read(query, params, fallback) {
    try {
      const [res] = await sql.query(query, params);
      return res;
    } catch (e) {
      console.log('SQL read failed, trying mongo backup...', e.message);
      if (fallback) {
        return await fallback();
      }
      throw e;
    }
  }

  // Dual write logic - stores in both if possible
  async write(query, params, mongoFn) {
    let sqlRes = null;
    let mongoRes = null;
    let errs = [];

    // try sql first
    try {
      [sqlRes] = await sql.query(query, params);
    } catch (e) {
      console.log('SQL write error:', e.message);
      errs.push({ db: 'sql', msg: e.message });
    }

    // sync to mongo
    try {
      if (mongoFn) {
        mongoRes = await mongoFn(sqlRes);
      }
    } catch (e) {
      console.log('Mongo sync failed:', e.message);
      errs.push({ db: 'mongo', msg: e.message });
    }

    if (errs.length >= 2) {
      throw new Error('Total DB failure - both down');
    }

    return { sqlRes, mongoRes };
  }

  // Just a wrapper for transactions, kept it simple for now
  async startTx(cb) {
    const conn = await sql.getConnection();
    await conn.beginTransaction();
    
    try {
      const out = await cb(conn);
      await conn.commit();
      return out;
    } catch (e) {
      await conn.rollback();
      throw e;
    } finally {
      conn.release(); // dont forget to release or server hangs lol
    }
  }
}

module.exports = new DBStore();

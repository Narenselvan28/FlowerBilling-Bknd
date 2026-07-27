const { mongoose } = require('./mongo');

// MySQL logic removed - Backend is now Mongo-only.

/**
 * read: Executes the mongoCallback directly.
 */
async function read(sql, params = [], mongoCallback = null) {
  if (mongoCallback) {
    return await mongoCallback();
  }
  return [];
}

/**
 * write: Executes mongoAction (now the primary action)
 */
async function write(sql, params = [], mongoAction = null) {
  let mongoRes = null;

  if (mongoAction) {
    try {
      mongoRes = await mongoAction();
    } catch (err) {
      console.error('Mongo Action failed:', err.message);
      throw err;
    }
  }

  return { sqlRes: null, mongoRes };
}

/**
 * startTx: Wrapper for Mongo transactions or just direct execution
 */
async function startTx(callback) {
  // Simple pass-through for now. 
  // Real mongo transactions require replica sets.
  return await callback();
}

module.exports = {
  read,
  write,
  startTx
};

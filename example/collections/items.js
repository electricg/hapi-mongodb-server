const db = require('../../src/db');
const collection = db.db.collection('items');

module.exports.add = insert => {
  return new Promise((resolve, reject) => {
    collection
      .insert(insert)
      .then(res => {
        if (res.result.ok === 1 && res.result.n === 1) {
          return resolve(res.ops[0]);
        }
        return reject(500);
      })
      .catch(err => {
        reject(err);
      });
  });
};

const get = id => {
  return new Promise((resolve, reject) => {
    collection
      .findOne({
        _id: db.ObjectId(id),
      })
      .then(res => {
        if (!res) {
          return reject(404);
        }
        return resolve(res);
      })
      .catch(err => {
        reject(err);
      });
  });
};
module.exports.get = get;

module.exports.list = (query, projection) => {
  return new Promise((resolve, reject) => {
    const _query = query || {};
    const _projection = projection || {};
    collection
      .find(_query, _projection)
      .toArray()
      .then(res => {
        resolve(res);
      })
      .catch(err => {
        reject(err);
      });
  });
};

module.exports.patch = ({ id, body }) => {
  return new Promise((resolve, reject) => {
    get(id)
      .then(res => {
        const { _id, ...doc } = res;

        const _query = {
          _id: db.ObjectId(_id),
        };
        const _update = {
          ...doc,
          ...body,
        };
        const _options = {
          upsert: false,
          multi: false,
        };

        collection
          .update(_query, _update, _options)
          .then(res => {
            if (res.result.ok === 1 && res.result.n === 1) {
              return resolve(get(_id));
            }
            return reject(500);
          })
          .catch(err => {
            reject(err);
          });
      })
      .catch(err => {
        reject(err);
      });
  });
};

module.exports.put = ({ id, body } = {}) => {
  return new Promise((resolve, reject) => {
    const _query = id
      ? {
          _id: db.ObjectId(id),
        }
      : {};
    const _update = { ...body };
    const _options = {
      upsert: true,
      multi: false,
    };

    collection
      .update(_query, _update, _options)
      .then(res => {
        if (res.result.ok === 1 && res.result.n === 1) {
          const { nModified, upserted } = res.result;
          const _id = nModified > 0 ? id : upserted[0]._id;

          return resolve(get(_id));
        }
        return reject(500);
      })
      .catch(err => {
        reject(err);
      });
  });
};

module.exports.remove = id => {
  return new Promise((resolve, reject) => {
    collection
      .remove({
        _id: db.ObjectId(id),
      })
      .then(res => {
        if (res.result.ok === 1 && res.result.n === 1) {
          return resolve({ n: res.result.n });
        }
        return reject(404);
      })
      .catch(err => {
        reject(err);
      });
  });
};

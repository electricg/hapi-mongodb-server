const rewire = require('rewire');

const helpers = require('../../helpers');
const collection = require('../../../example/collections/items');

describe('Collection items', () => {
  before(async () => {
    await helpers.dbStart({ uri: helpers.testMongodbUrl });
  });

  afterEach(async () => {
    await helpers.dbReset();
  });

  after(async () => {
    await helpers.dbStop();
  });

  describe('Add', () => {
    it('should succeed', done => {
      const expectedBody = { test: true };
      collection
        .add(expectedBody)
        .then(res => {
          const { _id, ...body } = res;
          should.deepEqual(body, expectedBody);
          _id.should.not.equal(null);
          done();
        })
        .catch(done);
    });

    it('should fail when no document has been inserted', done => {
      const _collection = rewire('../../../example/collections/items');

      const revert = _collection.__set__('collection.insert', () => {
        return new Promise(resolve => {
          resolve({
            result: {
              ok: 0,
              n: 0,
            },
          });
        });
      });

      const expectedBody = { test: true };
      collection
        .add(expectedBody)
        .then(() => {
          revert();
          done('There should be an error');
        })
        .catch(err => {
          revert();
          err.should.equal(500);
          done();
        });
    });

    it('should fail when there is a db error', done => {
      const expectedBody = { test: true };
      collection
        .add(expectedBody)
        .then(res => {
          const id = res._id;
          return collection.add({ _id: id, ...expectedBody });
        })
        .then(() => {
          done('There should be an error');
        })
        .catch(err => {
          err.should.not.equal(500);
          err.message
            .indexOf('duplicate key error dup key')
            .should.not.equal(-1);
          done();
        });
    });
  });

  describe('Get', () => {
    it('should succeed', done => {
      const expectedBody = { test: true };
      let _res;
      collection
        .add(expectedBody)
        .then(res => {
          _res = res;
          const { _id, ...body } = res;
          should.deepEqual(body, expectedBody);

          return collection.get(_id);
        })
        .then(res => {
          should.deepEqual(res, _res);
          done();
        })
        .catch(done);
    });

    it('should fail when there is no matching document', done => {
      collection
        .get()
        .then(() => {
          done('There should be an error');
        })
        .catch(err => {
          err.should.equal(404);
          done();
        });
    });

    it('should fail when there is a db error', done => {
      const _collection = rewire('../../../example/collections/items');

      const revert = _collection.__set__('collection.findOne', () => {
        return new Promise((resolve, reject) => {
          reject(new Error('Fake database error'));
        });
      });

      collection
        .get()
        .then(() => {
          revert();
          done('There should be an error');
        })
        .catch(err => {
          revert();
          err.should.not.equal(404);
          err.message.should.equal('Fake database error');
          done();
        });
    });
  });

  describe('List', () => {
    it('should succeed and return an empty array', done => {
      collection
        .list()
        .then(res => {
          should.deepEqual(res, []);
          done();
        })
        .catch(done);
    });

    it('should succeed and return an array', done => {
      const expectedBody = { test: true };
      collection
        .add(expectedBody)
        .then(collection.add(expectedBody))
        .then(() => {
          return collection.list();
        })
        .then(res => {
          res.length.should.equal(2);
          res.forEach(r => {
            const { _id, ...body } = r;
            should.deepEqual(body, expectedBody);
            _id.should.not.equal(null);
          });
          done();
        })
        .catch(done);
    });

    it('should fail when there is a db error', done => {
      const _collection = rewire('../../../example/collections/items');

      const revert = _collection.__set__('collection.find', () => {
        return {
          toArray: () => {
            return new Promise((resolve, reject) => {
              reject(new Error('Fake database error'));
            });
          },
        };
      });

      collection
        .list()
        .then(() => {
          revert();
          done('There should be an error');
        })
        .catch(err => {
          revert();
          err.message.should.equal('Fake database error');
          done();
        });
    });
  });

  describe('Patch', () => {
    it('should succeed', done => {
      const expectedBody = { test: true };
      const addBody = { status: 0 };
      let id;

      collection
        .add(expectedBody)
        .then(res => {
          const { _id } = res;
          id = _id;
          return collection.patch({ id: _id, body: addBody });
        })
        .then(res => {
          should.deepEqual(res, {
            _id: id,
            ...expectedBody,
            ...addBody,
          });
          done();
        })
        .catch(done);
    });

    it('should fail when document is not found', done => {
      const id = 'aaaaaaaaaaaaaaaaaaaaaaaa';
      const expectedBody = { test: true };

      collection
        .patch({ id, expectedBody })
        .then(() => {
          done('There should be an error');
        })
        .catch(err => {
          err.should.equal(404);
          done();
        });
    });

    it('should fail when no document has been updated', done => {
      const expectedBody = { test: true };
      const addBody = { status: 0 };

      const _collection = rewire('../../../example/collections/items');

      const revert = _collection.__set__('collection.update', () => {
        return new Promise(resolve => {
          resolve({
            result: {
              ok: 0,
              n: 0,
            },
          });
        });
      });

      collection
        .add(expectedBody)
        .then(res => {
          const { _id } = res;
          return collection.patch({ id: _id, body: addBody });
        })
        .then(() => {
          revert();
          done('There should be an error');
        })
        .catch(err => {
          revert();
          err.should.equal(500);
          done();
        });
    });

    it('should fail when there is a db error', done => {
      const expectedBody = { test: true };

      const _collection = rewire('../../../example/collections/items');

      const revert = _collection.__set__('collection.update', () => {
        return new Promise((resolve, reject) => {
          reject(new Error('Fake database error'));
        });
      });

      collection
        .add(expectedBody)
        .then(res => {
          const { _id } = res;
          return collection.patch({ id: _id, expectedBody });
        })
        .then(() => {
          revert();
          done('There should be an error');
        })
        .catch(err => {
          revert();
          err.message.should.equal('Fake database error');
          done();
        });
    });
  });

  describe('Put', () => {
    it('should succeed when document is not found', done => {
      const id = 'aaaaaaaaaaaaaaaaaaaaaaaa';
      const expectedBody = { test: true };

      collection
        .put({ id, body: expectedBody })
        .then(res => {
          should.deepEqual(res, {
            ...expectedBody,
            _id: helpers.db.ObjectId(id),
          });
          done();
        })
        .catch(done);
    });

    it('should succeed when no id is given', done => {
      const expectedBody = { test: true };

      collection
        .put({ body: expectedBody })
        .then(res => {
          const { _id, ...body } = res;
          should.deepEqual(body, expectedBody);
          _id.should.not.equal(null);
          done();
        })
        .catch(done);
    });

    it('should succeed when document is found', done => {
      const expectedBody = { test: false, status: 0 };
      const addBody = { test: true };
      let id;

      collection
        .add(expectedBody)
        .then(res => {
          const { _id, ...body } = res;
          id = _id;
          should.deepEqual(body, expectedBody);

          return collection.put({ id: _id, body: addBody });
        })

        .then(res => {
          should.deepEqual(res, { ...addBody, _id: id });
          done();
        })
        .catch(done);
    });

    it('should fail when no document has been inserted nor updated', done => {
      const _collection = rewire('../../../example/collections/items');

      const revert = _collection.__set__('collection.update', () => {
        return new Promise(resolve => {
          resolve({
            result: {
              ok: 0,
              n: 0,
            },
          });
        });
      });

      collection
        .put()
        .then(() => {
          revert();
          done('There should be an error');
        })
        .catch(err => {
          revert();
          err.should.equal(500);
          done();
        });
    });

    it('should fail when there is a db error', done => {
      const _collection = rewire('../../../example/collections/items');

      const revert = _collection.__set__('collection.update', () => {
        return new Promise((resolve, reject) => {
          reject(new Error('Fake database error'));
        });
      });

      collection
        .put()
        .then(() => {
          revert();
          done('There should be an error');
        })
        .catch(err => {
          revert();
          err.message.should.equal('Fake database error');
          done();
        });
    });
  });

  describe('Remove', () => {
    it('should succeed when document exists', done => {
      const expectedBody = { test: true };
      collection
        .add(expectedBody)
        .then(res => {
          const { _id, ...body } = res;
          should.deepEqual(body, expectedBody);

          return collection.remove(_id);
        })
        .then(res => {
          should.deepEqual(res, { n: 1 });
          done();
        })
        .catch(done);
    });

    it('should fail when document does not exist', done => {
      collection
        .remove()
        .then(() => {
          done('There should be an error');
        })
        .catch(err => {
          err.should.equal(404);
          done();
        });
    });

    it('should fail when there is a db error', done => {
      const _collection = rewire('../../../example/collections/items');

      const revert = _collection.__set__('collection.remove', () => {
        return new Promise((resolve, reject) => {
          reject(new Error('Fake database error'));
        });
      });

      collection
        .remove()
        .then(() => {
          revert();
          done('There should be an error');
        })
        .catch(err => {
          revert();
          err.message.should.equal('Fake database error');
          done();
        });
    });
  });
});

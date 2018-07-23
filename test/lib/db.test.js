const helpers = require('../helpers');

describe('database', () => {
  before(async () => {
    await helpers.dbStart({ uri: helpers.testMongodbUrl });
  });

  after(async () => {
    await helpers.dbStop();
  });

  describe('MongoDB', () => {
    it('should log fake error event', done => {
      helpers.db.db.emit(
        'error',
        { name: 'errorName', message: 'errorMessage' },
        () => {
          helpers.utilsLogStub.withArgs('error').calledOnce.should.equal(true);
        }
      );

      done();
    });

    it('should log fake connected event', done => {
      helpers.db.db.emit('connected', () => {
        helpers.utilsLogStub
          .withArgs('Connection established to MongoDB at:')
          .calledOnce.should.equal(true);
      });

      done();
    });

    it('should log fake disconnected event', done => {
      helpers.db.db.emit('disconnected', () => {
        helpers.utilsLogStub
          .withArgs('error', 'Lost MongoDB connection')
          .calledOnce.should.equal(true);
      });

      done();
    });

    it('should log fake reconnected event', done => {
      helpers.db.db.emit('reconnected', () => {
        helpers.utilsLogStub
          .withArgs('Reconnected to MongoDB')
          .calledOnce.should.equal(true);
      });

      done();
    });

    it('should log real disconnected and connected event', done => {
      helpers.db
        .close()
        .then(() => {
          helpers.utilsLogStub
            .withArgs('Error', 'Lost MongoDB connection')
            .calledOnce.should.equal(true);
          return helpers.db.connect({
            uri: helpers.testMongodbUrl,
            options: {},
          });
        })
        .then(() => {
          helpers.utilsLogStub
            .withArgs('Connection established to MongoDB at:')
            .calledOnce.should.equal(true);
          done();
        })
        .catch(done);
    });

    it('should log real reconnect event when not already connected to the db', done => {
      helpers.db
        .close()
        .then(() => {
          helpers.utilsLogStub
            .withArgs('Error', 'Lost MongoDB connection')
            .calledOnce.should.equal(true);
          return helpers.db.reconnect();
        })
        .then(() => {
          helpers.utilsLogStub
            .withArgs('Connection established to MongoDB at:')
            .calledOnce.should.equal(true);
          done();
        })
        .catch(done);
    });

    it('should log real reconnect event when already connected to the db', done => {
      helpers.db
        .reconnect()
        .then(done)
        .catch(done);
    });
  });

  describe('MongoDB Driver functionalities using callbacks', () => {
    const collection = helpers.db.db.collection('test');

    afterEach(async () => {
      await helpers.dbReset();
    });

    it('should insert document', done => {
      collection.insert({ a: 1 }, (err, res) => {
        if (err) {
          done(err);
        }
        res.result.ok.should.equal(1);
        res.result.n.should.equal(1);
        res.ops[0]._id.toString().should.not.equal('');
        res.ops[0].a.should.equal(1);
        done();
      });
    });

    it('should fail to insert document', done => {
      collection.insert('', err => {
        if (err) {
          done();
          return;
        }
        done('there should be an error');
      });
    });

    it('should update document', done => {
      collection.insert({ a: 1 }, (err, res) => {
        if (err) {
          done(err);
        }
        res.result.ok.should.equal(1);
        res.result.n.should.equal(1);
        const id = res.ops[0]._id.toString();
        id.should.not.equal('');
        res.ops[0].a.should.equal(1);
        collection.update(
          { a: 1 },
          { $set: { a: 4 } },
          { multi: true },
          (err, res) => {
            if (err) {
              done(err);
            }
            res.result.ok.should.equal(1);
            res.result.n.should.be.above(0);
            done();
          }
        );
      });
    });

    it('should fail to update document', done => {
      collection.insert({ a: 1 }, (err, res) => {
        if (err) {
          done(err);
        }
        res.result.ok.should.equal(1);
        res.result.n.should.equal(1);
        const id = res.ops[0]._id.toString();
        id.should.not.equal('');
        res.ops[0].a.should.equal(1);
        collection.update('', { $set: { a: 4 } }, { multi: true }, err => {
          if (err) {
            done();
            return;
          }
          done('there should be an error');
        });
      });
    });

    it('should find no document', done => {
      const id = '5a330936df7aa0562d15212b';
      collection.findOne({ _id: helpers.db.ObjectId(id) }, (err, res) => {
        should.deepEqual(err, null);
        should.deepEqual(res, null);
        done();
      });
    });

    it('should find a single document', done => {
      collection.insert({ a: 1 }, (err, res) => {
        if (err) {
          done(err);
        }
        res.result.ok.should.equal(1);
        res.result.n.should.equal(1);
        const id = res.ops[0]._id.toString();
        id.should.not.equal('');
        res.ops[0].a.should.equal(1);
        collection.findOne({ _id: helpers.db.ObjectId(id) }, (err, res) => {
          const _id = res._id.toString();
          res.a.should.equal(1);
          _id.should.equal(id);
          done();
        });
      });
    });

    it('should find multiple documents', done => {
      collection.insert({ a: 111 }, (err, res) => {
        if (err) {
          done(err);
        }
        res.result.ok.should.equal(1);
        res.result.n.should.equal(1);
        res.ops[0].a.should.equal(111);
        const id = res.ops[0]._id.toString();
        id.should.not.equal('');
        collection.insert({ a: 111 }, (err, res) => {
          if (err) {
            done(err);
          }
          res.result.ok.should.equal(1);
          res.result.n.should.equal(1);
          res.ops[0].a.should.equal(111);
          const id = res.ops[0]._id.toString();
          id.should.not.equal('');
          return collection
            .find({ a: 111 })
            .toArray()
            .then(res => {
              try {
                res.length.should.equal(2);
                done();
              } catch (err) {
                done(err);
              }
            })
            .catch(done);
        });
      });
    });

    it('should find all documents', done => {
      collection.insert({ b: 222 }, (err, res) => {
        if (err) {
          done(err);
        }
        res.result.ok.should.equal(1);
        res.result.n.should.equal(1);
        res.ops[0].b.should.equal(222);
        const id = res.ops[0]._id.toString();
        id.should.not.equal('');
        collection.insert({ a: 111 }, (err, res) => {
          if (err) {
            done(err);
          }
          res.result.ok.should.equal(1);
          res.result.n.should.equal(1);
          res.ops[0].a.should.equal(111);
          const id = res.ops[0]._id.toString();
          id.should.not.equal('');
          return collection
            .find()
            .toArray()
            .then(res => {
              try {
                res.length.should.equal(2);
                done();
              } catch (err) {
                done(err);
              }
            })
            .catch(done);
        });
      });
    });

    it('should aggregate documents', done => {
      collection.insert({ b: 222 }, (err, res) => {
        if (err) {
          done(err);
        }
        res.result.ok.should.equal(1);
        res.result.n.should.equal(1);
        res.ops[0].b.should.equal(222);
        const id = res.ops[0]._id.toString();
        id.should.not.equal('');
        collection.insert({ a: 111 }, (err, res) => {
          if (err) {
            done(err);
          }
          res.result.ok.should.equal(1);
          res.result.n.should.equal(1);
          res.ops[0].a.should.equal(111);
          const id = res.ops[0]._id.toString();
          id.should.not.equal('');
          return collection
            .aggregate()
            .toArray()
            .then(res => {
              try {
                res.length.should.equal(2);
                done();
              } catch (err) {
                done(err);
              }
            })
            .catch(done);
        });
      });
    });

    it('should remove document', done => {
      collection.insert({ a: 1 }, (err, res) => {
        if (err) {
          done(err);
        }
        res.result.ok.should.equal(1);
        res.result.n.should.equal(1);
        const id = res.ops[0]._id.toString();
        id.should.not.equal('');
        res.ops[0].a.should.equal(1);
        collection.remove({ _id: helpers.db.ObjectId(id) }, (err, res) => {
          if (err) {
            done(err);
          }
          res.result.ok.should.equal(1);
          res.result.n.should.equal(1);
          done();
        });
      });
    });

    it('should fail to remove document', done => {
      collection.insert({ a: 1 }, (err, res) => {
        if (err) {
          done(err);
        }
        res.result.ok.should.equal(1);
        res.result.n.should.equal(1);
        res.ops[0]._id.toString().should.not.equal('');
        res.ops[0].a.should.equal(1);
        try {
          collection.remove('', err => {
            if (err) {
              done();
              return;
            }
            done('there should be an error');
          });
        } catch (err) {
          done(err);
        }
      });
    });
  });

  describe('MongoDB Driver functionalities using async await', () => {
    const collection = helpers.db.db.collection('test');

    afterEach(async () => {
      await helpers.dbReset();
    });

    it('should insert document', async () => {
      // no need to add a catch as the test will automatically fail in that case
      const res = await collection.insert({ a: 1 });
      res.result.ok.should.equal(1);
      res.result.n.should.equal(1);
      res.ops[0]._id.toString().should.not.equal('');
      res.ops[0].a.should.equal(1);
    });

    it('should update document', async () => {
      // no need to add a catch as the test will automatically fail in that case
      const res = await collection.insert({ a: 1 });
      const res2 = await collection.update(
        { a: 1 },
        { $set: { a: 4 } },
        { multi: true }
      );
      res.result.ok.should.equal(1);
      res.result.n.should.equal(1);
      res.ops[0].a.should.equal(1);
      res.ops[0]._id.toString().should.not.equal('');
      res2.result.ok.should.equal(1);
      res2.result.n.should.be.above(0);
    });

    it('should find no document', async () => {
      // no need to add a catch as the test will automatically fail in that case
      const id = '5a330936df7aa0562d15212b';
      const res = await collection.findOne({ _id: helpers.db.ObjectId(id) });
      should.deepEqual(res, null);
    });

    it('should find a single document', async () => {
      // no need to add a catch as the test will automatically fail in that case
      const res = await collection.insert({ a: 1 });
      const id = res.ops[0]._id.toString();
      const res2 = await collection.findOne({
        _id: helpers.db.ObjectId(id),
      });
      res.result.ok.should.equal(1);
      res.result.n.should.equal(1);
      res.ops[0].a.should.equal(1);
      id.should.not.equal('');
      res2.a.should.equal(1);
      res2._id.toString().should.equal(id);
    });

    it('should find multiple documents', async () => {
      // no need to add a catch as the test will automatically fail in that case
      const res = await collection.insert({ a: 111 });
      const res1 = await collection.insert({ a: 111 });
      const res2 = await collection.find({ a: 111 }).toArray();
      res.result.ok.should.equal(1);
      res.result.n.should.equal(1);
      res.ops[0].a.should.equal(111);
      res.ops[0]._id.toString().should.not.equal('');
      res1.result.ok.should.equal(1);
      res1.result.n.should.equal(1);
      res1.ops[0].a.should.equal(111);
      res1.ops[0]._id.toString().should.not.equal('');
      res2.length.should.equal(2);
    });

    it('should find all documents', async () => {
      // no need to add a catch as the test will automatically fail in that case
      const res = await collection.insert({ b: 222 });
      const res1 = await collection.insert({ a: 111 });
      const res2 = await collection.find().toArray();
      res.result.ok.should.equal(1);
      res.result.n.should.equal(1);
      res.ops[0].b.should.equal(222);
      res.ops[0]._id.toString().should.not.equal('');
      res1.result.ok.should.equal(1);
      res1.result.n.should.equal(1);
      res1.ops[0].a.should.equal(111);
      res1.ops[0]._id.toString().should.not.equal('');
      res2.length.should.equal(2);
    });

    it('should aggregate documents', async () => {
      // no need to add a catch as the test will automatically fail in that case
      const res = await collection.insert({ b: 222 });
      const res1 = await collection.insert({ a: 111 });
      const res2 = await collection.aggregate().toArray();
      res.result.ok.should.equal(1);
      res.result.n.should.equal(1);
      res.ops[0].b.should.equal(222);
      res.ops[0]._id.toString().should.not.equal('');
      res1.result.ok.should.equal(1);
      res1.result.n.should.equal(1);
      res1.ops[0].a.should.equal(111);
      res1.ops[0]._id.toString().should.not.equal('');
      res2.length.should.equal(2);
    });

    it('should remove document', async () => {
      // no need to add a catch as the test will automatically fail in that case
      const res = await collection.insert({ a: 1 });
      const id = res.ops[0]._id.toString();
      const res2 = await collection.remove({
        _id: helpers.db.ObjectId(id),
      });
      res.result.ok.should.equal(1);
      res.result.n.should.equal(1);
      res.ops[0].a.should.equal(1);
      id.should.not.equal('');
      res2.result.ok.should.equal(1);
      res2.result.n.should.equal(1);
    });

    it('should fail to remove document', async () => {
      const id = 'abc';

      try {
        await collection.remove({
          _id: helpers.db.ObjectId(id),
        });
        should.fail();
      } catch (err) {
        err.message.should.equal(
          'Argument passed in must be a single String of 12 bytes or a string of 24 hex characters'
        );
      }
    });
  });

  describe('MongoDB Driver functionalities using promises', () => {
    const collection = helpers.db.db.collection('test');

    afterEach(async () => {
      await helpers.dbReset();
    });

    it('should insert document', done => {
      collection
        .insert({ a: 1 })
        .then(res => {
          res.result.ok.should.equal(1);
          res.result.n.should.equal(1);
          res.ops[0]._id.toString().should.not.equal('');
          res.ops[0].a.should.equal(1);
          done();
        })
        .catch(done);
    });

    it('should update document', done => {
      collection
        .insert({ a: 1 })
        .then(res => {
          res.result.ok.should.equal(1);
          res.result.n.should.equal(1);
          const id = res.ops[0]._id.toString();
          id.should.not.equal('');
          res.ops[0].a.should.equal(1);
          return collection.update(
            { a: 1 },
            { $set: { a: 4 } },
            { multi: true }
          );
        })
        .then(res => {
          res.result.ok.should.equal(1);
          res.result.n.should.be.above(0);
          done();
        })
        .catch(done);
    });

    it('should find no document', done => {
      const id = '5a330936df7aa0562d15212b';
      collection
        .findOne({ _id: helpers.db.ObjectId(id) })
        .then(res => {
          should.deepEqual(res, null);
          done();
        })
        .catch(done);
    });

    it('should find a single document', done => {
      let id;
      collection
        .insert({ a: 1 })
        .then(res => {
          res.result.ok.should.equal(1);
          res.result.n.should.equal(1);
          id = res.ops[0]._id.toString();
          id.should.not.equal('');
          res.ops[0].a.should.equal(1);
          return collection.findOne({ _id: helpers.db.ObjectId(id) });
        })
        .then(res => {
          const _id = res._id.toString();
          res.a.should.equal(1);
          _id.should.equal(id);
          done();
        })
        .catch(done);
    });

    it('should find multiple documents', done => {
      collection
        .insert({ a: 111 })
        .then(res => {
          res.result.ok.should.equal(1);
          res.result.n.should.equal(1);
          res.ops[0].a.should.equal(111);
          const id = res.ops[0]._id.toString();
          id.should.not.equal('');
          return collection.insert({ a: 111 });
        })
        .then(res => {
          res.result.ok.should.equal(1);
          res.result.n.should.equal(1);
          res.ops[0].a.should.equal(111);
          const id = res.ops[0]._id.toString();
          id.should.not.equal('');
          return collection.find({ a: 111 }).toArray();
        })
        .then(res => {
          res.length.should.equal(2);
          done();
        })
        .catch(done);
    });

    it('should find all documents', done => {
      collection
        .insert({ b: 222 })
        .then(res => {
          res.result.ok.should.equal(1);
          res.result.n.should.equal(1);
          res.ops[0].b.should.equal(222);
          const id = res.ops[0]._id.toString();
          id.should.not.equal('');
          return collection.insert({ a: 111 });
        })
        .then(res => {
          res.result.ok.should.equal(1);
          res.result.n.should.equal(1);
          res.ops[0].a.should.equal(111);
          const id = res.ops[0]._id.toString();
          id.should.not.equal('');
          return collection.find().toArray();
        })
        .then(res => {
          res.length.should.equal(2);
          done();
        })
        .catch(done);
    });

    it('should aggregate documents', done => {
      collection
        .insert({ b: 222 })
        .then(res => {
          res.result.ok.should.equal(1);
          res.result.n.should.equal(1);
          res.ops[0].b.should.equal(222);
          const id = res.ops[0]._id.toString();
          id.should.not.equal('');
          return collection.insert({ a: 111 });
        })
        .then(res => {
          res.result.ok.should.equal(1);
          res.result.n.should.equal(1);
          res.ops[0].a.should.equal(111);
          const id = res.ops[0]._id.toString();
          id.should.not.equal('');
          return collection.aggregate().toArray();
        })
        .then(res => {
          res.length.should.equal(2);
          done();
        })
        .catch(done);
    });

    it('should remove document', done => {
      collection
        .insert({ a: 1 })
        .then(res => {
          res.result.ok.should.equal(1);
          res.result.n.should.equal(1);
          const id = res.ops[0]._id.toString();
          id.should.not.equal('');
          res.ops[0].a.should.equal(1);
          return collection.remove({ _id: helpers.db.ObjectId(id) });
        })
        .then(res => {
          res.result.ok.should.equal(1);
          res.result.n.should.equal(1);
          done();
        })
        .catch(done);
    });

    it('should fail to remove document', done => {
      const id = 'abc';

      collection
        .insert({ a: 1 })
        .then(res => {
          res.result.ok.should.equal(1);
          res.result.n.should.equal(1);
          res.ops[0]._id.toString().should.not.equal('');
          res.ops[0].a.should.equal(1);
          return collection.remove({ _id: helpers.db.ObjectId(id) });
        })
        .then(() => {
          done('there should be an error');
        })
        .catch(err => {
          err.message.should.equal(
            'Argument passed in must be a single String of 12 bytes or a string of 24 hex characters'
          );
          done();
        });
    });
  });
});

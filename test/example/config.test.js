const config = require('../../example/config');

describe('Config', () => {
  it('should return a valid setting', done => {
    const c = config.get('port');
    (typeof c).should.equal('number');
    done();
  });

  it('should return undefined for an invalid setting', done => {
    const c = config.get('xxx');
    (typeof c).should.equal('undefined');
    done();
  });
});

const sinon = require('sinon');

const utils = require('../../src/lib/utils');
const helpers = require('../helpers');

describe('Utils', () => {
  describe('formatOrigins', () => {
    const o = [
      {
        desc: 'should return empty array when input is a number',
        input: 1,
        output: [],
      },
      {
        desc: 'should return empty array when input is a boolean',
        input: true,
        output: [],
      },
      {
        desc: 'should return empty array when input is an object',
        input: {},
        output: [],
      },
      {
        desc: 'should return empty array when input is an empty string',
        input: '',
        output: [],
      },
      {
        desc: 'should return empty array when input is an empty array',
        input: [],
        output: [],
      },
      {
        desc: 'should trim spaces from a string',
        input: ' aaaa , bbbb , cccc ',
        output: ['aaaa', 'bbbb', 'cccc'],
      },
      {
        desc: 'should trim spaces from an array',
        input: [' aaaa ', ' bbbb ', ' cccc '],
        output: ['aaaa', 'bbbb', 'cccc'],
      },
      {
        desc:
          'should return an array with one item from a string with no separators',
        input: 'aaaa',
        output: ['aaaa'],
      },
      {
        desc:
          'should filter out items in the array that are not strings or empty strings',
        input: [' aaaa ', 1, true, {}, null, '', 'bbbb'],
        output: ['aaaa', 'bbbb'],
      },
    ];

    o.forEach(item => {
      it(item.desc, done => {
        const output = utils.formatOrigins(item.input);
        should.deepEqual(output, item.output);
        done();
      });
    });
  });

  describe('formatError', () => {
    const o = [
      {
        desc: 'should return null error and empty details',
        msg: null,
        err: null,
        output: { status: 0, error: null, details: '' },
      },
      {
        desc: 'should return error and empty details',
        msg: 'xxx',
        err: null,
        output: { status: 0, error: 'xxx', details: '' },
      },
      {
        desc: 'should return error and details property from err.message',
        msg: 'xxx',
        err: { message: 'yyy' },
        output: { status: 0, error: 'xxx', details: 'yyy' },
      },
      {
        desc:
          'should return error and details property from err.statusCode and err.statusMessage',
        msg: 'xxx',
        err: { statusCode: 200, statusMessage: 'yyy' },
        output: { status: 0, error: 'xxx', details: '200 yyy' },
      },
      {
        desc: 'should return error and details property of empty string',
        msg: 'xxx',
        err: { zzz: 'yyy' },
        output: { status: 0, error: 'xxx', details: '' },
      },
    ];
    o.forEach(item => {
      it(item.desc, done => {
        const output = utils.formatError(item.msg, item.err);
        should.deepEqual(output, item.output);
        done();
      });
    });
  });

  describe('log', () => {
    let spy;

    before(done => {
      helpers.utilsLogStub.restore();
      spy = sinon.spy(utils, 'log');
      done();
    });

    after(done => {
      spy.restore();
      helpers.activateUtilsLogStub();
      done();
    });

    it('should log when no arguments are passed', done => {
      const consoleLogStub = sinon.stub(console, 'log').callsFake(() => {});
      utils.log();
      consoleLogStub.restore();
      spy.withArgs().calledOnce.should.equal(true);

      done();
    });

    it('should log when 1 argument is passed', done => {
      const consoleLogStub = sinon.stub(console, 'log').callsFake(() => {});
      utils.log('a');
      consoleLogStub.restore();
      spy.withArgs('a').calledOnce.should.equal(true);

      done();
    });

    it('should log when 2 arguments are passed', done => {
      const consoleLogStub = sinon.stub(console, 'log').callsFake(() => {});
      utils.log('a', 'b');
      consoleLogStub.restore();
      spy.withArgs('a', 'b').calledOnce.should.equal(true);

      done();
    });

    it('should log when 3 arguments are passed', done => {
      const consoleLogStub = sinon.stub(console, 'log').callsFake(() => {});
      utils.log('a', 'b', 'c');
      consoleLogStub.restore();
      spy.withArgs('a', 'b', 'c').calledOnce.should.equal(true);

      done();
    });
  });
});

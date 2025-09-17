const { expect } = require('chai');

describe('Simple Test', () => {
  it('should pass a basic test', () => {
    expect(1 + 1).to.equal(2);
  });

  it('should verify string equality', () => {
    expect('hello').to.equal('hello');
  });
});

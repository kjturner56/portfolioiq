// Temporary test used to verify CI and branch protection. Never merge.
describe('CI protection check', () => {
  it('fails on purpose', () => {
    expect(1 + 1).toBe(3);
  });
});

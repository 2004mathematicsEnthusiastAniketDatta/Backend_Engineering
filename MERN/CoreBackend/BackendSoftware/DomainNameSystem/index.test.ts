jest.config.js
{
  "testEnvironment": "node",
  "collectCoverage": true,
  "transform": {
    "^.+\\.ts$": "ts-jest"
  }
}

index.test.ts
test('hello world!', () => {
  expect(1 + 1).toBe(2);
});
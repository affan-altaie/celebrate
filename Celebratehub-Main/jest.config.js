module.exports = {
  testEnvironment: "node",
  setupFilesAfterEnv: ["<rootDir>/server/__test__/setup.js"],
  testMatch: ["**/server/__test__/**/*.test.js"],
  verbose: true,
  forceExit: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true
};

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  'testPathIgnorePatterns': [
    'node_modules/',
    'dist/',
  ],
  transform: {
    '^.+\\.[jt]sx?$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'js']
}

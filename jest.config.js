const { defaults } = require('jest-config')

module.exports = {
  'moduleNameMapper': {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  'modulePathIgnorePatterns': [
    '<rootDir>/dist/',
  ],
  moduleFileExtensions: [
    ...defaults.moduleFileExtensions,
    'js',
  ],
}

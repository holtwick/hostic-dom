module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[jt]sx?$': 'ts-jest',
  },
  'globals': {
    'ts-jest': {
      'tsConfig': './tsconfig.json',
    },
  },
  transformIgnorePatterns: [
    "[/\\\\]node_modules[/\\\\](?!lodash-es/).+\\.js$"
  ],
  moduleFileExtensions: ['ts', 'js', 'tsx', 'jsx']
}

module.exports = {
  env: {
    node: true,
    es6: true
  },
  extends: 'eslint:recommended',
  //extends: 'standard',
  parserOptions: {
    sourceType: 'module'
  },
  rules: {
    "no-console": 0,
    "no-cond-assign": 0,
    "no-control-regex": 0
  }
}

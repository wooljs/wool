module.exports = {
  "env": {
    "es6": true,
    "node": true
  },
  "parserOptions": {
    "ecmaVersion": 8 // or 2017
  },
  "extends": "eslint:recommended",
  "rules": {
    "indent": [
      "error",
      2,
      { "MemberExpression": 0 }
    ],
    "linebreak-style": [
      "error",
      "unix"
    ],
    "quotes": [
      "error",
      "single"
    ],
    "semi": [
      "error",
      "never"
    ],
    "no-trailing-spaces": [
      1,
      { "skipBlankLines": false }
    ],
    "no-console": 1,
  }
}

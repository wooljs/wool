//http://thecodebarbarian.com/common-async-await-design-patterns-in-node.js.html

const { hash, match } = require('./rule-params')

async function test(pass) {
  let hashed = await hash(pass)
  console.log(hashed, hashed.length)
  let matched = await match(hashed, pass)
  console.log(matched)
}

test('toto')
test('j\'aime trop les pizzas !')

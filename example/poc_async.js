//http://thecodebarbarian.com/common-async-await-design-patterns-in-node.js.html

const crypto = require('crypto')

function try_async(value) {
  return new Promise((resolve, reject) => {
    setTimeout(() => resolve(value+'bar'), 5000)
  })
}

const { Transform } = require('stream')

class TestStream extends Transform {
  constructor() {
    super({objectMode: true})
  }
  async _transform(chunk, encoding, callback) {
    try {
      console.log(chunk)
      let s = Date.now()
      chunk = await try_async(chunk)
      let e = Date.now()
      console.log(chunk, chunk.length, e-s)
      this.push(chunk)
      callback()
    } catch (e) {
      console.error(e)
      callback(e)
    }
  }
}

/*
const testStream = new Transform({
  readableObjectMode: true,
  writableObjectMode: true,
  async transform(chunk, encoding, callback) {
    console.log(chunk)
    chunk = await try_async(chunk)
    console.log(chunk)
    this.push(chunk)
    callback()
  }
});
*/

const testStream = new TestStream()
var count = 0
  , counter = ()=>{ count+=1; console.log(count); }
  , interval = setInterval(counter,1000)

testStream.on('finish', ()=>{ clearInterval(interval); console.log('end') }).end("foo")



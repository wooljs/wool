
var check = require('wool-validate')

check.byParam({
  userId: check.isInStore().type('User').field('active', true),
  chatId: check.isInStore().type('Chatroom').field('members', check.contains(check.param('userId')))
}).fun()

---

function Checker(isRoot) {
  if (!(this instanceof Checker)) return new Checker(!!isRoot)
  this.isRoot = isRoot
  this.checks = []
}
Checker.prototype.chainable = function(apply) {
  if (this.isRoot) {
    return Checker().append(apply)
  } else {
    return this.append(apply)
  }
}
Checker.prototype.append = function(apply) {
  this.checks.push(apply)
  return this
}
Checker.prototype.apply = function(store, params, v, p) {
  return this.checks.filter(function(apply) { return apply(store, params, v, p) })
}
Checker.prototype.fun = function() {
  return function(store, params, v, p) {
    return this.apply(store, params, v, p)
  }.bind(this)
}

byParam = function(checkedParams) {
  return this.chainable(function(store, params) {
    return Object.keys(checkedParams).filter(function(p) {
      var checkValue = checkedParams[p],
        , v = p in params ? params[p] : undefined
      return checkValue instanceof Checker ? checkValue.apply(store, params, v, p) :
        typeof checkValue === 'function' ? checkValue(store, params, v, p) :
        XXX
    }))
  }
}

isInStore = function() {
  return this.chainable(function(store, params, v, p) {
    return store.has(v)
  }
}


import './index.less'

class Animal {
  constructor(name) {
    this.name = name
  }

  getName() {
    return this.name
  }
}

const dog = new Animal('dog')
console.log('aaa')

if (module && module.hot) {
  module.hot.accept()
}

fetch('/user')
  .then(res => res.json())
  .then(data => console.log(data))
  .catch(err => console.log(err))

fetch('/login/account', {
  method: 'POST',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    username: 'admin',
    password: '888888'
  })
})
  .then(res => res.json())
  .then(data => console.log(data))
  .catch(err => console.log(err))

let express = require('express')

let app = express()

app.get('/user', (req, res) => {
  res.json({ name: 'qtzx' })
})

console.log('listen 4000')
app.listen(4000)

module.exports = {
  'GET /user': { name: 'qtzx' },
  'POST /login/account': (req, res) => {
    const { password, username } = req.body
    if (password === '888888' && username === 'admin') {
      return res.send({
        status: 'ok',
        code: 200,
        token: 'sfasdfafd',
        data: { id: 1, name: 'qtzx' }
      })
    } else {
      return res.send({ status: 'error', code: 403 })
    }
  }
}

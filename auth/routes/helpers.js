// TODO temporary, easy check;

function authenticated (request, res, next) {
  if (request.user) {
    return next()
  }

  res.status(403).json({ error: 'Could not authenticate' })
}

module.exports = {
  authenticated
}

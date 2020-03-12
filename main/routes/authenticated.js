// TODO temporary, easy check;

function authenticated (req, res, next) {
  if (req.user) {
    return next()
  }

  res.status(403).json({ error: 'Could not authenticate' })
}

module.exports = authenticated

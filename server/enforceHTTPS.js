function enforceHTTPS(req, res) {
  if (req.headers["x-forwarded-proto"] !== "https") {
    res.redirect(302, "https://" + req.hostname + req.originalUrl);
  }
}

module.exports = enforceHTTPS;
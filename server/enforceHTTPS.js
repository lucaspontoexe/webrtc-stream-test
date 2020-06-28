function enforceHTTPS(req, res, next) {
  if (req.headers["x-forwarded-proto"] !== "https") {
    return res.redirect(302, "https://" + req.hostname + req.originalUrl);
  }
  return next();
}

module.exports = enforceHTTPS;
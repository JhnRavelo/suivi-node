const verifyRole = (allowedRole) => {
  return (req, res, next) => {
    if (!req?.role) res.sendStatus(403);
    const result = allowedRole == req.role;
    if (!result) res.sendStatus(403);

    next();
  };
};

module.exports = verifyRole;

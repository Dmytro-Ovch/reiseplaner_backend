const hasRole = (...roles) => (req, res, next) => {
  const { role, _id } = req.user;
  const { id } = req.params;

  // self erlaubt, wenn Benutzer-ID mit req.params.id übereinstimmt
  if (roles.includes("self") && id === _id.toString()) {
    return next();
  }

  // admin oder andere Rollen
  if (roles.includes(role)) {
    return next();
  }

  const err = new Error("Forbidden");
  err.statusCode = 403;
  throw err;
};

export default hasRole;

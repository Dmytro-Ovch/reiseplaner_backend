const hasRole = (...roles) => (req, res, next) => {
  try {
    const { id } = req.params;
    const { role, _id } = req.user;

    // "self" erlauben: User darf sich selbst bearbeiten
    if (roles.includes("self") && id === _id.toString()) {
      return next();
    }

    // Rollen prüfen
    if (roles.includes(role)) {
      return next();
    }

    // Wenn weder self noch Rolle passt
    const err = new Error("Forbidden");
    err.statusCode = 403;
    throw err;
  } catch (error) {
    next(error);
  }
};

export default hasRole;

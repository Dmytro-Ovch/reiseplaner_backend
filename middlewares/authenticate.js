import jwt from "jsonwebtoken";

const authenticate = (req, res, next) => {
  const token = req.cookies?.token;

  if (!token) {
    const err = new Error("Nicht authentifiziert");
    err.statusCode = 401;
    return next(err);
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    if (!payload._id || !payload.role) {
      const err = new Error("Ungültige Token-Nutzlast");
      err.statusCode = 401;
      return next(err);
    }

    // Payload in req.user speichern
    req.user = { _id: payload._id, role: payload.role };
    next();
  } catch (error) {
    const err = new Error("Ungültiges Token");
    err.statusCode = 401;
    next(err);
  }
};

export default authenticate;

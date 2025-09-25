import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const secure = process.env.NODE_ENV !== "development";

// User registrieren
const registerUser = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // Check if the username already exists
    const existingUser = await User.exists({ username });
    if (existingUser) {
      const err = new Error("Benutzername bereits vergeben");
      err.statusCode = 409;
      throw err;
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPW = await bcrypt.hash(password, salt);

    // Save user
    const user = (await User.create({ ...req.body, password: hashedPW })).toObject();
    delete user.password;

    // JWT erzeugen
    const token = jwt.sign(
      { _id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: `${process.env.JWT_EXPIRES_IN_DAYS}d` }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure,
      sameSite: "lax",
      expires: new Date(Date.now() + parseInt(process.env.JWT_EXPIRES_IN_DAYS) * 24 * 60 * 60 * 1000),
    });

    res.json({ message: "Benutzer erfolgreich registriert", data: user });
  } catch (err) {
    next(err);
  }
};

// Login
const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username }).select("+password").lean();
    if (!user) {
      const err = new Error("Ungültige Anmeldedaten");
      err.statusCode = 401;
      throw err;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      const err = new Error("Ungültige Anmeldedaten");
      err.statusCode = 401;
      throw err;
    }

    delete user.password;

    const token = jwt.sign(
      { _id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: `${process.env.JWT_EXPIRES_IN_DAYS}d` }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // nur in Prod über HTTPS
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      expires: new Date(Date.now() + parseInt(process.env.JWT_EXPIRES_IN_DAYS) * 24 * 60 * 60 * 1000),
    });

    res.json({ message: "Anmeldung erfolgreich", data: user });
  } catch (err) {
    next(err);
  }
};

// Logout
const logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure,
    sameSite: "lax",
  });

  res.json({ message: "Abmeldung erfolgreich" });
};

// Aktuellen User abrufen
const me = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unautorisiert" });
    }

    const { _id, role } = req.user;
    const user = await User.findById(_id).lean();

    if (!user) {
      return res.status(404).json({ message: "Benutzer nicht gefunden" });
    }

    res.json({ data: { _id: user._id, username: user.username, role } });
  } catch (err) {
    next(err);
  }
};

export { registerUser, login, logout, me };

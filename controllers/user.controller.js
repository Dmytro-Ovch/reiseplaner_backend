import User from "../models/user.model.js";

// Neuen User anlegen
const createUser = async (req, res, next) => {
  try {
    const user = await User.create(req.body);
    res.status(201).json({ data: user });
  } catch (err) {
    next(err);
  }
};

// Alle User abrufen
const getAllUsers = async (_req, res, next) => {
  try {
    const users = await User.find().populate("travels").lean();
    res.json({ data: users });
  } catch (err) {
    next(err);
  }
};

// Einzelnen User abrufen
const getOneUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).populate("travels").lean();

    if (!user) {
      return res.status(404).json({ message: "Benutzer nicht gefunden" });
    }

    res.json({ data: user });
  } catch (err) {
    next(err);
  }
};

// User aktualisieren
const updateOneUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate("travels")
      .lean();

    if (!user) {
      return res.status(404).json({ message: "Benutzer nicht gefunden" });
    }

    res.json({ data: user });
  } catch (err) {
    next(err);
  }
};

// User löschen
const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id).lean();

    if (!user) {
      return res.status(404).json({ message: "Benutzer nicht gefunden" });
    }

    res.json({ data: user, message: "User erfolgreich gelöscht" });
  } catch (err) {
    next(err);
  }
};

export { createUser, getAllUsers, getOneUser, updateOneUser, deleteUser };

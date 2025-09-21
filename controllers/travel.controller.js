import Travel from "../models/travel.model.js";
import User from "../models/user.model.js";

// Alle Reisen abrufen
const getTravels = async (_req, res, next) => {
  try {
    const entries = await Travel.find()
      .populate("user", "username role") // User-Daten mitgeben
      .sort({ createdAt: -1 })
      .lean();
    res.json({ data: entries });
  } catch (err) {
    next(err);
  }
};

// Neue Reise anlegen
const createTravel = async (req, res, next) => {
  try {
    const { userId, country, city, startDate, endDate, photos } = req.body;

    if (!userId || !country || !city || !startDate || !endDate) {
      return res.status(400).json({ message: "Pflichtfelder fehlen" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User nicht gefunden" });
    }

    const newTravel = await Travel.create({
      user: user._id,
      country,
      city,
      startDate,
      endDate,
      photos,
    });

    // Reise in User speichern
    user.travels.push(newTravel._id);
    await user.save();

    res.status(201).json({ data: newTravel });
  } catch (err) {
    next(err);
  }
};

// Einzelne Reise abrufen
const getOneTravel = async (req, res, next) => {
  try {
    const { id } = req.params;
    const entry = await Travel.findById(id)
      .populate("user", "username role")
      .lean();

    if (!entry) {
      return res.status(404).json({ message: "Eintrag nicht gefunden" });
    }

    res.json({ data: entry });
  } catch (err) {
    next(err);
  }
};

// Reise updaten
const updateTravel = async (req, res, next) => {
  try {
    const { id } = req.params;

    const updatedEntry = await Travel.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate("user", "username role")
      .lean();

    if (!updatedEntry) {
      return res.status(404).json({ message: "Eintrag nicht gefunden" });
    }

    res.json({ data: updatedEntry });
  } catch (err) {
    next(err);
  }
};

// Reise löschen
const deleteTravel = async (req, res, next) => {
  try {
    const { id } = req.params;

    const deletedEntry = await Travel.findByIdAndDelete(id).lean();

    if (!deletedEntry) {
      return res.status(404).json({ message: "Eintrag nicht gefunden" });
    }

    // Reise auch aus User entfernen
    await User.findByIdAndUpdate(deletedEntry.user, {
      $pull: { travels: deletedEntry._id },
    });

    res.json({ data: deletedEntry, message: "Eintrag erfolgreich gelöscht" });
  } catch (err) {
    next(err);
  }
};

export { getTravels, getOneTravel, createTravel, updateTravel, deleteTravel };

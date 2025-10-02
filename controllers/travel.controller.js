import Travel from "../models/travel.model.js";
import User from "../models/user.model.js";

// Alle Reisen abrufen
const getTravels = async (_req, res, next) => {
  try {
    const entries = await Travel.find()
      .populate("user", "username role")
      .sort({ createdAt: -1 })
      .lean();
    res.json({ data: entries });
  } catch (err) {
    next(err);
  }
};

// Einzelne Reise abrufen
const getOneTravel = async (req, res, next) => {
  try {
    const { id } = req.params;
    const entry = await Travel.findById(id).populate("user", "username role").lean();
    if (!entry) return res.status(404).json({ message: "Eintrag nicht gefunden" });
    res.json({ data: entry });
  } catch (err) {
    next(err);
  }
};

// Neue Reise erstellen (angepasst für points: [{city,country}])
const createTravel = async (req, res, next) => {
  try {
    const { points, startDate, endDate, photos } = req.body;

    if (!points || !Array.isArray(points) || points.length === 0) {
      return res.status(400).json({ message: "Mindestens eine Stadt erforderlich" });
    }
    if (!startDate || !endDate) {
      return res.status(400).json({ message: "Start- und Enddatum erforderlich" });
    }

    const newTravel = await Travel.create({
      user: req.user._id, // User aus JWT
      points,
      startDate,
      endDate,
      photos,
    });

    // User-Dokument aktualisieren
    await User.findByIdAndUpdate(req.user._id, {
    $push: { travels: newTravel._id }
    });

    res.status(201).json({ data: newTravel });
  } catch (err) {
    next(err);
  }
};

// Reise aktualisieren
const updateTravel = async (req, res, next) => {
  try {
    const { id } = req.params;

    const travel = await Travel.findById(id);
    if (!travel) return res.status(404).json({ message: "Eintrag nicht gefunden" });

    // Prüfen, ob Self oder Admin
    if (travel.user.toString() !== req.user._id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    // Punkte optional aktualisieren
    if (req.body.points && Array.isArray(req.body.points)) {
      travel.points = req.body.points;
    }
    if (req.body.startDate) travel.startDate = req.body.startDate;
    if (req.body.endDate) travel.endDate = req.body.endDate;
    if (req.body.photos) travel.photos = req.body.photos;

    await travel.save();

    res.json({ data: travel });
  } catch (err) {
    next(err);
  }
};

// Reise löschen
const deleteTravel = async (req, res, next) => {
  try {
    const { id } = req.params;

    const travel = await Travel.findById(id);
    if (!travel) return res.status(404).json({ message: "Eintrag nicht gefunden" });

    // Prüfen, ob Self oder Admin
    if (travel.user.toString() !== req.user._id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    await travel.remove();
    res.json({ data: travel, message: "Eintrag erfolgreich gelöscht" });
  } catch (err) {
    next(err);
  }
};

// Alle Reisen eines Users abrufen
const getTravelsByUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const travels = await Travel.find({ user: userId })
      .populate("user", "username role")
      .sort({ createdAt: -1 })
      .lean();

    res.json({ data: travels });
  } catch (err) {
    next(err);
  }
};

export { getTravels, getOneTravel, createTravel, updateTravel, deleteTravel, getTravelsByUser };

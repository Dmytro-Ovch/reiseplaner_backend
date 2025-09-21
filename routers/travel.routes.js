import { Router } from "express";
import {
  getTravels,
  getOneTravel,
  createTravel,
  updateTravel,
  deleteTravel,
} from "../controllers/travel.controller.js";
import { authenticate, hasRole } from "../middlewares/index.js";

const travelRouter = Router();

// Alle Reisen abrufen (öffentlich oder absichern, je nach Bedarf)
travelRouter.get("/", getTravels);

// Einzelne Reise abrufen
travelRouter.get("/:id", authenticate, getOneTravel);

// Neue Reise anlegen (User selbst oder Admin)
travelRouter.post("/", authenticate, createTravel);

// Reise aktualisieren (nur Admin oder Besitzer)
travelRouter.put("/:id", authenticate, hasRole("admin"), updateTravel);

// Reise löschen (nur Admin)
travelRouter.delete("/:id", authenticate, hasRole("admin"), deleteTravel);

export default travelRouter;

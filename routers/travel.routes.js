import { Router } from "express";
import {
  getTravels,
  getOneTravel,
  createTravel,
  updateTravel,
  deleteTravel,
} from "../controllers/travel.controller.js";
import authenticate from "../middlewares/authenticate.js";

const travelRouter = Router();

// Alle Reisen (geschützt)
travelRouter.get("/", authenticate, getTravels);

// Einzelne Reise abrufen (nur Besitzer/Admin)
travelRouter.get("/:id", authenticate, getOneTravel);

// Neue Reise erstellen – jeder angemeldete User kann eigene Reise erstellen
travelRouter.post("/", authenticate, createTravel);

// Reise aktualisieren – nur Besitzer/Admin
travelRouter.put("/:id", authenticate, updateTravel);

// Reise löschen – nur Besitzer/Admin
travelRouter.delete("/:id", authenticate, deleteTravel);

export default travelRouter;

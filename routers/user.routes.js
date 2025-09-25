import { Router } from "express";
import { createUser, getAllUsers, getOneUser, updateOneUser, deleteUser } from "../controllers/user.controller.js";
import { registerUser, login, logout, me } from "../controllers/auth.controller.js";
import { authenticate, hasRole } from "../middlewares/index.js";

const userRouter = Router();

// Auth-Routen
userRouter.post("/register", registerUser);      // Registrierung
userRouter.post("/login", login);               // Login
userRouter.delete("/logout", authenticate, logout); // Logout gesichert
userRouter.get("/me", authenticate, me);       // Eigene Daten abrufen

// User-Routen (Admin oder authentifiziert)
userRouter.get("/", authenticate, hasRole("admin"), getAllUsers); // Nur Admin
userRouter.get("/:id", authenticate, getOneUser);                // Jeder angemeldete User
userRouter.put("/:id", authenticate, updateOneUser);            // User selbst oder Admin (Middleware prüfen)
userRouter.delete("/:id", authenticate, deleteUser);            // User selbst oder Admin (Middleware prüfen)

export default userRouter;

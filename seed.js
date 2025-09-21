import mongoose from "mongoose";
import dotenv from "dotenv";
import chalk from "chalk";
import bcrypt from "bcrypt";
import User from "./models/user.model.js";
import Travel from "./models/travel.model.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017";
const DB_NAME = "reiseplaner"; // Name der DB

// Beispiel-Usernamen
const usernames = [
  "Dima", "Alex", "Arnaud", "Ahmed", "Marvin",
  "Renke", "Robin", "Sergii", "Stephan", "Thomas", "Yan"
];

// Beispiel-Locations
const locations = [
  { country: "Germany", cities: ["Berlin", "Munich", "Hamburg"] },
  { country: "France", cities: ["Paris", "Lyon", "Marseille"] },
  { country: "Italy", cities: ["Rome", "Milan", "Naples"] },
  { country: "Spain", cities: ["Madrid", "Barcelona", "Seville"] },
  { country: "USA", cities: ["New York", "Los Angeles", "Chicago"] },
];

// Beispiel-Fotos
const samplePhotos = [
  "https://picsum.photos/200/300?random=1",
  "https://picsum.photos/200/300?random=2",
  "https://picsum.photos/200/300?random=3",
  "https://picsum.photos/200/300?random=4",
];

// Zufallszahl zwischen min und max
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// AutoIncrement Travel ID zurücksetzen
const resetAutoIncrement = async () => {
  try {
    await mongoose.connection.collection("counters").updateOne(
      { id: "id" },
      { $set: { seq: 0 } },
      { upsert: true }
    );
    console.log(chalk.magenta("Rücksetzung des AutoIncrement-Zählers (Travel ID beginnt bei 1)"));
  } catch (err) {
    console.error(chalk.red("Fehler beim Reset des AutoIncrement:"), err.message);
  }
};

// Seed Funktion
const seedDatabase = async () => {
  try {
    const conn = await mongoose.connect(MONGO_URI, { dbName: DB_NAME });
    console.log(chalk.cyan(`MongoDB verbunden: ${conn.connection.name}`));

    // Alte Daten löschen
    await User.deleteMany({});
    await Travel.deleteMany({});
    console.log(chalk.yellow("Alte Users und Travels gelöscht"));

    await resetAutoIncrement();

    // Users erstellen
    const users = [];
    for (const username of usernames) {
      const hashedPW = await bcrypt.hash("1234", 10);
      const user = await User.create({ username, password: hashedPW, role: "user", travels: [] });
      users.push(user);
      console.log(chalk.gray(`User erstellt: ${username} (_id=${user._id})`));
    }

    // Travels erstellen
    for (const user of users) {
      const numTravels = randomInt(1, 5); // 1-5 Travels pro User
      for (let i = 0; i < numTravels; i++) {
        const loc = locations[randomInt(0, locations.length - 1)];
        const city = loc.cities[randomInt(0, loc.cities.length - 1)];

        const startDate = new Date();
        startDate.setDate(startDate.getDate() + randomInt(-30, 30));
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + randomInt(1, 10));

        const photos = Array.from({ length: randomInt(1, 3) }, () => samplePhotos[randomInt(0, samplePhotos.length - 1)]);

        const travel = await Travel.create({
          user: user._id,
          country: loc.country,
          city,
          startDate,
          endDate,
          photos,
        });

        user.travels.push(travel._id);
        console.log(chalk.gray(`Travel erstellt für ${user.username}: ${city}, ${loc.country} (id=${travel.id})`));
      }
      await user.save();
    }

    console.log(chalk.green("Users und Travels erfolgreich in die Datenbank eingefügt!"));
    process.exit(0);
  } catch (err) {
    console.error(chalk.red("Fehler beim Seeden der Datenbank:"), err.message);
    process.exit(1);
  }
};

seedDatabase();

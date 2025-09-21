import chalk from "chalk";
import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const mongo = await mongoose.connect(process.env.MONGO_URI, { dbName: 'reiseplaner' });
    console.log(chalk.cyan(`MongoDB verbunden: ${mongo.connection.name}`));
    return mongo;
  } catch (error) {
    console.error(chalk.red("Fehler bei DB-Verbindung:"), error.message);
    process.exit(1);
  }
};

export default connectDB;

import { db } from "./index";
import { migrate } from "drizzle-orm/neon-serverless/migrator";

const main = async () => {
  try {
    await migrate(db, {
      migrationsFolder: "./db/migration",
    });
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

main();

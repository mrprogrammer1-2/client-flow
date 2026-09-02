import { db } from "./index";
import { migrate } from "drizzle-orm/neon-http/migrator";

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

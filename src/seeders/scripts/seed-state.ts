import fs from "fs/promises";
import path from "path";

import mongoose from "mongoose";

import State from "../../modules/state/state.model";

interface ICityRecord {
  city: string;
  state: string;
}

async function seedStates() {
  try {
    await mongoose.connect(process.env.MONGODB_CONNECTION_STRING!);

    console.log("MongoDB connected");

    const filePath = path.join(
      process.cwd(),
      "src/seeders/data/state.json"
    );

    const file = await fs.readFile(
      filePath,
      "utf-8"
    );

    const records: ICityRecord[] =
      JSON.parse(file);

    const groupedStates = new Map<
      string,
      Set<string>
    >();

    for (const record of records) {
      const state = record.state.trim();
      const city = record.city.trim();

      if (!groupedStates.has(state)) {
        groupedStates.set(
          state,
          new Set()
        );
      }

      groupedStates
        .get(state)!
        .add(city);
    }

    const documents = Array.from(
      groupedStates.entries()
    ).map(([state, cities]) => ({
      state,
      cities: Array.from(cities).sort(),
    }));

    console.log(
      `Preparing ${documents.length} states`
    );

    await State.deleteMany({});

    await State.insertMany(documents);

    console.log(
      `Inserted ${documents.length} states`
    );

    process.exit(0);
  } catch (error) {
    console.error(
      "Seed failed:",
      error
    );

    process.exit(1);
  }
}

seedStates();
const express = require(`express`);
const path = require(`path`);
const { connectDb } = require("./libs/mongodb");
const { setUp } = require("./main");

const main = async () => {
  try {
    await connectDb();
  } catch (e) {
    console.log(`Error connecting to database.`, e);
    process.exit(1);
  }

  const app = await setUp();
  app.use(express.static(path.join(__dirname, `public`)));

  console.log(`Server up and running.`);
};

main();

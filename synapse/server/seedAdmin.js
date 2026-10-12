require("dotenv").config();

const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");

async function seedAdmin() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing.");
    }

    const { SEED_ADMIN_NAME, SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD } =
      process.env;

    if (!SEED_ADMIN_EMAIL || !SEED_ADMIN_PASSWORD || !SEED_ADMIN_NAME) {
      throw new Error("Admin seed variables are missing from .env.");
    }

    if (SEED_ADMIN_PASSWORD.length < 12) {
      throw new Error("Use an Admin password of at least 12 characters.");
    }

    await mongoose.connect(process.env.MONGO_URI);

    const email = SEED_ADMIN_EMAIL.trim().toLowerCase();
    const existing = await User.findOne({ email });

    if (existing) {
      console.log(
        "An account with that email already exists. No changes made.",
      );
      return;
    }

    const password = await bcrypt.hash(SEED_ADMIN_PASSWORD, 12);

    await User.create({
      name: SEED_ADMIN_NAME.trim(),
      email,
      password,
      role: "admin",
      status: "active",
    });

    console.log(`Synapse Admin created: ${email}`);
  } catch (error) {
    console.error("Could not create Admin:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

seedAdmin();

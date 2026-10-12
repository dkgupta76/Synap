require("dotenv").config();

const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");

async function resetAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const email = process.env.SEED_ADMIN_EMAIL.trim().toLowerCase();
    const password = await bcrypt.hash(process.env.SEED_ADMIN_PASSWORD, 12);

    const user = await User.findOneAndUpdate(
      { email },
      { password, role: "admin", status: "active" },
      { new: true },
    );

    if (!user) {
      console.log("No account found with that email.");
    } else {
      console.log(`Admin ready: ${user.email} (role: ${user.role})`);
    }
  } catch (error) {
    console.error("Reset failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

resetAdmin();

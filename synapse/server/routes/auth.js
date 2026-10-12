const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { protect } = require("../middleware/auth");

const router = express.Router();

function publicUser(user) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
  };
}

// Register a User or request Manager access.
// Admin registration is deliberately not public.
router.post("/register", async (req, res, next) => {
  try {
    const { name, email, password, role = "user" } = req.body;

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      return res.status(400).json({
        message: "Please provide your name, email, and password.",
      });
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (cleanName.length < 2 || cleanName.length > 80) {
      return res.status(400).json({
        message: "Name must be between 2 and 80 characters.",
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return res.status(400).json({
        message: "Please enter a valid email address.",
      });
    }

    if (password.length < 10 || password.length > 72) {
      return res.status(400).json({
        message: "Password must be between 10 and 72 characters.",
      });
    }

    if (!["user", "manager"].includes(role)) {
      return res.status(400).json({
        message: "Invalid registration role.",
      });
    }

    const existingUser = await User.findOne({ email: cleanEmail });

    if (existingUser) {
      return res.status(409).json({
        message: "An account with this email already exists.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const status = role === "manager" ? "pending" : "active";

    const user = await User.create({
      name: cleanName,
      email: cleanEmail,
      password: hashedPassword,
      role,
      status,
    });

    // Managers must wait for Admin approval.
    if (role === "manager") {
      return res.status(201).json({
        message: "Manager registration submitted. Wait for Admin approval.",
      });
    }

    // Regenerate session to prevent session fixation.
    req.session.regenerate((error) => {
      if (error) return next(error);

      req.session.userId = user._id.toString();

      req.session.save((saveError) => {
        if (saveError) return next(saveError);

        res.status(201).json({
          message: "Account created successfully.",
          user: publicUser(user),
          redirectTo: "/user",
        });
      });
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "An account with this email already exists.",
      });
    }

    next(error);
  }
});

// One common login endpoint for every role.
router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        message: "Enter your email and password.",
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    }).select("+password");

    const passwordMatches =
      user && (await bcrypt.compare(password, user.password));

    if (!passwordMatches) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    if (user.status === "pending") {
      return res.status(403).json({
        message: "Your account is awaiting Admin approval.",
      });
    }

    if (user.status !== "active") {
      return res.status(403).json({
        message: "Your account is disabled. Contact an administrator.",
      });
    }

    req.session.regenerate((error) => {
      if (error) return next(error);

      req.session.userId = user._id.toString();

      req.session.save((saveError) => {
        if (saveError) return next(saveError);

        res.json({
          message: "Login successful.",
          user: publicUser(user),
          redirectTo: `/${user.role}`,
        });
      });
    });
  } catch (error) {
    next(error);
  }
});

// Restore the logged-in user after refresh.
router.get("/me", protect, (req, res) => {
  res.json({ user: publicUser(req.user) });
});

// Log out.
router.post("/logout", (req, res, next) => {
  if (!req.session) {
    return res.json({ message: "Logged out." });
  }

  req.session.destroy((error) => {
    if (error) return next(error);

    res.clearCookie("sid", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.COOKIE_SECURE === "true",
      path: "/",
    });

    res.json({ message: "Logged out successfully." });
  });
});

// Placeholder only: does not send an email or reset the password.
router.post("/forgot-password", async (req, res, next) => {
  try {
    const email =
      typeof req.body.email === "string"
        ? req.body.email.trim().toLowerCase()
        : "";

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        message: "Enter a valid email address.",
      });
    }

    res.json({
      message:
        "If an account exists for this email, follow the password recovery instructions provided by your administrator. Automated email recovery is not configured yet.",
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

const express = require("express");
const User = require("../models/User");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

const safeUser = (user) => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
  role: user.role,
  status: user.status,
  createdAt: user.createdAt,
});

// User dashboard data
router.get("/user", protect, authorize("user"), (req, res) => {
  res.json({
    title: "User Dashboard",
    message: `Welcome to your Synapse workspace, ${req.user.name}.`,
    features: [
      "View your account information",
      "Access your personal workspace",
      "Manage your profile",
    ],
    user: safeUser(req.user),
  });
});

// Manager dashboard data
router.get("/manager", protect, authorize("manager"), (req, res) => {
  res.json({
    title: "Manager Dashboard",
    message: `Welcome to the Synapse management workspace, ${req.user.name}.`,
    features: [
      "View management overview",
      "Review team activity",
      "Access manager tools",
    ],
    user: safeUser(req.user),
  });
});

// Admin dashboard data
router.get("/admin", protect, authorize("admin"), async (req, res, next) => {
  try {
    const [total, users, managers, pendingManagers, disabled] =
      await Promise.all([
        User.countDocuments(),
        User.countDocuments({ role: "user" }),
        User.countDocuments({ role: "manager" }),
        User.countDocuments({ role: "manager", status: "pending" }),
        User.countDocuments({ status: "disabled" }),
      ]);

    res.json({
      title: "Admin Dashboard",
      message: `Welcome to Synapse administration, ${req.user.name}.`,
      stats: { total, users, managers, pendingManagers, disabled },
      user: safeUser(req.user),
    });
  } catch (error) {
    next(error);
  }
});

// Admin-only account listing
router.get(
  "/admin/accounts",
  protect,
  authorize("admin"),
  async (req, res, next) => {
    try {
      const accounts = await User.find()
        .sort({ createdAt: -1 })
        .select("name email role status createdAt");

      res.json({ accounts: accounts.map(safeUser) });
    } catch (error) {
      next(error);
    }
  },
);

// Admin-only status updates
router.patch(
  "/admin/accounts/:id/status",
  protect,
  authorize("admin"),
  async (req, res, next) => {
    try {
      const { status } = req.body;

      if (!["active", "pending", "disabled"].includes(status)) {
        return res.status(400).json({
          message: "Invalid account status.",
        });
      }

      const account = await User.findById(req.params.id);

      if (!account) {
        return res.status(404).json({
          message: "Account not found.",
        });
      }

      if (account.role === "admin") {
        return res.status(400).json({
          message: "Admin accounts cannot be changed here.",
        });
      }

      if (account.role === "manager" && status === "active") {
        // This action is the manager approval workflow.
        account.status = "active";
      } else {
        account.status = status;
      }

      await account.save();

      res.json({
        message: "Account status updated.",
        account: safeUser(account),
      });
    } catch (error) {
      next(error);
    }
  },
);

module.exports = router;

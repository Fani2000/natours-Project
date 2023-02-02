const express = require("express");
const viewsController = require("../controllers/viewsController");
const authController = require("../controllers/authController");

const router = express.Router();

// router.use(authController.isLoggedIn);

router.get("/", authController.isLoggedIn, viewsController.getOverview);
router.get("/me", authController.isLoggedIn, viewsController.getAccount);
router.get("/login", authController.isLoggedIn, viewsController.getLogin);
router.get("/tour/:id", authController.isLoggedIn, viewsController.getTour);

module.exports = router;

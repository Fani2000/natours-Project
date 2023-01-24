const express = require("express");
const tourController = require("./../controllers/tourController");
const authController = require("./../controllers/authController");

const router = express.Router();

router.param("id", tourController.checkID);

router
  .route("/")
  .get(authController.protect, tourController.getAllTours)
  .post(tourController.checkBody, tourController.createTour);

router
  .route("/:id")
  .get(tourController.getTour)
  .patch(
    authController.protect,
    authController.restrictTo("admin"),
    tourController.updateTour
  )
  .delete(
    authController.protect,
    authController.restrictTo("admin"),
    tourController.deleteTour
  );

module.exports = router;

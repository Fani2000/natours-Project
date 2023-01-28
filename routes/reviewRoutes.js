const express = require("express");
const reviewController = require("../controllers/reviewController");
const authController = require("../controllers/authController");
const { setTourUserIds } = require("../middlewares/reviewsMiddlewares");

const router = express.Router({ mergeParams: true });

router
  .route("/")
  .get(reviewController.getAllReviews)
  .post(authController.protect, setTourUserIds, reviewController.createReview);

router
  .route("/:id")
  .get(reviewController.getReview)
  .delete(reviewController.deleteReview)
  .patch(reviewController.updateReview);

module.exports = router;

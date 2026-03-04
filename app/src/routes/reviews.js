"use strict";

const express = require("express");

const ReviewController = require("../reviews/review.controller");
const ReviewService = require("../reviews/review.service");
const ReviewRepository = require("../reviews/review.repository");

const UserRepository = require("../users/user.repository");
const ProductRepository = require("../products/product.repository");

const {
  createReviewValidator,
  getSellerReviewsValidator,
  updateReviewValidator,
  deleteReviewValidator,
} = require("../validators/review.validator");
const validate = require("../middleware/validate");
const authGuard = require("../auth/guard/auth.guard");

const router = express.Router();

const reviewRepository = new ReviewRepository();
const userRepository = new UserRepository();
const productRepository = new ProductRepository();

const reviewService = new ReviewService(reviewRepository, userRepository, productRepository);
const reviewController = new ReviewController(reviewService);

router.get("/", getSellerReviewsValidator, validate, reviewController.getSellerReviews);

router.post(
  "/",
  authGuard(),
  createReviewValidator,
  validate,
  reviewController.createReview
);

router.patch(
  "/:reviewId",
  authGuard(),
  updateReviewValidator,
  validate,
  reviewController.updateReview
);

router.delete(
  "/:reviewId",
  authGuard(),
  deleteReviewValidator,
  validate,
  reviewController.deleteReview
);

module.exports = router;

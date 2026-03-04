"use strict";

class ReviewController {
  constructor(reviewService) {
    this.reviewService = reviewService;
  }

  parseJsonArrayField = (value, fieldName) => {
    if (value === undefined) {
      return undefined;
    }

    if (Array.isArray(value)) {
      return value;
    }

    if (typeof value === "string") {
      try {
        const parsed = JSON.parse(value);

        if (!Array.isArray(parsed)) {
          const CustomError = require("../utils/customError");
          throw new CustomError(`${fieldName} 형식이 올바르지 않습니다.`, 400);
        }

        return parsed;
      } catch (error) {
        const CustomError = require("../utils/customError");
        throw new CustomError(`${fieldName} 형식이 올바르지 않습니다.`, 400);
      }
    }

    const CustomError = require("../utils/customError");
    throw new CustomError(`${fieldName} 형식이 올바르지 않습니다.`, 400);
  };

  createReview = async (req, res, next) => {
    try {
      const userId = req.user.id;
      const { sellerId, rating, content, tags, productId, images } = req.body;
      const parsedTags = this.parseJsonArrayField(tags, "태그") || [];
      const parsedImages = this.parseJsonArrayField(images, "이미지") || [];

      const reviewId = await this.reviewService.createReview({
        userId,
        sellerId: Number(sellerId),
        productId: Number(productId),
        rating: Number(rating),
        content,
        tags: parsedTags,
        imageUrls: parsedImages,
      });

      res.status(201).json({
        message: "후기가 작성되었습니다.",
        reviewId,
      });
    } catch (error) {
      console.error(error);
      next(error);
    }
  };

  getSellerReviews = async (req, res, next) => {
    try {
      const sellerId = Number(req.query.sellerId);
      const limit = Number(req.query.limit) || 50;

      const reviews = await this.reviewService.getSellerReviews(sellerId, limit);

      res.status(200).json({
        data: reviews,
        totalCnt: reviews.length,
      });
    } catch (error) {
      console.error(error);
      next(error);
    }
  };

  updateReview = async (req, res, next) => {
    try {
      const userId = req.user.id;
      const reviewId = Number(req.params.reviewId);
      const { rating, content, tags, images } = req.body;
      const parsedTags = this.parseJsonArrayField(tags, "태그");
      const parsedImages = this.parseJsonArrayField(images, "이미지");

      await this.reviewService.updateReview(userId, reviewId, {
        rating: Number(rating),
        content,
        tags: parsedTags,
        imageUrls: parsedImages,
      });

      res.status(200).json({
        message: "후기가 수정되었습니다.",
      });
    } catch (error) {
      console.error(error);
      next(error);
    }
  };

  deleteReview = async (req, res, next) => {
    try {
      const userId = req.user.id;
      const reviewId = Number(req.params.reviewId);

      await this.reviewService.deleteReview(userId, reviewId);

      res.status(200).json({
        message: "후기가 삭제되었습니다.",
      });
    } catch (error) {
      console.error(error);
      next(error);
    }
  };
}

module.exports = ReviewController;

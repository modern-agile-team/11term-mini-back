"use strict";

const transaction = require("../config/transaction");
const CustomError = require("../utils/customError");

class ReviewService {
  constructor(reviewRepository, userRepository, productRepository) {
    this.reviewRepository = reviewRepository;
    this.userRepository = userRepository;
    this.productRepository = productRepository;
  }

  async createReview(reviewData) {
    const { userId, sellerId, productId, rating, content, tags, imageUrls } = reviewData;

    return transaction(async (connection) => {
      const seller = await this.userRepository.findUserById(sellerId);
      if (!seller) {
        throw new CustomError("존재하지 않는 판매자입니다.", 404);
      }

      if (userId === sellerId) {
        throw new CustomError("본인의 상점에는 후기를 작성할 수 없습니다.", 400);
      }

      const product = await this.productRepository.findProductById(productId);
      if (!product) {
        throw new CustomError("존재하지 않는 상품입니다.", 404);
      }

      if (product.userId !== sellerId) {
        throw new CustomError("해당 상품의 판매자가 아닙니다.", 400);
      }

      const existingReview = await this.reviewRepository.findExistingReview(
        userId,
        sellerId,
        productId
      );
      if (existingReview) {
        throw new CustomError("이미 해당 거래에 대한 후기를 작성하셨습니다.", 409);
      }

      const result = await this.reviewRepository.createReview(
        {
          userId,
          sellerId,
          productId,
          rating,
          content,
        },
        connection
      );

      if (!result || result.affectedRows !== 1) {
        throw new CustomError("후기 작성에 실패했습니다.");
      }

      const reviewId = result.insertId;

      if (tags && tags.length > 0) {
        await this.reviewRepository.createReviewTags(reviewId, tags, connection);
      }

      if (imageUrls && imageUrls.length > 0) {
        await this.reviewRepository.saveReviewImages(reviewId, imageUrls, connection);
      }

      return reviewId;
    });
  }

  async getSellerReviews(sellerId, limit = 50) {
    const seller = await this.userRepository.findUserById(sellerId);
    if (!seller) {
      throw new CustomError("존재하지 않는 판매자입니다.", 404);
    }

    const reviews = await this.reviewRepository.findReviewsBySellerId(sellerId, limit);

    return reviews;
  }

  async updateReview(userId, reviewId, updateData) {
    const { rating, content, tags, imageUrls } = updateData;

    return transaction(async (connection) => {
      const review = await this.reviewRepository.findReviewById(reviewId);
      if (!review) {
        throw new CustomError("존재하지 않는 후기입니다.", 404);
      }

      if (review.userId !== userId) {
        throw new CustomError("본인이 작성한 후기만 수정할 수 있습니다.", 403);
      }

      const result = await this.reviewRepository.updateReview(
        reviewId,
        { rating, content },
        connection
      );

      if (!result || result.affectedRows !== 1) {
        throw new CustomError("후기 수정에 실패했습니다.");
      }

      if (tags !== undefined) {
        await this.reviewRepository.deleteReviewTags(reviewId, connection);
        if (tags.length > 0) {
          await this.reviewRepository.createReviewTags(reviewId, tags, connection);
        }
      }

      if (imageUrls !== undefined) {
        await this.reviewRepository.deleteReviewImages(reviewId, connection);
        if (imageUrls.length > 0) {
          await this.reviewRepository.saveReviewImages(reviewId, imageUrls, connection);
        }
      }
    });
  }

  async deleteReview(userId, reviewId) {
    return transaction(async (connection) => {
      const review = await this.reviewRepository.findReviewById(reviewId);
      if (!review) {
        throw new CustomError("존재하지 않는 후기입니다.", 404);
      }

      if (review.userId !== userId) {
        throw new CustomError("본인이 작성한 후기만 삭제할 수 있습니다.", 403);
      }

      await this.reviewRepository.deleteReviewTags(reviewId, connection);
      await this.reviewRepository.deleteReviewImages(reviewId, connection);

      const result = await this.reviewRepository.deleteReview(reviewId, connection);

      if (!result || result.affectedRows !== 1) {
        throw new CustomError("후기 삭제에 실패했습니다.");
      }
    });
  }
}

module.exports = ReviewService;

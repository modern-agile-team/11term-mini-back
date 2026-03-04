"use strict";

const CustomError = require("../utils/customError");

class LikedService {
  constructor(likedRepository, productRepository) {
    this.likedRepository = likedRepository;
    this.productRepository = productRepository;
  }

  async likeProduct(userId, productId) {
    const product = await this.productRepository.findProductById(productId);
    if (!product) {
      throw new CustomError("존재하지 않는 상품입니다.", 404);
    }

    if (product.userId === userId) {
      throw new CustomError("본인의 상품은 찜할 수 없습니다.", 400);
    }

    const isAlreadyLiked = await this.likedRepository.findLikedProduct(userId, productId);
    if (isAlreadyLiked) {
      throw new CustomError("이미 관심 상품으로 등록된 상품입니다.", 409);
    }

    await this.likedRepository.createLikedProduct(userId, productId);
  }

  async unlikeProduct(userId, productId) {
    const isLiked = await this.likedRepository.findLikedProduct(userId, productId);
    if (!isLiked) {
      throw new CustomError("관심 상품으로 등록되지 않은 상품입니다.", 404);
    }

    await this.likedRepository.deleteLikedProduct(userId, productId);
  }

  async getLikedProducts(userId) {
    const products = await this.likedRepository.findLikedProductsByUserId(userId);

    return {
      products,
      totalCnt: products.length,
    };
  }
}

module.exports = LikedService;

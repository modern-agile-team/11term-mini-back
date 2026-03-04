"use strict";

class LikedController {
  constructor(likedService) {
    this.likedService = likedService;
  }

  likeProduct = async (req, res, next) => {
    try {
      const userId = req.user.id;
      const { productId } = req.body;

      await this.likedService.likeProduct(userId, productId);

      res.status(201).json({ message: "관심 상품으로 등록되었습니다." });
    } catch (error) {
      next(error);
    }
  };

  unlikeProduct = async (req, res, next) => {
    try {
      const userId = req.user.id;
      const { productId } = req.body;

      await this.likedService.unlikeProduct(userId, productId);

      res.status(200).json({ message: "관심 상품이 해제되었습니다." });
    } catch (error) {
      next(error);
    }
  };

  getLikedProducts = async (req, res, next) => {
    try {
      const userId = req.user.id;

      const result = await this.likedService.getLikedProducts(userId);

      res.status(200).json({ data: result.products, totalCnt: result.totalCnt });
    } catch (error) {
      next(error);
    }
  };
}

module.exports = LikedController;

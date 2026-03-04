"use strict";

const { body, query, param } = require("express-validator");

exports.createReviewValidator = [
  body("sellerId")
    .notEmpty()
    .withMessage("판매자 ID는 필수입니다.")
    .isInt({ min: 1 })
    .withMessage("유효한 판매자 ID가 아닙니다.")
    .toInt(),

  body("rating")
    .notEmpty()
    .withMessage("별점은 필수입니다.")
    .isInt({ min: 1, max: 5 })
    .withMessage("별점은 1점에서 5점 사이여야 합니다.")
    .toInt(),

  body("content")
    .notEmpty()
    .withMessage("후기 내용을 입력해주세요.")
    .trim()
    .isLength({ min: 10 })
    .withMessage("후기 내용은 최소 10자 이상이어야 합니다.")
    .isLength({ max: 500 })
    .withMessage("후기 내용은 최대 500자까지 입력 가능합니다."),

  body("tags")
    .optional()
    .custom((value) => {
      try {
        const parsed = typeof value === "string" ? JSON.parse(value) : value;
        if (!Array.isArray(parsed)) {
          throw new Error("태그는 배열 형식이어야 합니다.");
        }
        if (parsed.length > 5) {
          throw new Error("태그는 최대 5개까지 선택 가능합니다.");
        }
        if (!parsed.every((tag) => typeof tag === "string" && tag.trim().length > 0)) {
          throw new Error("유효하지 않은 태그 형식입니다.");
        }
        return true;
      } catch (error) {
        throw new Error(error.message);
      }
    }),

  body("productId")
    .notEmpty()
    .withMessage("상품 ID는 필수입니다.")
    .isInt({ min: 1 })
    .withMessage("유효한 상품 ID가 아닙니다.")
    .toInt(),

  body("images")
    .optional()
    .custom((value) => {
      if (!Array.isArray(value)) {
        throw new Error("images는 배열 형식이어야 합니다.");
      }
      if (value.length > 3) {
        throw new Error("이미지는 최대 3장까지 업로드 가능합니다.");
      }
      if (!value.every((url) => typeof url === "string" && url.trim().length > 0)) {
        throw new Error("유효하지 않은 이미지 URL 형식입니다.");
      }
      return true;
    }),
];

exports.getSellerReviewsValidator = [
  query("sellerId")
    .notEmpty()
    .withMessage("판매자 ID는 필수입니다.")
    .isInt({ min: 1 })
    .withMessage("유효한 판매자 ID가 아닙니다.")
    .toInt(),
];

exports.updateReviewValidator = [
  param("reviewId")
    .notEmpty()
    .withMessage("후기 ID는 필수입니다.")
    .isInt({ min: 1 })
    .withMessage("유효한 후기 ID가 아닙니다.")
    .toInt(),

  body("rating")
    .notEmpty()
    .withMessage("별점은 필수입니다.")
    .isInt({ min: 1, max: 5 })
    .withMessage("별점은 1점에서 5점 사이여야 합니다.")
    .toInt(),

  body("content")
    .notEmpty()
    .withMessage("후기 내용을 입력해주세요.")
    .trim()
    .isLength({ min: 10 })
    .withMessage("후기 내용은 최소 10자 이상이어야 합니다.")
    .isLength({ max: 500 })
    .withMessage("후기 내용은 최대 500자까지 입력 가능합니다."),

  body("tags")
    .optional()
    .custom((value) => {
      try {
        const parsed = typeof value === "string" ? JSON.parse(value) : value;
        if (!Array.isArray(parsed)) {
          throw new Error("태그는 배열 형식이어야 합니다.");
        }
        if (parsed.length > 5) {
          throw new Error("태그는 최대 5개까지 선택 가능합니다.");
        }
        if (!parsed.every((tag) => typeof tag === "string" && tag.trim().length > 0)) {
          throw new Error("유효하지 않은 태그 형식입니다.");
        }
        return true;
      } catch (error) {
        throw new Error(error.message);
      }
    }),

  body("images")
    .optional()
    .custom((value) => {
      if (!Array.isArray(value)) {
        throw new Error("images는 배열 형식이어야 합니다.");
      }
      if (value.length > 3) {
        throw new Error("이미지는 최대 3장까지 업로드 가능합니다.");
      }
      if (!value.every((url) => typeof url === "string" && url.trim().length > 0)) {
        throw new Error("유효하지 않은 이미지 URL 형식입니다.");
      }
      return true;
    }),
];

exports.deleteReviewValidator = [
  param("reviewId")
    .notEmpty()
    .withMessage("후기 ID는 필수입니다.")
    .isInt({ min: 1 })
    .withMessage("유효한 후기 ID가 아닙니다.")
    .toInt(),
];

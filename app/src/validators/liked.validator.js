"use strict";

const { body } = require("express-validator");

exports.likeProductValidator = [
  body("productId")
    .notEmpty()
    .withMessage("상품 ID는 필수입니다.")
    .isInt({ min: 1 })
    .withMessage("유효한 상품 ID가 아닙니다.")
    .toInt(),
];

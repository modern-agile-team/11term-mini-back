"use strict";

const express = require("express");

const { createProductValidator } = require("../validators/product.validator");
const validate = require("../middleware/validate");
const { uploadProductImage, MAX_IMAGE_COUNT } = require("../middleware/upload.middleware");
const authGuard = require("./../auth/guard/auth.guard");

const ProductController = require("./../products/product.controller");
const ProductService = require("./../products/product.service");
const ProductRepository = require("./../products/product.repository");

const TagService = require("./../tags/tag.service");
const TagRepository = require("./../tags/tag.repository");

const CategoryService = require("./../categories/category.service");
const CategoryRepository = require("./../categories/category.repository");

const ProductTagService = require("./../productTags/productTag.service");
const ProductTagRepository = require("./../productTags/productTag.repository");

const SearchService = require("./../search/search.service");
const SearchRepository = require("./../search/search.repository");

const LikedController = require("./../liked/liked.controller");
const LikedService = require("./../liked/liked.service");
const LikedRepository = require("./../liked/liked.repository");
const { likeProductValidator } = require("../validators/liked.validator");

const router = express.Router();

const tagRepository = new TagRepository();
const tagService = new TagService(tagRepository);

const productTagRepository = new ProductTagRepository();
const productTagService = new ProductTagService(productTagRepository);

const categoryRepository = new CategoryRepository();
const categoryService = new CategoryService(categoryRepository);

const searchRepository = new SearchRepository();
const searchService = new SearchService(searchRepository);

const productRepository = new ProductRepository();
const productService = new ProductService(
  productRepository,
  tagService,
  productTagService,
  categoryService,
  searchService
);
const productController = new ProductController(productService);

const likedRepository = new LikedRepository();
const likedService = new LikedService(likedRepository, productRepository);
const likedController = new LikedController(likedService);
router.post("/", authGuard(), createProductValidator, validate, productController.create);

router.post(
  "/images",
  authGuard(),
  uploadProductImage.array("images", MAX_IMAGE_COUNT),
  productController.uploadProductImages
);

router.get("/trending", productController.findTrendingProducts);

router.post("/liked", authGuard(), likeProductValidator, validate, likedController.likeProduct);
router.delete("/liked", authGuard(), likeProductValidator, validate, likedController.unlikeProduct);
router.get("/liked", authGuard(), likedController.getLikedProducts);

router.get("/", productController.findProducts);
router.get("/:id", productController.findProductById);

router.patch("/:id", authGuard(), productController.editProduct);
router.delete("/:id", authGuard(), productController.deleteProduct);

router.patch("/status/:id", authGuard(), productController.editProductStatus);

module.exports = router;

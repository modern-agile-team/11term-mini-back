"use strict";

const transaction = require("../config/transaction");
const CustomError = require("../utils/customError");
const validateImagesExist = require("../utils/image.validation");

const PRODUCT_COLUMNS = [
  "title",
  "description",
  "category_id",
  "product_condition",
  "price",
  "is_shipping_cost",
  "shipping_cost",
  "is_direct_deal",
  "direct_deal_location",
  "tags",
  "images",
];
const SORT_TYPE = ["accuracy", "popular", "latest", "price_asc", "price_desc"];

class ProductService {
  constructor(productRepository, tagService, productTagService, categoryService, searchService) {
    this.productRepository = productRepository;
    this.tagService = tagService;
    this.productTagService = productTagService;
    this.categoryService = categoryService;
    this.searchService = searchService;
  }

  async create({ images = [], tags = [], ...productData }) {
    return transaction(async (connection) => {
      const newProduct = await this.productRepository.create(productData, connection);

      if (!newProduct || newProduct.affectedRows !== 1) {
        throw new CustomError("상품 생성 실패");
      }

      const productId = newProduct.insertId;

      if (images.length > 0) {
        await validateImagesExist(images, "product");

        const result = await this.productRepository.saveProductImage(productId, images, connection);

        if (!result || result.affectedRows !== images.length)
          throw new CustomError("상품 이미지 저장 실패");
      }

      const uniqueTags = [...new Set(this.#splitTag(tags))];

      if (uniqueTags.length > 0) {
        const createdTagsId = await this.tagService.createOrFindTags(uniqueTags, connection);

        const productTags = await this.productTagService.create(
          productId,
          createdTagsId,
          connection
        );

        if (productTags.affectedRows !== createdTagsId.length) {
          throw new CustomError("상품 태그 연결 실패");
        }
      }

      return productId;
    });
  }

  async findProducts({ userId, searchType, value, limit, cursor, cursorId, offset, orderby }) {
    if (!SORT_TYPE.includes(orderby)) {
      throw new CustomError("잘못된 정렬 형식입니다.", 400);
    }

    // 검색어가 있으면 검색 로그 저장 (상점별 조회가 아닌 경우에만)
    if (value && !userId && this.searchService) {
      this.searchService
        .saveSearchLog(value, null)
        .catch((err) => console.error("검색 로그 저장 실패:", err));
    }

    if (userId || searchType) {
      if (searchType && searchType !== "tag" && searchType !== "title")
        throw new CustomError("잘못된 검색 형식입니다.", 400);

      if (searchType && !value)
        return { products: [], totalCount: 0, nextOffset: null, hasNext: false };

      return await this.productRepository.findProducts(
        userId,
        searchType,
        value,
        limit,
        offset,
        orderby
      );
    }

    return await this.productRepository.findAllProducts(limit, cursor, cursorId, orderby);
  }

  async findProductById(productId, increseViewCnt = true) {
    const rawProduct = await this.productRepository.findProductById(productId);

    if (!rawProduct) {
      throw new CustomError("존재하지 않은 상품입니다.", 404);
    }

    const { categoryId, ...product } = rawProduct;

    const [rawImages, rawCategory, rawProductTags] = await Promise.all([
      this.productRepository.findProductImages(productId),
      this.categoryService.findCategoryById(categoryId),
      this.productTagService.findProductTags(productId),
    ]);

    const tagIds = rawProductTags.map((tag) => tag.tagId);

    const tags = tagIds.length > 0 ? await this.tagService.findTagsByIds(tagIds) : [];

    const { parentId, ...categoryData } = rawCategory;

    const category = {
      category1: categoryData,
    };

    if (parentId) {
      const rawParentCategory = await this.categoryService.findCategoryById(parentId);

      const { parentId: _, ...parentCategory } = rawParentCategory;

      category.category1 = parentCategory;
      category.category2 = categoryData;
    }

    if (increseViewCnt) {
      await this.productRepository.increaseViewCount(productId);
    }

    return {
      ...product,
      images: rawImages.map((image) => image.imageUrl),
      tags: tags.map((tag) => tag.name).join(" "),
      category,
    };
  }

  async editProduct(productId, rawProductData, userId) {
    const isOwner = await this.#validateProductOwner(productId, userId);
    if (!isOwner) {
      throw new CustomError("수정할 권한이 없는 사용자입니다.", 403);
    }

    if (!rawProductData || Object.keys(rawProductData).length < 1) {
      throw new CustomError("수정할 데이터가 올바르지 않습니다", 400);
    }

    return transaction(async (connection) => {
      const { tags, images, ...productData } = rawProductData;

      const keys = Object.keys(productData);

      if (keys.length > 0) {
        const hasInvalidKey = keys.some((key) => !PRODUCT_COLUMNS.includes(key));

        if (hasInvalidKey) throw new CustomError("수정할 데이터가 올바르지 않습니다.", 400);

        const setClause = keys.map((key) => `${key} = ?`).join(", ");
        const values = keys.map((key) => productData[key]);

        const updateResult = await this.productRepository.editProduct(
          productId,
          setClause,
          values,
          connection
        );

        if (!updateResult || updateResult.affectedRows < 1) {
          throw new CustomError("상품 정보 수정에 실패하였습니다.");
        }
      }

      if (tags !== undefined) {
        await this.productTagService.deleteProductTags(productId, connection);

        const newTagsId = await this.tagService.createOrFindTags(this.#splitTag(tags), connection);

        const saveTagResult = await this.productTagService.create(productId, newTagsId, connection);

        if (!saveTagResult || saveTagResult.affectedRows < 1) {
          throw new CustomError("상품 태그 저장에 실패하였습니다.");
        }
      }

      if (images !== undefined) {
        await validateImagesExist(images, "product");

        await this.productRepository.deleteProductImage(productId, connection);

        const saveImageResult = await this.productRepository.saveProductImage(
          productId,
          images,
          connection
        );

        if (!saveImageResult || saveImageResult.affectedRows < 1) {
          throw new CustomError("상품 이미지 저장에 실패하였습니다.");
        }
      }

      return productId;
    });
  }

  async deleteProduct(productId, userId) {
    const isOwner = await this.#validateProductOwner(productId, userId);
    if (!isOwner) {
      throw new CustomError("삭제할 권한이 없는 사용자입니다.", 403);
    }

    const result = await this.productRepository.deleteProduct(productId);

    if (!result || result.affectedRows < 1) {
      throw new CustomError("상품 삭제에 실패하였습니다.");
    }

    return result;
  }

  async editProductStatus(productId, status, userId) {
    const isOwner = await this.#validateProductOwner(productId, userId);
    if (!isOwner) {
      throw new CustomError("수정할 권한이 없는 사용자입니다.", 403);
    }

    if (!Number.isInteger(status) || ![0, 1, 2].includes(status)) {
      throw new CustomError("올바르지 않은 상품 상태 입니다.", 400);
    }

    const result = await this.productRepository.editProductStatus(productId, status);

    if (!result || result.affectedRows < 1) {
      throw new CustomError("상품 상태 변경에 실패하였습니다.", 500);
    }

    return result;
  }

  async #validateProductOwner(productId, userId) {
    const product = await this.findProductById(productId, false);

    return product.userId === userId;
  }

  #splitTag(strTag) {
    if (!strTag) return [];

    return strTag
      .trim()
      .split(" ")
      .filter((tag) => tag);
  }

  async findTrendingProducts() {
    const products = await this.productRepository.findTrendingProducts();

    // popularityScore를 그대로 유지하여 프론트엔드에서 활용 가능
    return { products };
  }
}

module.exports = ProductService;

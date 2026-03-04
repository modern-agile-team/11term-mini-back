"use strict";

const path = require("path");
const CustomError = require("./customError");
const s3 = require("../config/s3");
const { HeadObjectCommand } = require("@aws-sdk/client-s3");

const PREFIXS = { products: "products/", users: "users/" };

async function validateImagesExist(imageUrl, type) {
  switch (type) {
    case "product":
      if (!Array.isArray(imageUrl)) {
        throw new CustomError("images는 배열이어야 합니다.", 400);
      }

      if (imageUrl.length > 15) {
        throw new CustomError("이미지는 최대 15개까지 업로드가 가능합니다.", 400);
      }

      const uniqueUrls = [...new Set(imageUrl)];

      await Promise.all(
        uniqueUrls.map(async (url) => {
          if (typeof url !== "string") {
            throw new CustomError("이미지 URL 형식이 올바르지 않습니다.", 400);
          }

          if (!url.startsWith(PREFIXS.products)) {
            throw new CustomError("올바르지 않은 이미지 경로입니다.", 400);
          }

          await checkImage(url);
        })
      );

      break;
    case "user":
      if (typeof imageUrl !== "string") {
        throw new CustomError("이미지 URL 형식이 올바르지 않습니다.", 400);
      }

      if (!imageUrl.startsWith(PREFIXS.users)) {
        throw new CustomError("올바르지 않은 이미지 경로입니다.", 400);
      }

      await checkImage(imageUrl);

      break;
    default:
      throw new CustomError("잘못된 이미지 저장 형식입니다.", 400);
  }
}

async function checkImage(url) {
  try {
    await s3.send(
      new HeadObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: url,
      })
    );
  } catch (error) {
    const status = error?.$metadata?.httpStatusCode;

    if (status === 404) {
      throw new CustomError(`존재하지 않는 이미지입니다.(${url})`, 400);
    }

    throw new CustomError("이미지 검증 중 오류가 발생했습니다.", 500);
  }
}

module.exports = validateImagesExist;

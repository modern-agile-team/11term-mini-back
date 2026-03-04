"use strict";

const express = require("express");

const TalksController = require("../talks/talks.controller");
const TalksService = require("../talks/talks.service");
const TalksRepository = require("../talks/talks.repository");
const ProductRepository = require("../products/product.repository");

const { createChatRoomValidator, getMessagesValidator } = require("../validators/talk.validator");
const validate = require("../middleware/validate");
const { upload, uploadProductImage } = require("../middleware/upload.middleware");
const authGuard = require("../auth/guard/auth.guard");

const router = express.Router();

const talksRepository = new TalksRepository();
const productRepository = new ProductRepository();
const talksService = new TalksService(talksRepository, productRepository);
const talksController = new TalksController(talksService);

router.post(
  "/rooms",
  authGuard(),
  createChatRoomValidator,
  validate,
  talksController.createChatRoom
);

router.get("/rooms", authGuard(), talksController.getChatRooms);

router.get(
  "/rooms/:roomId/messages",
  authGuard(),
  getMessagesValidator,
  validate,
  talksController.getMessages
);

router.post(
  "/upload",
  authGuard(),
  uploadProductImage.single("image"),
  talksController.uploadChatImage
);

module.exports = router;

"use strict";

const express = require("express");
const UserController = require("../users/user.controller");
const UserService = require("../users/user.service");
const UserRepository = require("../users/user.repository");
const authGuard = require("../auth/guard/auth.guard");
const {
  updateNicknameValidator,
  updateSummaryValidator,
  updateProfileValidator,
  followValidator,
} = require("../validators/user.validator");
const validate = require("../middleware/validate");
const { uploadProfileImage } = require("../middleware/upload.middleware");

const router = express.Router();

const userRepository = new UserRepository();
const userService = new UserService(userRepository);
const userController = new UserController(userService);

router.patch(
  "/update/users/me",
  authGuard(),
  updateProfileValidator,
  validate,
  userController.updateProfile
);

router.post(
  "/profile/image",
  authGuard(),
  uploadProfileImage.single("image"),
  userController.updateProfileImage
);

router.patch(
  "/nickname",
  authGuard(),
  updateNicknameValidator,
  validate,
  userController.updateNickname
);
router.patch(
  "/summary",
  authGuard(),
  updateSummaryValidator,
  validate,
  userController.updateSummary
);
router.post("/follow", authGuard(), followValidator, validate, userController.followUser);
router.delete("/follow", authGuard(), followValidator, validate, userController.unfollowUser);
router.get("/:id", userController.getUserInfo);

module.exports = router;

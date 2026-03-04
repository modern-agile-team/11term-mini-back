"use strict";

class UserController {
  constructor(userService) {
    this.userService = userService;
  }

  getUserInfo = async (req, res, next) => {
    try {
      const { id } = req.params;
      const userData = await this.userService.getUserInfo(id);

      return res.status(200).json({
        data: userData,
      });
    } catch (error) {
      next(error);
    }
  };

  updateNickname = async (req, res, next) => {
    try {
      const userId = req.user.id;
      const { nickname } = req.body;

      await this.userService.updateNickname(userId, nickname);

      return res.status(200).json({
        message: "상점명이 수정되었습니다.",
      });
    } catch (error) {
      next(error);
    }
  };

  updateSummary = async (req, res, next) => {
    try {
      const userId = req.user.id;
      const { summary } = req.body;

      await this.userService.updateSummary(userId, summary);

      return res.status(200).json({
        message: "소개글이 수정되었습니다.",
      });
    } catch (error) {
      next(error);
    }
  };

  updateProfile = async (req, res, next) => {
    try {
      const userId = req.user.id;
      const { nickname, summary, deleteImage, imageUrl } = req.body;

      const shouldDeleteImage = deleteImage === "true" || deleteImage === true;

      await this.userService.updateProfile(userId, {
        nickname,
        summary,
        imageUrl,
        deleteImage: shouldDeleteImage,
      });

      return res.status(200).json({
        message: "프로필이 수정되었습니다.",
      });
    } catch (error) {
      next(error);
    }
  };

  updateProfileImage = async (req, res, next) => {
    try {
      const file = req.file ?? null;
      const image = file.key;

      res.status(200).json({ image });
    } catch (error) {
      console.error(error);
      next(error);
    }
  };

  followUser = async (req, res, next) => {
    try {
      const { targetId } = req.body;
      const followerId = req.user.id;

      await this.userService.followUser(followerId, targetId);

      return res.status(200).json({
        message: "팔로우 되었습니다.",
      });
    } catch (error) {
      next(error);
    }
  };

  unfollowUser = async (req, res, next) => {
    try {
      const { targetId } = req.body;
      const followerId = req.user.id;

      await this.userService.unfollowUser(followerId, targetId);

      return res.status(200).json({
        message: "언팔로우 되었습니다.",
      });
    } catch (error) {
      next(error);
    }
  };
}

module.exports = UserController;

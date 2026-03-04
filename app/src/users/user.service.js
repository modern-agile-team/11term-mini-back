"use strict";

const CustomError = require("../utils/customError");
const { deleteFile } = require("../utils/file.util");
const valivalidateImagesExist = require("../utils/image.validation");
const path = require("path");

class UserService {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async findUserById(id) {
    return await this.userRepository.findUserById(id);
  }

  async findUserByEmail(email) {
    return await this.userRepository.findUserByEmail(email);
  }

  async findUserByNickname(nickname) {
    return await this.userRepository.findUserByNickname(nickname);
  }

  async signUp(userInfo) {
    return await this.userRepository.create(userInfo);
  }

  async saveRefreshToken(userId, token) {
    return await this.userRepository.saveRefreshToken(userId, token);
  }

  async removeRefreshToken(token) {
    return await this.userRepository.removeRefreshToken(token);
  }

  async findRefreshToken(id) {
    return await this.userRepository.findRefreshToken(id);
  }

  async getUserInfo(userId) {
    const [user, followData] = await Promise.all([
      this.userRepository.findUserById(userId),
      this.userRepository.getFollowInfo(userId),
    ]);

    if (!user) {
      throw new CustomError("사용자를 찾을 수 없습니다.", 404);
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      nickname: user.nickname,
      description: user.description,
      address: user.address,
      visitCount: user.visitCount,
      createdAt: user.createdAt,
      imageUrl: user.imageUrl,
      follow: {
        followingList: followData.followingList,
        followerList: followData.followerList,
        followingCnt: followData.followingCnt,
        followerCnt: followData.followerCnt,
      },
    };
  }

  async updateNickname(userId, nickname) {
    const existingUser = await this.userRepository.findUserByNickname(nickname);

    if (existingUser && existingUser.id !== userId) {
      throw new CustomError("이미 사용 중인 상점명입니다.", 409);
    }

    await this.userRepository.updateNickname(userId, nickname);
  }

  async updateSummary(userId, summary) {
    await this.userRepository.updateDescription(userId, summary);
  }

  async updateProfile(userId, { nickname, summary, imageUrl, deleteImage }) {
    if (nickname !== undefined) {
      const existingUser = await this.userRepository.findUserByNickname(nickname);

      if (existingUser && existingUser.id !== userId) {
        throw new CustomError("이미 사용 중인 상점명입니다.", 409);
      }

      await this.userRepository.updateNickname(userId, nickname);
    }

    if (summary !== undefined) {
      await this.userRepository.updateDescription(userId, summary);
    }

    if (deleteImage === true) {
      const user = await this.userRepository.findUserById(userId);

      if (!user.imageUrl) {
        throw new CustomError("삭제할 프로필 이미지가 없습니다.", 400);
      }

      const filePath = user.imageUrl.startsWith("/") ? user.imageUrl.substring(1) : user.imageUrl;

      deleteFile(filePath);

      await this.userRepository.clearImageUrl(userId);
    }

    if (imageUrl !== undefined) {
      await valivalidateImagesExist(imageUrl, "user");

      const user = await this.userRepository.findUserById(userId);

      if (user.imageUrl) {
        const oldFilePath = user.imageUrl.startsWith("/")
          ? user.imageUrl.substring(1)
          : user.imageUrl;

        deleteFile(oldFilePath);
      }

      await this.userRepository.updateImageUrl(userId, imageUrl);
    }
  }

  async followUser(followerId, targetId) {
    if (followerId === targetId) {
      throw new CustomError("본인을 팔로우할 수 없습니다.", 400);
    }

    const targetUser = await this.userRepository.findUserById(targetId);
    if (!targetUser) {
      throw new CustomError("팔로우할 사용자를 찾을 수 없습니다.", 404);
    }

    const isFollowing = await this.userRepository.checkFollow(followerId, targetId);
    if (isFollowing) {
      throw new CustomError("이미 팔로우 중입니다.", 409);
    }

    await this.userRepository.createFollow(followerId, targetId);
  }

  async unfollowUser(followerId, targetId) {
    const isFollowing = await this.userRepository.checkFollow(followerId, targetId);
    if (!isFollowing) {
      throw new CustomError("팔로우 중이 아닙니다.", 409);
    }

    await this.userRepository.deleteFollow(followerId, targetId);
  }

  async updateResetToken(userId, token, expiresAt) {
    return await this.userRepository.updateResetToken(userId, token, expiresAt);
  }

  async findUserByResetToken(token) {
    return await this.userRepository.findUserByResetToken(token);
  }

  async updatePasswordAndClearToken(userId, hashedPassword) {
    return await this.userRepository.updatePasswordAndClearToken(userId, hashedPassword);
  }

  async updatePassword(userId, hashedPassword) {
    return await this.userRepository.updatePassword(userId, hashedPassword);
  }

  async removeAllRefreshTokensByUserId(userId) {
    return await this.userRepository.removeAllRefreshTokensByUserId(userId);
  }
}

module.exports = UserService;

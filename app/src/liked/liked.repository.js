"use strict";

const { execute } = require("../config/db");

class LikedRepository {
  async findLikedProduct(userId, productId) {
    const query = `
      SELECT * FROM liked_product
      WHERE user_id = ? AND product_id = ?
    `;
    const rows = await execute(query, [userId, productId]);
    return rows.length > 0;
  }

  async createLikedProduct(userId, productId) {
    const query = `
      INSERT INTO liked_product (user_id, product_id)
      VALUES (?, ?)
    `;
    await execute(query, [userId, productId]);
  }

  async deleteLikedProduct(userId, productId) {
    const query = `
      DELETE FROM liked_product
      WHERE user_id = ? AND product_id = ?
    `;
    await execute(query, [userId, productId]);
  }

  async findLikedProductsByUserId(userId) {
    const query = `
      SELECT
        p.id AS productId,
        p.title,
        p.price,
        p.sale_status AS saleStatus,
        p.created_at AS createdAt,
        (
          SELECT pi.image_url
          FROM product_images pi
          WHERE pi.product_id = p.id AND pi.is_thumbnail = 1
          ORDER BY pi.id ASC
          LIMIT 1
        ) AS imageUrl
      FROM liked_product lp
      JOIN products p ON lp.product_id = p.id
      WHERE lp.user_id = ?
        AND p.deleted_at IS NULL
      ORDER BY p.created_at DESC
    `;
    const rows = await execute(query, [userId]);
    return rows || [];
  }
}

module.exports = LikedRepository;

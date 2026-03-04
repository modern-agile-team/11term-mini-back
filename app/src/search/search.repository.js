"use strict";

const { execute } = require("../config/db");

class SearchRepository {
  async saveSearchLog(keyword, userId = null) {
    const query = `
      INSERT INTO search_logs (keyword, user_id, search_count)
      VALUES (?, ?, 1)
      ON DUPLICATE KEY UPDATE
        search_count = search_count + 1,
        created_at = NOW(),
        user_id = COALESCE(VALUES(user_id), user_id)
    `;
    await execute(query, [keyword, userId]);
  }

  async getPopularKeywords(limit = 10) {
    const query = `
      SELECT keyword, SUM(search_count) AS search_count
      FROM search_logs
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
      GROUP BY keyword
      ORDER BY search_count DESC
      LIMIT ?
    `;
    const rows = await execute(query, [limit]);
    return rows;
  }
}

module.exports = SearchRepository;

"use strict";

const { normalizeSearchKeyword } = require("../utils/searchKeyword.util");

class SearchService {
  constructor(searchRepository) {
    this.searchRepository = searchRepository;
  }

  async saveSearchLog(keyword, userId = null) {
    const normalizedKeyword = normalizeSearchKeyword(keyword);

    if (!normalizedKeyword) {
      return;
    }

    await this.searchRepository.saveSearchLog(normalizedKeyword, userId);
  }

  async getPopularKeywords(limit = 10) {
    const keywords = await this.searchRepository.getPopularKeywords(limit);

    let currentRank = 1;
    let prevCount = null;

    return keywords.map((item, index) => {
      if (prevCount !== item.search_count) {
        currentRank = index + 1;
      }

      prevCount = item.search_count;

      return {
        rank: currentRank,
        keyword: item.keyword,
        searchCount: item.search_count,
      };
    });
  }
}

module.exports = SearchService;

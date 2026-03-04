"use strict";

const normalizeSearchKeyword = (keyword) => {
  if (typeof keyword !== "string") return "";

  return keyword.trim().toLowerCase().replace(/\s+/g, "");
};

module.exports = {
  normalizeSearchKeyword,
};

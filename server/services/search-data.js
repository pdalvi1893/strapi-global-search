"use strict";

/**
 *  service
 */

const { createCoreService } = require("@strapi/strapi").factories;

module.exports = createCoreService("plugin::simple-global-search.search-data", {
  async search() {
    return "testing search data plugin 123";
  },
});

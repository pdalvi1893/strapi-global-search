"use strict";

/**
 *  controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController(
  "plugin::simple-global-search.search-data",
  {
    async search(ctx) {
      ctx.body = await strapi
        .plugin("simple-global-search")
        .service("search-config")
        .search(ctx);
    },
  }
);

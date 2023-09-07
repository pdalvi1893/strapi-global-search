"use strict";

/**
 *  router.
 */

module.exports = {
  type: "content-api", // other type available: admin.
  routes: [
    {
      method: "GET",
      path: "/search",
      handler: "search-data.search",
      config: {
        policies: [],
        //auth: false,
      },
    },
  ],
};
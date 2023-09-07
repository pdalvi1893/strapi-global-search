"use strict";

/**
 *  router.
 */

module.exports = {
  type: "admin",
  routes: [
    {
      method: "GET",
      path: "/count",
      handler: "search-config.count",
      config: {
        policies: [],
        auth: false,
      },
    },
    {
      method: "GET",
      path: "/settings",
      handler: "search-config.getSettings",
      config: {
        policies: [],
        auth: false,
      },
    },
    {
      method: "POST",
      path: "/settings",
      handler: "search-config.setSettings",
      config: {
        policies: [],
        auth: false,
      },
    },
  ],
};

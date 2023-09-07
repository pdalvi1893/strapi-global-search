'use strict';

/**
 *  controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('plugin::simple-global-search.search-config', {
  async count(ctx) {
    ctx.body = await strapi.plugin('simple-global-search').service('search-config').count();
  },
  async getSettings(ctx) {
    try {
      ctx.body = await strapi.plugin('simple-global-search').service('search-config').getSettings();
    } catch (err) {
      ctx.throw(500, err);
    }
  },
  async setSettings(ctx) {
    const { body } = ctx.request;
    try {
      await strapi.plugin('simple-global-search').service('search-config').setSettings(JSON.parse(body.data));
      ctx.body = await strapi.plugin('simple-global-search').service('search-config').getSettings();
    } catch (err) {
      ctx.throw(500, err);
    }
  },
  async syncData(ctx) {
    try {
      ctx.body = await strapi.plugin('simple-global-search').service('search-config').syncEntities();
    } catch (err) {
      ctx.throw(500, err);
    }
  },
});

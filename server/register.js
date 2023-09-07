'use strict';

module.exports = ({ strapi }) => {
  // registeration phase
  strapi.eventHub.addListener('entry.create', async (listener) => {
    const settings = await strapi
      .plugin('simple-global-search')
      .service('search-config')
      .getSettings();

    for (let key in settings) {
      if (settings[key].api === listener.uid) {
        // let entry = await strapi.entityService.findOne(listener.uid, listener.entry.id, {
        //   populate: '*',
        // });

        await strapi
          .plugin('simple-global-search')
          .service('search-config')
          .syncSingleItem(listener.entry, key);
      }
    }
  });

  strapi.eventHub.addListener('entry.update', async (listener) => {
    const settings = await strapi
      .plugin('simple-global-search')
      .service('search-config')
      .getSettings();

    for (let key in settings) {
      if (settings[key].api === listener.uid) {
        // let entry = await strapi.entityService.findOne(listener.uid, listener.entry.id, {
        //   populate: '*',
        // });

        await strapi
          .plugin('simple-global-search')
          .service('search-config')
          .syncSingleItem(listener.entry, key);
      }
    }
  });
};

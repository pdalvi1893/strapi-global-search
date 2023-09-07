'use strict';

/**
 *  service
 */

const { createCoreService } = require('@strapi/strapi').factories;

const articleMainCategory = 'api::article-main-category.article-main-category';

const _ = require('lodash');

function getPluginStore() {
  return strapi.store({
    environment: '',
    type: 'plugin',
    name: 'simple-global-search',
  });
}
async function createDefaultConfig() {
  const pluginStore = getPluginStore();
  const value = {
    disabled: false,
  };
  await pluginStore.set({ key: 'settings', value });
  return pluginStore.get({ key: 'settings' });
}

module.exports = createCoreService('plugin::simple-global-search.search-config', {
  async count() {
    return 'testing new search plugin 123';
  },
  async getSettings() {
    const pluginStore = getPluginStore();
    let config = await pluginStore.get({ key: 'settings' });
    if (!config) {
      config = await createDefaultConfig();
    }
    return config;
  },
  async setSettings(settings) {
    const value = settings;
    const pluginStore = getPluginStore();
    await pluginStore.set({ key: 'settings', value });
    return pluginStore.get({ key: 'settings' });
  },

  async syncEntities() {
    const searchApis = await strapi
      .plugin('simple-global-search')
      .service('search-config')
      .getSettings(); //strapi.config.get('search');
    const cultures = await strapi.plugins.i18n.services.locales.find();

    for (let key in searchApis) {
      for (const { code } of cultures) {
        let entities = await strapi.entityService.findMany(searchApis[key].api, {
          populate: '*',
          locale: code,
        });
        let mainCategories = await strapi.entityService.findMany(
          'api::article-main-category.article-main-category',
          {
            populate: {
              SubCategories: {
                fields: ['id'],
              },
            },
            locale: code,
          }
        );

        let ignoreFields = [
          //"id",
          'locale',
          'publishedAt',
          'createdAt',
          'updatedAt',
          'updatedBy',
          'createdBy',
        ];

        ignoreFields = ignoreFields.concat(searchApis[key].ignore_fields);
        let filterableFields = searchApis[key].filterable_fields;
        let sortableFields = searchApis[key].sortable_fields;

        //entities = _.map(entities, obj => _.omit(obj, ignoreFields));

        _.each(entities, async (item) => {
          let entity = {};
          let entityId = item.id;

          let sanitizedEntity = _.omit(item, ignoreFields);
          var normalizedData = strapi
            .service('plugin::simple-global-search.search-config')
            .gatherProperties(sanitizedEntity);

          // set categories
          if (filterableFields.length) {
            _.each(filterableFields, (field) => {
              let fieldValue = _.pick(item, field);
              let category = _.find(mainCategories, (item) =>
                item.SubCategories.some((i) => i.id === fieldValue[field]?.id)
              );
              entity['category'] = category?.id || 0;
            });
          }

          if (sortableFields.length) {
            _.each(sortableFields, (field) => {
              let fieldValue = _.pick(item, field);
              entity['published_date'] = fieldValue[field] || '';
            });
          }

          let index = 1;
          for (let key in normalizedData) {
            if (normalizedData[key]) {
              entity['search_param' + index] = normalizedData[key];
              index += 1;
            }
          }

          let searchEntity = await strapi.entityService.findMany(
            'plugin::simple-global-search.search-data',
            {
              filters: {
                entity_id: entityId || 0,
                api: searchApis[key].api,
              },
              locale: code,
              limit: 1,
            }
          );
          searchEntity = searchEntity.length ? searchEntity[0] : null;
          if (searchEntity)
            strapi.entityService.update('plugin::simple-global-search.search-data', item.id, {
              data: {
                api: searchApis[key].api,
                json_field: entity,
                entity_id: entityId,
                locale: code,
              },
            });
          else
            strapi.entityService.create('plugin::simple-global-search.search-data', {
              data: {
                api: searchApis[key].api,
                json_field: entity,
                entity_id: entityId,
                locale: code,
              },
            });
        });
      }
    }
  },

  async syncSingleItem(item, apiType) {
    const searchApis = await strapi
      .plugin('simple-global-search')
      .service('search-config')
      .getSettings(); //strapi.config.get('search');

    item = await strapi.entityService.findOne(searchApis[apiType].api, item.id, {
      populate: '*',
      locale: item.locale,
    });

    let mainCategories = await strapi.entityService.findMany(
      'api::article-main-category.article-main-category',
      {
        populate: {
          SubCategories: {
            fields: ['id'],
          },
        },
        locale: item.locale,
      }
    );

    let ignoreFields = [
      //"id",
      'locale',
      'publishedAt',
      'createdAt',
      'updatedAt',
      'updatedBy',
      'createdBy',
    ];

    ignoreFields = ignoreFields.concat(searchApis[apiType].ignore_fields);
    let filterableFields = searchApis[apiType].filterable_fields;
    let sortableFields = searchApis[apiType].sortable_fields;
    const newEntity = _.omit(item, ignoreFields);

    var normalizedData = strapi
      .service('plugin::simple-global-search.search-config')
      .gatherProperties(newEntity);

    let index = 1;
    let entity = {};

    if (filterableFields.length) {
      _.each(filterableFields, (field) => {
        let fieldValue = _.pick(item, field);
        let category = _.find(mainCategories, (item) =>
          item.SubCategories.some((i) => i.id === fieldValue[field]?.id)
        );
        entity['category'] = category?.id || 0;
      });
    }

    if (sortableFields.length) {
      _.each(sortableFields, (field) => {
        let fieldValue = _.pick(item, field);
        entity['published_date'] = fieldValue[field] || '';
      });
    }

    for (let key in normalizedData) {
      if (normalizedData[key]) {
        entity['search_param' + index] = normalizedData[key];
        index += 1;
      }
    }

    let searchEntity = await strapi.entityService.findMany(
      'plugin::simple-global-search.search-data',
      {
        filters: {
          entity_id: item?.id || 0,
          api: searchApis[apiType].api,
        },
        locale: item.locale,
        limit: 1,
      }
    );
    searchEntity = searchEntity.length ? searchEntity[0] : null;
    if (searchEntity)
      strapi.entityService.update('plugin::simple-global-search.search-data', searchEntity.id, {
        data: {
          api: searchApis[apiType].api,
          json_field: entity,
          entity_id: item.id,
          locale: item.locale,
        },
      });
    else
      strapi.entityService.create('plugin::simple-global-search.search-data', {
        data: {
          api: searchApis[apiType].api,
          json_field: entity,
          entity_id: item.id,
          locale: item.locale,
        },
      });
  },

  async search(ctx) {
    //await strapi.service('api::search.search').syncEntities();
    const { term, pagination, category, sort_by } = ctx.request.query;
    const pageNumber = pagination?.page ? parseInt(pagination.page) : 1;
    const limit = parseInt(
      pagination?.pageSize ?? strapi.config.get('constants.DEFAULT_RESPONSE_LIMIT')
    );
    const start = limit * (pageNumber - 1);

    const knex = strapi.db.connection.context;
    const strQuery = `select * from search_datas where `;
    let sqlQuery = '';

    for (let i = 1; i < 50; i++) {
      sqlQuery += i !== 1 ? ' OR ' : '(';
      sqlQuery += `json_field ->> 'search_param${i}' ilike '%${term}%'`;
      sqlQuery += i === 49 ? ')' : '';
    }

    if (category) {
      sqlQuery += ` and json_field ->> 'category' = '${category}' and api = 'api::article.article'`;
    }

    // Locale to always come befor order by clause.
    sqlQuery += ` and locale = '${ctx.locale}'`;

    if (sort_by) {
      sqlQuery += ` order by json_field ->> 'published_date' ${sort_by}`;
    }

    let queryResult = await knex.raw(strQuery + sqlQuery);

    const rowCount = queryResult?.rows?.length;
    const totalPages = Math.ceil(queryResult?.rows?.length / limit);
    const nextPage = totalPages > pageNumber ? pageNumber + 1 : pageNumber;
    queryResult.rows = queryResult.rows.slice(start, pageNumber * limit);

    const searchGrouped = _.groupBy(queryResult.rows, 'api');

    let promises = [];
    for (let key in searchGrouped) {
      let orderedList = _.map(searchGrouped[key], ({ entity_id }) => entity_id);
      let entity = {
        api: key,
        results: await strapi.entityService.findMany(key, {
          filters: {
            id: orderedList, //_.map(searchGrouped[key], ({ entity_id }) => entity_id),
          },
          populate: {
            ArticleThemes: {
              fields: ['id', 'PageTitle', 'PageUID'],
            },
            ThumbnailImage: true,
          },
        }),
      };
      entity.results = _.sortBy(entity.results, (obj) => _.indexOf(orderedList, obj.id));
      promises.push(entity);
    }

    let result = await Promise.all(promises);

    const allCategories = await strapi
      .service('plugin::simple-global-search.search-config')
      .getCategoriesCount(ctx);

    return {
      result,
      category: allCategories,
      meta: {
        pagination: {
          page: nextPage,
          pageSize: limit,
          pageCount: totalPages,
          total: rowCount,
        },
      },
    };
  },

  async getCategoriesCount(ctx) {
    const { term } = ctx.request.query;
    const knex = strapi.db.connection.context;
    const strQuery = `select * from search_datas where api = 'api::article.article' and `;
    let sqlQuery = '';

    for (let i = 1; i < 50; i++) {
      sqlQuery += i !== 1 ? ' OR ' : '';
      sqlQuery += `json_field ->> 'search_param${i}' ilike '%${term}%'`;
    }

    sqlQuery += ` and locale = '${ctx.locale}'`;

    let queryResult = await knex.raw(strQuery + sqlQuery);

    const mainCategories = await strapi.entityService.findMany(articleMainCategory, {
      locale: 'en',
    });

    const jsonArray = _.flatMap(queryResult.rows, 'json_field');
    const groupedCategories = _.groupBy(jsonArray, 'category');

    let result = {
      All: {
        label: 'All',
        count: queryResult?.rows?.length || 0,
      },
    };

    _.each(mainCategories, (item) => {
      result[item.id] = {
        label: item.PageTitle,
        count: groupedCategories[item.id]?.length || 0,
      };
    });

    return result;
  },

  gatherProperties(obj, parentKey = '', result = {}) {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const fullPath = parentKey ? `${parentKey}.${key}` : key;

        if (typeof obj[key] === 'object' && obj[key] !== null) {
          if (Array.isArray(obj[key])) {
            for (let i = 0; i < obj[key].length; i++) {
              this.gatherProperties(obj[key][i], `${fullPath}[${i}]`, result);
            }
          } else {
            this.gatherProperties(obj[key], fullPath, result);
          }
        } else {
          result[fullPath] = obj[key];
        }
      }
    }
    return result;
  },
});

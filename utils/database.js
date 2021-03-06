const keyv = require("keyv"); // for caching and stuff
const mongodb = require("mongodb");
const config = require("../config.json");

const cache = {};

const clientprom = mongodb.MongoClient.connect(config.mongo);

module.exports = {
  /**
   * Получить значение из БД
   *
   * @template defType
   *
   * @param {string} id айди
   * @param {string} key поле
   * @param {defType} def значение по умолчанию
   *
   * @returns {Promise<defType>}
   */
  async get(id, key, def) {
    if (!cache[key]) {
      cache[key] = new keyv(config.cache, { namespace: key });
    }

    const client = await clientprom;

    const fromCache = await (cache[key].get(`${id}_${key}`));

    if (fromCache) {
      return fromCache;
    }

    const collection = client.db("nicory").collection(key);

    const toBeCached = await (collection.findOne({ id }));
    if (!toBeCached) {
      return def;
    }

    await (cache[key].set(`${id}`, toBeCached.value));
    return toBeCached.value;
  },

  /**
   * Установка значения в БД
   *
   * @template T
   *
   * @param {string} id айди
   * @param {string} key поле
   * @param {T} value значение
   *
   * @returns {Promise<T>}
   */
  async set(id, key, value) {
    if (!cache[key]) {
      cache[key] = new keyv(config.cache, { namespace: key });
    }

    const client = await clientprom;
    const collection = client.db("nicory").collection(key);

    collection.updateOne({ id }, { $set: { value } }, { upsert: true });

    return await (cache[key].set(`${id}`, value));
  },

  /**
 * Удаление ключа в БД
 *
 * @param {string} id айди
 * @param {string} key поле
 *
 * @returns {Promise}
 */
  async delete(id, key) {
    if (!cache[key]) {
      cache[key] = new keyv(config.cache, { namespace: key });
    }

    const client = await clientprom;
    const collection = client.db("nicory").collection(key);

    collection.deleteMany({ id });

    return await (cache[key].delete(`${id}`));
  },
};

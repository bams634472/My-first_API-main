const db = require('../config/database');
const { getCache, setCache, invalidateCache } = require('../config/redis');

const getCities = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = Math.min(parseInt(req.query.limit) || 20, 20);
  const offset = (page - 1) * limit;
  const countryId = req.query.country_id;
  const isCapital = req.query.is_capital;

  let query = 'SELECT * FROM cities WHERE 1=1';
  let countQuery = 'SELECT COUNT(*) as total FROM cities WHERE 1=1';
  const params = [];

  if (countryId) {
    query += ' AND country_id = ?';
    countQuery += ' AND country_id = ?';
    params.push(countryId);
  }
  if (isCapital !== undefined) {
    query += ' AND is_capital = ?';
    countQuery += ' AND is_capital = ?';
    params.push(isCapital === 'true' ? 1 : 0);
  }

  const cacheKey = `cities:list:p${page}:l${limit}:c${countryId || 'all'}:cap${isCapital || 'all'}`;

  try {
    const cachedData = await getCache(cacheKey);
    if (cachedData) return res.json(cachedData);

    const total = db.prepare(countQuery).get(...params).total;
    const cities = db.prepare(`${query} LIMIT ? OFFSET ?`).all(...params, limit, offset);

    const response = {
      data: cities,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };

    await setCache(cacheKey, response);
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getCityById = async (req, res) => {
  const { id } = req.params;
  const cacheKey = `city:${id}`;

  try {
    const cachedData = await getCache(cacheKey);
    if (cachedData) return res.json(cachedData);

    const city = db.prepare('SELECT * FROM cities WHERE id = ?').get(id);
    if (!city) return res.status(404).json({ error: 'City not found' });

    await setCache(cacheKey, city);
    res.json(city);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const createCity = async (req, res) => {
  const { name, country_id, population, is_capital } = req.body;
  if (!name || !country_id) return res.status(400).json({ error: 'Name and country_id are required' });

  try {
    const stmt = db.prepare('INSERT INTO cities (name, country_id, population, is_capital) VALUES (?, ?, ?, ?)');
    const result = stmt.run(name, country_id, population, is_capital ? 1 : 0);
    
    await invalidateCache('cities:*');
    res.status(201).json({ id: result.lastInsertRowid, name, country_id, population, is_capital });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateCity = async (req, res) => {
  const { id } = req.params;
  const { name, country_id, population, is_capital } = req.body;

  try {
    const stmt = db.prepare('UPDATE cities SET name = COALESCE(?, name), country_id = COALESCE(?, country_id), population = COALESCE(?, population), is_capital = COALESCE(?, is_capital) WHERE id = ?');
    const result = stmt.run(name, country_id, population, is_capital !== undefined ? (is_capital ? 1 : 0) : null, id);

    if (result.changes === 0) return res.status(404).json({ error: 'City not found' });

    await invalidateCache('cities:*');
    await invalidateCache(`city:${id}`);
    res.json({ message: 'City updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const deleteCity = async (req, res) => {
  const { id } = req.params;

  try {
    const result = db.prepare('DELETE FROM cities WHERE id = ?').run(id);
    if (result.changes === 0) return res.status(404).json({ error: 'City not found' });

    await invalidateCache('cities:*');
    await invalidateCache(`city:${id}`);
    res.json({ message: 'City deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { getCities, getCityById, createCity, updateCity, deleteCity };

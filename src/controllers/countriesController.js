const db = require('../config/database');
const { getCache, setCache, invalidateCache } = require('../config/redis');

const getCountries = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = Math.min(parseInt(req.query.limit) || 20, 20);
  const offset = (page - 1) * limit;
  const cacheKey = `countries:list:p${page}:l${limit}`;

  try {
    const cachedData = await getCache(cacheKey);
    if (cachedData) return res.json(cachedData);

    const total = db.prepare('SELECT COUNT(*) as total FROM countries').get().total;
    const countries = db.prepare('SELECT * FROM countries LIMIT ? OFFSET ?').all(limit, offset);

    const response = {
      data: countries,
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

const getCountryByIso = async (req, res) => {
  const { isoCode } = req.params;
  const cacheKey = `country:${isoCode.toUpperCase()}`;

  try {
    const cachedData = await getCache(cacheKey);
    if (cachedData) return res.json(cachedData);

    const country = db.prepare('SELECT * FROM countries WHERE iso_code = ?').get(isoCode.toUpperCase());
    if (!country) return res.status(404).json({ error: 'Country not found' });

    await setCache(cacheKey, country);
    res.json(country);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const createCountry = async (req, res) => {
  const { name, iso_code, continent, population } = req.body;
  if (!name || !iso_code) return res.status(400).json({ error: 'Name and ISO code are required' });

  try {
    const stmt = db.prepare('INSERT INTO countries (name, iso_code, continent, population) VALUES (?, ?, ?, ?)');
    const result = stmt.run(name, iso_code.toUpperCase(), continent, population);
    
    await invalidateCache('countries:*');
    res.status(201).json({ id: result.lastInsertRowid, name, iso_code: iso_code.toUpperCase(), continent, population });
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT') return res.status(400).json({ error: 'ISO code already exists' });
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateCountry = async (req, res) => {
  const { isoCode } = req.params;
  const { name, continent, population } = req.body;

  try {
    const stmt = db.prepare('UPDATE countries SET name = COALESCE(?, name), continent = COALESCE(?, continent), population = COALESCE(?, population) WHERE iso_code = ?');
    const result = stmt.run(name, continent, population, isoCode.toUpperCase());

    if (result.changes === 0) return res.status(404).json({ error: 'Country not found' });

    await invalidateCache('countries:*');
    await invalidateCache(`country:${isoCode.toUpperCase()}`);
    res.json({ message: 'Country updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const deleteCountry = async (req, res) => {
  const { isoCode } = req.params;

  try {
    const result = db.prepare('DELETE FROM countries WHERE iso_code = ?').run(isoCode.toUpperCase());
    if (result.changes === 0) return res.status(404).json({ error: 'Country not found' });

    await invalidateCache('countries:*');
    await invalidateCache(`country:${isoCode.toUpperCase()}`);
    res.json({ message: 'Country deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { getCountries, getCountryByIso, createCountry, updateCountry, deleteCountry };

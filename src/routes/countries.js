const express = require('express');
const router = express.Router();
const countriesController = require('../controllers/countriesController');
const { authenticate } = require("../middleware/auth");

/**
 * @swagger
 * /countries:
 *   get:
 *     summary: Get paginated list of countries
 *     tags: [Countries]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of countries
 */
router.get('/', countriesController.getCountries);

/**
 * @swagger
 * /countries/{isoCode}:
 *   get:
 *     summary: Get country by ISO code
 *     tags: [Countries]
 *     parameters:
 *       - in: path
 *         name: isoCode
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Country details
 *       404:
 *         description: Country not found
 */
router.get('/:isoCode', countriesController.getCountryByIso);

/**
 * @swagger
 * /countries:
 *   post:
 *     summary: Create a new country
 *     tags: [Countries]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               iso_code:
 *                 type: string
 *               continent:
 *                 type: string
 *               population:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Country created
 */
router.post('/', authenticate, countriesController.createCountry);

/**
 * @swagger
 * /countries/{isoCode}:
 *   put:
 *     summary: Update a country
 *     tags: [Countries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: isoCode
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               continent:
 *                 type: string
 *               population:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Country updated
 */
router.put('/:isoCode', authenticate, countriesController.updateCountry);

/**
 * @swagger
 * /countries/{isoCode}:
 *   delete:
 *     summary: Delete a country
 *     tags: [Countries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: isoCode
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Country deleted
 */
router.delete('/:isoCode', authenticate, countriesController.deleteCountry);

module.exports = router;

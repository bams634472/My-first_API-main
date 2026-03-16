const express = require('express');
const router = express.Router();
const citiesController = require('../controllers/citiesController');
const { authenticate } = require("../middleware/auth");

/**
 * @swagger
 * /cities:
 *   get:
 *     summary: Get paginated list of cities
 *     tags: [Cities]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: country_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: is_capital
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: List of cities
 */
router.get('/', citiesController.getCities);

/**
 * @swagger
 * /cities/{id}:
 *   get:
 *     summary: Get city by ID
 *     tags: [Cities]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: City details
 *       404:
 *         description: City not found
 */
router.get('/:id', citiesController.getCityById);

/**
 * @swagger
 * /cities:
 *   post:
 *     summary: Create a new city
 *     tags: [Cities]
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
 *               country_id:
 *                 type: integer
 *               population:
 *                 type: integer
 *               is_capital:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: City created
 */
router.post('/', authenticate, citiesController.createCity);

/**
 * @swagger
 * /cities/{id}:
 *   put:
 *     summary: Update a city
 *     tags: [Cities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               country_id:
 *                 type: integer
 *               population:
 *                 type: integer
 *               is_capital:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: City updated
 */
router.put('/:id', authenticate, citiesController.updateCity);

/**
 * @swagger
 * /cities/{id}:
 *   delete:
 *     summary: Delete a city
 *     tags: [Cities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: City deleted
 */
router.delete('/:id', authenticate, citiesController.deleteCity);

module.exports = router;

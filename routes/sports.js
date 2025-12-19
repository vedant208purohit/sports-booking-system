const express = require('express');
const router = express.Router();
const { query } = require('../db/connection');

// GET all sports
router.get('/', async (req, res) => {
  try {
    const result = await query('SELECT * FROM sports ORDER BY sport_id');
    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching sports:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch sports',
      message: error.message
    });
  }
});

// GET sport by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query('SELECT * FROM sports WHERE sport_id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Sport not found'
      });
    }
    
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching sport:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch sport',
      message: error.message
    });
  }
});

module.exports = router;


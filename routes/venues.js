const express = require('express');
const router = express.Router();
const { query } = require('../db/connection');

// GET all venues
router.get('/', async (req, res) => {
  try {
    const result = await query('SELECT * FROM venues ORDER BY venue_id');
    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching venues:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch venues',
      message: error.message
    });
  }
});

// GET venue by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query('SELECT * FROM venues WHERE venue_id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Venue not found'
      });
    }
    
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching venue:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch venue',
      message: error.message
    });
  }
});

// POST create new venue
router.post('/', async (req, res) => {
  try {
    const { name, location } = req.body;
    
    // Validation
    if (!name || !location) {
      return res.status(400).json({
        success: false,
        error: 'Name and location are required'
      });
    }
    
    const result = await query(
      'INSERT INTO venues (name, location) VALUES ($1, $2) RETURNING *',
      [name, location]
    );
    
    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating venue:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create venue',
      message: error.message
    });
  }
});

// PUT update venue
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, location } = req.body;
    
    // Check if venue exists
    const checkResult = await query('SELECT * FROM venues WHERE venue_id = $1', [id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Venue not found'
      });
    }
    
    const result = await query(
      'UPDATE venues SET name = COALESCE($1, name), location = COALESCE($2, location) WHERE venue_id = $3 RETURNING *',
      [name, location, id]
    );
    
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating venue:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update venue',
      message: error.message
    });
  }
});

// DELETE venue
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await query('DELETE FROM venues WHERE venue_id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Venue not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Venue deleted successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error deleting venue:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete venue',
      message: error.message
    });
  }
});

module.exports = router;


const express = require('express');
const router = express.Router();
const { query } = require('../db/connection');

// GET all members
router.get('/', async (req, res) => {
  try {
    const { status, is_trial_user, converted_from_trial } = req.query;
    
    let sql = 'SELECT * FROM members WHERE 1=1';
    const params = [];
    let paramCount = 1;
    
    if (status) {
      sql += ` AND status = $${paramCount++}`;
      params.push(status);
    }
    
    if (is_trial_user !== undefined) {
      sql += ` AND is_trial_user = $${paramCount++}`;
      params.push(is_trial_user === 'true');
    }
    
    if (converted_from_trial !== undefined) {
      sql += ` AND converted_from_trial = $${paramCount++}`;
      params.push(converted_from_trial === 'true');
    }
    
    sql += ' ORDER BY member_id';
    
    const result = await query(sql, params);
    
    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching members:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch members',
      message: error.message
    });
  }
});

// GET member by ID with related bookings and transactions
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get member details
    const memberResult = await query('SELECT * FROM members WHERE member_id = $1', [id]);
    
    if (memberResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Member not found'
      });
    }
    
    // Get member's bookings
    const bookingsResult = await query(`
      SELECT 
        b.*,
        v.name as venue_name,
        v.location as venue_location,
        s.name as sport_name
      FROM bookings b
      JOIN venues v ON b.venue_id = v.venue_id
      JOIN sports s ON b.sport_id = s.sport_id
      WHERE b.member_id = $1
      ORDER BY b.booking_date DESC
    `, [id]);
    
    // Get member's transactions
    const transactionsResult = await query(`
      SELECT t.*
      FROM transactions t
      JOIN bookings b ON t.booking_id = b.booking_id
      WHERE b.member_id = $1
      ORDER BY t.transaction_date DESC
    `, [id]);
    
    res.json({
      success: true,
      data: {
        ...memberResult.rows[0],
        bookings: bookingsResult.rows,
        transactions: transactionsResult.rows
      }
    });
  } catch (error) {
    console.error('Error fetching member:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch member',
      message: error.message
    });
  }
});

// POST create new member
router.post('/', async (req, res) => {
  try {
    const { name, status, is_trial_user, converted_from_trial, join_date } = req.body;
    
    // Validation
    if (!name || !status || !join_date) {
      return res.status(400).json({
        success: false,
        error: 'name, status, and join_date are required'
      });
    }
    
    // Validate status
    const validStatuses = ['Active', 'Inactive'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Status must be one of: ${validStatuses.join(', ')}`
      });
    }
    
    const result = await query(
      `INSERT INTO members (name, status, is_trial_user, converted_from_trial, join_date) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [
        name,
        status,
        is_trial_user || false,
        converted_from_trial || false,
        join_date
      ]
    );
    
    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating member:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create member',
      message: error.message
    });
  }
});

// PUT update member
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, status, is_trial_user, converted_from_trial, join_date } = req.body;
    
    // Check if member exists
    const checkResult = await query('SELECT * FROM members WHERE member_id = $1', [id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Member not found'
      });
    }
    
    // Validate status if provided
    if (status) {
      const validStatuses = ['Active', 'Inactive'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          error: `Status must be one of: ${validStatuses.join(', ')}`
        });
      }
    }
    
    const result = await query(
      `UPDATE members 
       SET name = COALESCE($1, name),
           status = COALESCE($2, status),
           is_trial_user = COALESCE($3, is_trial_user),
           converted_from_trial = COALESCE($4, converted_from_trial),
           join_date = COALESCE($5, join_date)
       WHERE member_id = $6 
       RETURNING *`,
      [name, status, is_trial_user, converted_from_trial, join_date, id]
    );
    
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating member:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update member',
      message: error.message
    });
  }
});

// DELETE member
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await query('DELETE FROM members WHERE member_id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Member not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Member deleted successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error deleting member:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete member',
      message: error.message
    });
  }
});

module.exports = router;


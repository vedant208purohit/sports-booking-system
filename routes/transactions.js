const express = require('express');
const router = express.Router();
const { query } = require('../db/connection');

// GET all transactions with related data
router.get('/', async (req, res) => {
  try {
    const { booking_id, type, status, start_date, end_date } = req.query;
    
    let sql = `
      SELECT 
        t.*,
        b.booking_date,
        b.amount as booking_amount,
        b.status as booking_status,
        v.name as venue_name,
        m.name as member_name
      FROM transactions t
      LEFT JOIN bookings b ON t.booking_id = b.booking_id
      LEFT JOIN venues v ON b.venue_id = v.venue_id
      LEFT JOIN members m ON b.member_id = m.member_id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;
    
    if (booking_id) {
      sql += ` AND t.booking_id = $${paramCount++}`;
      params.push(booking_id);
    }
    
    if (type) {
      sql += ` AND t.type = $${paramCount++}`;
      params.push(type);
    }
    
    if (status) {
      sql += ` AND t.status = $${paramCount++}`;
      params.push(status);
    }
    
    if (start_date) {
      sql += ` AND t.transaction_date >= $${paramCount++}`;
      params.push(start_date);
    }
    
    if (end_date) {
      sql += ` AND t.transaction_date <= $${paramCount++}`;
      params.push(end_date);
    }
    
    sql += ' ORDER BY t.transaction_date DESC, t.transaction_id DESC';
    
    const result = await query(sql, params);
    
    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch transactions',
      message: error.message
    });
  }
});

// GET transaction by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query(`
      SELECT 
        t.*,
        b.booking_date,
        b.amount as booking_amount,
        b.status as booking_status,
        v.name as venue_name,
        m.name as member_name
      FROM transactions t
      LEFT JOIN bookings b ON t.booking_id = b.booking_id
      LEFT JOIN venues v ON b.venue_id = v.venue_id
      LEFT JOIN members m ON b.member_id = m.member_id
      WHERE t.transaction_id = $1
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found'
      });
    }
    
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching transaction:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch transaction',
      message: error.message
    });
  }
});

// POST create new transaction
router.post('/', async (req, res) => {
  try {
    const { booking_id, type, amount, status, transaction_date } = req.body;
    
    // Validation
    if (!type || !amount || !status || !transaction_date) {
      return res.status(400).json({
        success: false,
        error: 'type, amount, status, and transaction_date are required'
      });
    }
    
    // Validate type
    const validTypes = ['Booking', 'Coaching', 'Refund'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        error: `Type must be one of: ${validTypes.join(', ')}`
      });
    }
    
    // Validate status
    const validStatuses = ['Success', 'Failed', 'Pending', 'Refunded', 'Dispute'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Status must be one of: ${validStatuses.join(', ')}`
      });
    }
    
    // Check if booking exists if booking_id is provided
    if (booking_id) {
      const bookingCheck = await query('SELECT * FROM bookings WHERE booking_id = $1', [booking_id]);
      if (bookingCheck.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Booking not found'
        });
      }
    }
    
    const result = await query(
      `INSERT INTO transactions (booking_id, type, amount, status, transaction_date) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [booking_id || null, type, amount, status, transaction_date]
    );
    
    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create transaction',
      message: error.message
    });
  }
});

// PUT update transaction
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { booking_id, type, amount, status, transaction_date } = req.body;
    
    // Check if transaction exists
    const checkResult = await query('SELECT * FROM transactions WHERE transaction_id = $1', [id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found'
      });
    }
    
    // Validate type if provided
    if (type) {
      const validTypes = ['Booking', 'Coaching', 'Refund'];
      if (!validTypes.includes(type)) {
        return res.status(400).json({
          success: false,
          error: `Type must be one of: ${validTypes.join(', ')}`
        });
      }
    }
    
    // Validate status if provided
    if (status) {
      const validStatuses = ['Success', 'Failed', 'Pending', 'Refunded', 'Dispute'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          error: `Status must be one of: ${validStatuses.join(', ')}`
        });
      }
    }
    
    const result = await query(
      `UPDATE transactions 
       SET booking_id = COALESCE($1, booking_id),
           type = COALESCE($2, type),
           amount = COALESCE($3, amount),
           status = COALESCE($4, status),
           transaction_date = COALESCE($5, transaction_date)
       WHERE transaction_id = $6 
       RETURNING *`,
      [booking_id, type, amount, status, transaction_date, id]
    );
    
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating transaction:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update transaction',
      message: error.message
    });
  }
});

// DELETE transaction
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await query('DELETE FROM transactions WHERE transaction_id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Transaction deleted successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete transaction',
      message: error.message
    });
  }
});

module.exports = router;


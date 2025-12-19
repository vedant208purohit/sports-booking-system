const express = require('express');
const router = express.Router();
const { query } = require('../db/connection');

// GET all bookings with related data
router.get('/', async (req, res) => {
  try {
    const { venue_id, member_id, status, start_date, end_date } = req.query;
    
    let sql = `
      SELECT 
        b.*,
        v.name as venue_name,
        v.location as venue_location,
        s.name as sport_name,
        m.name as member_name
      FROM bookings b
      JOIN venues v ON b.venue_id = v.venue_id
      JOIN sports s ON b.sport_id = s.sport_id
      JOIN members m ON b.member_id = m.member_id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;
    
    if (venue_id) {
      sql += ` AND b.venue_id = $${paramCount++}`;
      params.push(venue_id);
    }
    
    if (member_id) {
      sql += ` AND b.member_id = $${paramCount++}`;
      params.push(member_id);
    }
    
    if (status) {
      sql += ` AND b.status = $${paramCount++}`;
      params.push(status);
    }
    
    if (start_date) {
      sql += ` AND b.booking_date >= $${paramCount++}`;
      params.push(start_date);
    }
    
    if (end_date) {
      sql += ` AND b.booking_date <= $${paramCount++}`;
      params.push(end_date);
    }
    
    sql += ' ORDER BY b.booking_date DESC';
    
    const result = await query(sql, params);
    
    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch bookings',
      message: error.message
    });
  }
});

// GET booking by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query(`
      SELECT 
        b.*,
        v.name as venue_name,
        v.location as venue_location,
        s.name as sport_name,
        m.name as member_name,
        m.status as member_status
      FROM bookings b
      JOIN venues v ON b.venue_id = v.venue_id
      JOIN sports s ON b.sport_id = s.sport_id
      JOIN members m ON b.member_id = m.member_id
      WHERE b.booking_id = $1
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }
    
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch booking',
      message: error.message
    });
  }
});

// POST create new booking
router.post('/', async (req, res) => {
  try {
    const { venue_id, sport_id, member_id, booking_date, amount, coupon_code, status } = req.body;
    
    // Validation
    if (!venue_id || !sport_id || !member_id || !booking_date || !amount) {
      return res.status(400).json({
        success: false,
        error: 'venue_id, sport_id, member_id, booking_date, and amount are required'
      });
    }
    
    // Validate status if provided
    const validStatuses = ['Confirmed', 'Completed', 'Cancelled', 'Pending'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Status must be one of: ${validStatuses.join(', ')}`
      });
    }
    
    // Check if venue exists
    const venueCheck = await query('SELECT * FROM venues WHERE venue_id = $1', [venue_id]);
    if (venueCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Venue not found'
      });
    }
    
    // Check if sport exists
    const sportCheck = await query('SELECT * FROM sports WHERE sport_id = $1', [sport_id]);
    if (sportCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Sport not found'
      });
    }
    
    // Check if member exists
    const memberCheck = await query('SELECT * FROM members WHERE member_id = $1', [member_id]);
    if (memberCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Member not found'
      });
    }
    
    const finalStatus = status || 'Pending';
    
    const result = await query(
      `INSERT INTO bookings (venue_id, sport_id, member_id, booking_date, amount, coupon_code, status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [venue_id, sport_id, member_id, booking_date, amount, coupon_code || null, finalStatus]
    );
    
    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create booking',
      message: error.message
    });
  }
});

// PUT update booking
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { venue_id, sport_id, member_id, booking_date, amount, coupon_code, status } = req.body;
    
    // Check if booking exists
    const checkResult = await query('SELECT * FROM bookings WHERE booking_id = $1', [id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }
    
    // Validate status if provided
    if (status) {
      const validStatuses = ['Confirmed', 'Completed', 'Cancelled', 'Pending'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          error: `Status must be one of: ${validStatuses.join(', ')}`
        });
      }
    }
    
    const result = await query(
      `UPDATE bookings 
       SET venue_id = COALESCE($1, venue_id),
           sport_id = COALESCE($2, sport_id),
           member_id = COALESCE($3, member_id),
           booking_date = COALESCE($4, booking_date),
           amount = COALESCE($5, amount),
           coupon_code = COALESCE($6, coupon_code),
           status = COALESCE($7, status)
       WHERE booking_id = $8 
       RETURNING *`,
      [venue_id, sport_id, member_id, booking_date, amount, coupon_code, status, id]
    );
    
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating booking:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update booking',
      message: error.message
    });
  }
});

// DELETE booking
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await query('DELETE FROM bookings WHERE booking_id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Booking deleted successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error deleting booking:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete booking',
      message: error.message
    });
  }
});

module.exports = router;


-- Seed data for Sports Booking Database

-- Insert Venues (using DO block to handle ID conflicts)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM venues WHERE venue_id = 1) THEN
        INSERT INTO venues (venue_id, name, location) VALUES (1, 'Grand Slam Arena', 'North Hills');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM venues WHERE venue_id = 2) THEN
        INSERT INTO venues (venue_id, name, location) VALUES (2, 'City Kickers Turf', 'Downtown');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM venues WHERE venue_id = 3) THEN
        INSERT INTO venues (venue_id, name, location) VALUES (3, 'AquaBlue Pool Center', 'Westside');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM venues WHERE venue_id = 4) THEN
        INSERT INTO venues (venue_id, name, location) VALUES (4, 'Smash Point Badminton', 'East District');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM venues WHERE venue_id = 5) THEN
        INSERT INTO venues (venue_id, name, location) VALUES (5, 'Legends Cricket Ground', 'Suburbs');
    END IF;
END $$;

-- Insert Sports
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM sports WHERE sport_id = 1) THEN
        INSERT INTO sports (sport_id, name) VALUES (1, 'Tennis');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM sports WHERE sport_id = 2) THEN
        INSERT INTO sports (sport_id, name) VALUES (2, 'Football');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM sports WHERE sport_id = 3) THEN
        INSERT INTO sports (sport_id, name) VALUES (3, 'Swimming');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM sports WHERE sport_id = 4) THEN
        INSERT INTO sports (sport_id, name) VALUES (4, 'Badminton');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM sports WHERE sport_id = 5) THEN
        INSERT INTO sports (sport_id, name) VALUES (5, 'Cricket');
    END IF;
END $$;

-- Insert Members
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM members WHERE member_id = 1) THEN
        INSERT INTO members (member_id, name, status, is_trial_user, converted_from_trial, join_date) VALUES (1, 'Rahul Sharma', 'Active', false, false, '2025-10-15');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM members WHERE member_id = 2) THEN
        INSERT INTO members (member_id, name, status, is_trial_user, converted_from_trial, join_date) VALUES (2, 'Priya Singh', 'Active', true, true, '2025-11-01');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM members WHERE member_id = 3) THEN
        INSERT INTO members (member_id, name, status, is_trial_user, converted_from_trial, join_date) VALUES (3, 'Amit Patel', 'Inactive', false, false, '2025-09-10');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM members WHERE member_id = 4) THEN
        INSERT INTO members (member_id, name, status, is_trial_user, converted_from_trial, join_date) VALUES (4, 'Sneha Gupta', 'Active', false, true, '2025-11-20');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM members WHERE member_id = 5) THEN
        INSERT INTO members (member_id, name, status, is_trial_user, converted_from_trial, join_date) VALUES (5, 'Vikram Malhotra', 'Active', true, false, '2025-12-10');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM members WHERE member_id = 6) THEN
        INSERT INTO members (member_id, name, status, is_trial_user, converted_from_trial, join_date) VALUES (6, 'Anjali Desai', 'Inactive', true, false, '2025-11-05');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM members WHERE member_id = 7) THEN
        INSERT INTO members (member_id, name, status, is_trial_user, converted_from_trial, join_date) VALUES (7, 'John Doe', 'Active', false, false, '2025-08-15');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM members WHERE member_id = 8) THEN
        INSERT INTO members (member_id, name, status, is_trial_user, converted_from_trial, join_date) VALUES (8, 'Sarah Lee', 'Active', true, true, '2025-12-01');
    END IF;
END $$;

-- Insert Bookings
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM bookings WHERE booking_id = 1) THEN
        INSERT INTO bookings (booking_id, venue_id, sport_id, member_id, booking_date, amount, coupon_code, status) VALUES (1, 1, 1, 1, '2025-12-12 10:00:00', 500.00, NULL, 'Completed');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM bookings WHERE booking_id = 2) THEN
        INSERT INTO bookings (booking_id, venue_id, sport_id, member_id, booking_date, amount, coupon_code, status) VALUES (2, 2, 2, 2, '2025-12-13 14:00:00', 1200.00, NULL, 'Confirmed');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM bookings WHERE booking_id = 3) THEN
        INSERT INTO bookings (booking_id, venue_id, sport_id, member_id, booking_date, amount, coupon_code, status) VALUES (3, 3, 3, 7, '2025-12-13 07:00:00', 300.00, 'EARLYBIRD', 'Confirmed');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM bookings WHERE booking_id = 4) THEN
        INSERT INTO bookings (booking_id, venue_id, sport_id, member_id, booking_date, amount, coupon_code, status) VALUES (4, 4, 4, 4, '2025-12-13 18:00:00', 400.00, 'WELCOME50', 'Confirmed');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM bookings WHERE booking_id = 5) THEN
        INSERT INTO bookings (booking_id, venue_id, sport_id, member_id, booking_date, amount, coupon_code, status) VALUES (5, 5, 5, 5, '2025-12-14 09:00:00', 1500.00, NULL, 'Confirmed');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM bookings WHERE booking_id = 6) THEN
        INSERT INTO bookings (booking_id, venue_id, sport_id, member_id, booking_date, amount, coupon_code, status) VALUES (6, 1, 1, 1, '2025-12-13 10:00:00', 500.00, 'SAVE10', 'Confirmed');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM bookings WHERE booking_id = 7) THEN
        INSERT INTO bookings (booking_id, venue_id, sport_id, member_id, booking_date, amount, coupon_code, status) VALUES (7, 2, 2, 8, '2025-12-15 16:00:00', 600.00, NULL, 'Confirmed');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM bookings WHERE booking_id = 8) THEN
        INSERT INTO bookings (booking_id, venue_id, sport_id, member_id, booking_date, amount, coupon_code, status) VALUES (8, 3, 3, 3, '2025-12-10 15:00:00', 300.00, NULL, 'Cancelled');
    END IF;
END $$;

-- Insert Transactions
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM transactions WHERE transaction_id = 101) THEN
        INSERT INTO transactions (transaction_id, booking_id, type, amount, status, transaction_date) VALUES (101, 1, 'Booking', 500.00, 'Success', '2025-12-12');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM transactions WHERE transaction_id = 102) THEN
        INSERT INTO transactions (transaction_id, booking_id, type, amount, status, transaction_date) VALUES (102, 2, 'Coaching', 1200.00, 'Success', '2025-12-13');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM transactions WHERE transaction_id = 103) THEN
        INSERT INTO transactions (transaction_id, booking_id, type, amount, status, transaction_date) VALUES (103, 3, 'Booking', 270.00, 'Success', '2025-12-13');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM transactions WHERE transaction_id = 104) THEN
        INSERT INTO transactions (transaction_id, booking_id, type, amount, status, transaction_date) VALUES (104, 4, 'Booking', 200.00, 'Success', '2025-12-13');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM transactions WHERE transaction_id = 105) THEN
        INSERT INTO transactions (transaction_id, booking_id, type, amount, status, transaction_date) VALUES (105, 5, 'Booking', 1500.00, 'Success', '2025-12-14');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM transactions WHERE transaction_id = 106) THEN
        INSERT INTO transactions (transaction_id, booking_id, type, amount, status, transaction_date) VALUES (106, 6, 'Booking', 450.00, 'Success', '2025-12-13');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM transactions WHERE transaction_id = 107) THEN
        INSERT INTO transactions (transaction_id, booking_id, type, amount, status, transaction_date) VALUES (107, 7, 'Coaching', 600.00, 'Dispute', '2025-12-15');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM transactions WHERE transaction_id = 108) THEN
        INSERT INTO transactions (transaction_id, booking_id, type, amount, status, transaction_date) VALUES (108, 8, 'Booking', 300.00, 'Refunded', '2025-12-10');
    END IF;
END $$;


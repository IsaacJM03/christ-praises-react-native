const db = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const authController = {
  // Register new user
  async register(req, res) {
    try {
      const { name, email, password } = req.body;

      // Validation
      if (!name || !email || !password) {
        return res.status(400).json({ 
          success: false, 
          message: 'Name, email, and password are required' 
        });
      }

      if (password.length < 6) {
        return res.status(400).json({ 
          success: false, 
          message: 'Password must be at least 6 characters' 
        });
      }

      // Check if user exists
      const [existingUsers] = await db.execute(
        'SELECT id FROM users WHERE email = ?',
        [email.toLowerCase()]
      );

      if (existingUsers.length > 0) {
        return res.status(400).json({ 
          success: false, 
          message: 'Email already registered' 
        });
      }

      // Hash password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create user
      const [result] = await db.execute(
        'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
        [name.trim(), email.toLowerCase().trim(), hashedPassword]
      );

      const userId = result.insertId;

      // Generate JWT token
      const token = jwt.sign(
        { 
          id: userId, 
          email: email.toLowerCase(),
          name: name.trim()
        },
        process.env.JWT_SECRET,
        { expiresIn: '7d' } // Token expires in 7 days
      );

      // Get user data (without password)
      const [users] = await db.execute(
        'SELECT id, name, email, image, created_at FROM users WHERE id = ?',
        [userId]
      );

      res.status(201).json({
        success: true,
        message: 'Account created successfully',
        data: {
          user: users[0],
          token
        }
      });
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({ success: false, message: 'Registration failed' });
    }
  },

  // Login user
  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Validation
      if (!email || !password) {
        return res.status(400).json({ 
          success: false, 
          message: 'Email and password are required' 
        });
      }

      // Find user
      const [users] = await db.execute(
        'SELECT * FROM users WHERE email = ?',
        [email.toLowerCase()]
      );

      if (users.length === 0) {
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid email or password' 
        });
      }

      const user = users[0];

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);

      if (!isValidPassword) {
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid email or password' 
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { 
          id: user.id, 
          email: user.email,
          name: user.name
        },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: userWithoutPassword,
          token
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ success: false, message: 'Login failed' });
    }
  },

  // Get current user
  async me(req, res) {
    try {
      const [users] = await db.execute(
        'SELECT id, name, email, image, bio, created_at FROM users WHERE id = ?',
        [req.user.id]
      );

      if (users.length === 0) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      res.json({ success: true, data: users[0] });
    } catch (error) {
      console.error('Get me error:', error);
      res.status(500).json({ success: false, message: 'Failed to get user' });
    }
  }
};

module.exports = authController;

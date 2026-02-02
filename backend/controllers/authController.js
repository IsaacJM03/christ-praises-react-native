const db = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const authController = {
  // Register
  async register(req, res) {
    try {
      const { name, email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email and password are required' });
      }

      // Check if user exists
      const [existing] = await db.execute(
        'SELECT id FROM users WHERE email = ?',
        [email]
      );

      if (existing.length > 0) {
        return res.status(400).json({ success: false, message: 'Email already registered' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const [result] = await db.execute(
        'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
        [name || email.split('@')[0], email, hashedPassword]
      );

      // Generate token
      const token = jwt.sign(
        { id: result.insertId, email },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '30d' }
      );

      res.status(201).json({
        success: true,
        data: {
          token,
          user: {
            id: result.insertId,
            name: name || email.split('@')[0],
            email,
            image: null
          }
        }
      });
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({ success: false, message: 'Registration failed' });
    }
  },

  // Login
  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email and password are required' });
      }

      // Find user
      const [users] = await db.execute(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );

      if (users.length === 0) {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
      }

      const user = users[0];

      // Check password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
      }

      // Generate token
      const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '30d' }
      );

      res.json({
        success: true,
        data: {
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
            bio: user.bio
          }
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ success: false, message: 'Login failed' });
    }
  },

  // Get current user
  async getCurrentUser(req, res) {
    try {
      const [users] = await db.execute(
        'SELECT id, name, email, bio, image, created_at FROM users WHERE id = ?',
        [req.user.id]
      );

      if (users.length === 0) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      res.json({ success: true, data: users[0] });
    } catch (error) {
      console.error('Get current user error:', error);
      res.status(500).json({ success: false, message: 'Failed to get user' });
    }
  },

  // Update profile
  async updateProfile(req, res) {
    try {
      const user_id = req.user.id;
      const { name, bio, image } = req.body;

      console.log('Updating profile for user:', user_id, { name, bio, image: image ? 'provided' : 'not provided' });

      const updates = [];
      const values = [];

      if (name !== undefined) {
        updates.push('name = ?');
        values.push(name);
      }
      if (bio !== undefined) {
        updates.push('bio = ?');
        values.push(bio);
      }
      if (image !== undefined) {
        updates.push('image = ?');
        values.push(image);
      }

      if (updates.length === 0) {
        return res.status(400).json({ success: false, message: 'No fields to update' });
      }

      values.push(user_id);

      await db.execute(
        `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
        values
      );

      // Fetch updated user
      const [users] = await db.execute(
        'SELECT id, name, email, bio, image, created_at FROM users WHERE id = ?',
        [user_id]
      );

      if (users.length === 0) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      console.log('Profile updated successfully:', users[0]);
      res.json({ success: true, data: users[0] });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ success: false, message: 'Failed to update profile' });
    }
  },
};

module.exports = authController;

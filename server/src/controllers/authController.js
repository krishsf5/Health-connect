const jwt = require('jsonwebtoken');
const User = require('../models/User');

function signToken(user) {
  return jwt.sign({ id: user._id, role: user.role, name: user.name }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'Missing fields' });
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: 'Email already in use' });
    const user = await User.create({ name, email, password, role: 'patient' });
    const token = signToken(user);
    res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Separate doctor registration with specialization
exports.registerDoctor = async (req, res) => {
  console.log('🏥 ========== DOCTOR REGISTRATION ENDPOINT CALLED ==========');
  console.log('📋 Request body:', req.body);
  
  try {
    const { name, email, password, specialization } = req.body;
    console.log('📝 Extracted data:', { name, email, specialization });
    
    if (!name || !email || !password || !specialization) {
      console.log('❌ Missing fields');
      return res.status(400).json({ message: 'Missing fields' });
    }
    
    const existing = await User.findOne({ email });
    if (existing) {
      console.log('❌ Email already exists:', email);
      return res.status(409).json({ message: 'Email already in use' });
    }
    
    console.log('✅ Creating doctor user with role: "doctor"');
    const user = await User.create({ name, email, password, role: 'doctor', specialization });
    
    console.log('✅ Doctor user created successfully!');
    console.log('👤 User ID:', user._id);
    console.log('👤 User Name:', user.name);
    console.log('👤 User Email:', user.email);
    console.log('👤 User Role:', user.role, '← SHOULD BE "doctor"');
    console.log('🩺 Specialization:', user.specialization);
    
    const token = signToken(user);
    const responseData = { 
      token, 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role, 
        specialization: user.specialization 
      } 
    };
    
    console.log('📦 Sending response:', responseData.user);
    console.log('🏥 ========== DOCTOR REGISTRATION COMPLETE ==========');
    
    res.status(201).json(responseData);
  } catch (err) {
    console.error('❌ DOCTOR REGISTRATION ERROR:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    const ok = await user.matchPassword(password);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
    const token = signToken(user);
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role, specialization: user.specialization } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.me = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

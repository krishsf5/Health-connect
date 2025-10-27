const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['patient', 'doctor'], default: 'patient' },
    specialization: { type: String }
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  console.log('💾 User pre-save hook called');
  console.log('  ├─ Name:', this.name);
  console.log('  ├─ Email:', this.email);
  console.log('  ├─ Role:', this.role, '← Role being saved');
  console.log('  └─ Specialization:', this.specialization);
  
  if (!this.isModified('password')) {
    console.log('  Password not modified, skipping hash');
    return next();
  }
  
  console.log('  Hashing password...');
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  console.log('  Password hashed successfully');
  next();
});

userSchema.methods.matchPassword = async function (entered) {
  return bcrypt.compare(entered, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;

# 🚨 CRITICAL: Doctor Role Assignment Debug

## ⚠️ **The Problem**
You're registering as a doctor but the role is being set to "patient" instead.

## 🔍 **I've Added Complete Logging**

### **Where to Look:**

1. **Backend Terminal** (where `npm run dev` is running)
2. **Browser Console** (F12)

---

## 🧪 **EXACT STEPS TO TEST:**

### **Step 1: Clear Old Data**

**In Browser Console (F12):**
```javascript
localStorage.clear();
location.reload();
```

**In MongoDB (delete old Abdul):**
```javascript
// If using MongoDB Compass:
// 1. Connect to database
// 2. Go to healthconnect → users
// 3. Delete all test users

// OR using mongosh:
mongosh "mongodb://localhost:27017/healthconnect"
db.users.deleteMany({ email: { $regex: /test|abdul/i } })
```

### **Step 2: Restart Backend Server**

**IMPORTANT:** Restart to load the new logging code!

```bash
# In your terminal, press Ctrl+C to stop server
# Then start again:
cd server
npm run dev
```

You should see:
```
MongoDB connected
Server listening on 5000
```

### **Step 3: Register a Doctor**

1. Go to `http://localhost:5173/doctor-create`
2. **Open TWO windows side by side:**
   - **Browser Console** (F12 in browser)
   - **Terminal** (where backend is running)
3. Fill the form:
   - Name: TestDoctor
   - Email: testdoc@example.com
   - Password: test123
   - Specialization: Cardiology
4. Click "Create Doctor Account"
5. **WATCH BOTH LOGS SIMULTANEOUSLY**

---

## 📊 **What You Should See:**

### **In BROWSER Console:**

```javascript
🏥 Creating doctor account...
📍 API URL: http://localhost:5000/api
📋 Request payload: { name: "TestDoctor", email: "testdoc@example.com", specialization: "Cardiology" }
📡 Response status: 201
📦 Response data: { token: "...", user: { ... } }
✅ Doctor registered successfully!
👤 User role: doctor  ← SHOULD SAY "doctor"
🩺 Specialization: Cardiology

// FROM App.jsx:
🔄 setUser called with: { ... }
  ├─ Name: TestDoctor
  ├─ Email: testdoc@example.com
  ├─ Role: doctor  ← SHOULD SAY "doctor"
  └─ Specialization: Cardiology

🚦 Route check: { pathname: "/doctor", userRole: "doctor", userName: "TestDoctor" }
✅ User logged in: doctor
🔀 Redirecting to: /doctor
```

### **In BACKEND Terminal:**

```javascript
🏥 ========== DOCTOR REGISTRATION ENDPOINT CALLED ==========
📋 Request body: { name: 'TestDoctor', email: 'testdoc@example.com', password: '...', specialization: 'Cardiology' }
📝 Extracted data: { name: 'TestDoctor', email: 'testdoc@example.com', specialization: 'Cardiology' }
✅ Creating doctor user with role: "doctor"

💾 User pre-save hook called
  ├─ Name: TestDoctor
  ├─ Email: testdoc@example.com
  ├─ Role: doctor  ← CRITICAL: SHOULD SAY "doctor" NOT "patient"
  └─ Specialization: Cardiology
  Hashing password...
  Password hashed successfully

✅ Doctor user created successfully!
👤 User ID: 64abc123...
👤 User Name: TestDoctor
👤 User Email: testdoc@example.com
👤 User Role: doctor ← SHOULD BE "doctor"
🩺 Specialization: Cardiology
📦 Sending response: { id: '...', name: 'TestDoctor', email: 'testdoc@example.com', role: 'doctor', specialization: 'Cardiology' }
🏥 ========== DOCTOR REGISTRATION COMPLETE ==========
```

---

## 🚨 **IF YOU SEE THIS - IT'S THE PROBLEM:**

### **Backend Terminal Shows:**

```javascript
💾 User pre-save hook called
  ├─ Role: patient  ← ❌ WRONG! Should be "doctor"
```

**This means:** The role is NOT being passed to `User.create()` correctly.

### **Possible Causes:**

1. **Wrong endpoint called:**
   ```javascript
   // Browser console should show:
   📍 API URL: http://localhost:5000/api/auth/register-doctor
   // NOT:
   📍 API URL: http://localhost:5000/api/auth/register  ← WRONG!
   ```

2. **Request body missing role:**
   ```javascript
   // Backend should show:
   📋 Request body: { ..., specialization: 'Cardiology' }
   // If specialization is missing → wrong endpoint!
   ```

3. **User.create not receiving role parameter**

---

## 🔧 **Debugging Checklist:**

### ✅ **Check 1: Correct API URL**

**Browser Console:**
```javascript
📍 API URL: http://localhost:5000/api
```

Should be calling: `POST /api/auth/register-doctor`

### ✅ **Check 2: Backend Receives Request**

**Backend Terminal:**
```javascript
🏥 ========== DOCTOR REGISTRATION ENDPOINT CALLED ==========
```

If you **DON'T** see this, the endpoint is NOT being called!

### ✅ **Check 3: Specialization in Request**

**Backend Terminal:**
```javascript
📋 Request body: { ..., specialization: 'Cardiology' }
```

If specialization is missing → wrong endpoint!

### ✅ **Check 4: Role in pre-save Hook**

**Backend Terminal:**
```javascript
💾 User pre-save hook called
  ├─ Role: doctor  ← MUST BE "doctor"
```

If it says "patient" → `User.create()` didn't receive role parameter

### ✅ **Check 5: Response Role**

**Backend Terminal:**
```javascript
📦 Sending response: { ..., role: 'doctor' }
```

**Browser Console:**
```javascript
👤 User role: doctor
```

Both must say "doctor"!

---

## 🎯 **Quick Test:**

After registration, run this in **Browser Console:**

```javascript
console.table({
  'Token': !!localStorage.getItem('token'),
  'User': JSON.parse(localStorage.getItem('user') || 'null')?.name,
  'Role': JSON.parse(localStorage.getItem('user') || 'null')?.role,
  'Specialization': JSON.parse(localStorage.getItem('user') || 'null')?.specialization,
  'Current URL': window.location.pathname
});
```

**Expected Output:**
```
Token: true
User: TestDoctor
Role: doctor  ← MUST BE "doctor"
Specialization: Cardiology
Current URL: /doctor
```

---

## 🐛 **If Role is Still "patient":**

### **Scenario A: Backend Never Called**

**Symptoms:**
- No logs in backend terminal
- No "🏥 DOCTOR REGISTRATION ENDPOINT CALLED" message

**Solution:**
- Check frontend API URL
- Check if backend server is running
- Check port 5000 is not blocked

### **Scenario B: Wrong Endpoint Called**

**Symptoms:**
- Backend shows: `POST /api/auth/register` (not `register-doctor`)
- No specialization in request body

**Solution:**
- Check `DoctorCreate.jsx` - should call `/auth/register-doctor`
- Clear browser cache
- Hard refresh (Ctrl+Shift+R)

### **Scenario C: Role Not Passed to User.create()**

**Symptoms:**
- Backend called correctly
- Request body has specialization
- But pre-save hook shows `role: patient`

**Solution:**
This is a code bug in `authController.js`. Check line 44:
```javascript
const user = await User.create({ 
  name, 
  email, 
  password, 
  role: 'doctor',  // ← Must be here!
  specialization 
});
```

### **Scenario D: Model Default Overriding**

**Symptoms:**
- Everything looks correct but role is still "patient"

**Solution:**
- Check `User.js` model
- Remove default value:
```javascript
// Change from:
role: { type: String, enum: ['patient', 'doctor'], default: 'patient' }

// To:
role: { type: String, enum: ['patient', 'doctor'], required: true }
```

---

## 🎬 **Action Plan:**

1. **Restart backend server** (to load new logging code)
2. **Clear browser localStorage**
3. **Delete old test users from database**
4. **Open browser console AND backend terminal side by side**
5. **Register a doctor**
6. **Compare logs with examples above**
7. **Take screenshots of BOTH logs**
8. **Share here if still not working**

---

## 📸 **What to Screenshot if Still Broken:**

1. **Browser Console** - All logs from registration
2. **Backend Terminal** - All logs from registration
3. **MongoDB** - The created user document
4. **Network Tab** - The `/register-doctor` request and response

---

## ✅ **Success Criteria:**

- [ ] Backend log shows: `🏥 DOCTOR REGISTRATION ENDPOINT CALLED`
- [ ] Backend log shows: `Role: doctor ← SHOULD BE "doctor"`
- [ ] Backend log shows: `👤 User Role: doctor`
- [ ] Browser log shows: `👤 User role: doctor`
- [ ] Browser log shows: `🔀 Redirecting to: /doctor`
- [ ] URL is: `http://localhost:5173/doctor`
- [ ] Dashboard shows: "Doctor Dashboard" (not "Patient Dashboard")
- [ ] Sidebar shows: "Role: doctor"

---

**The logs will show EXACTLY where the role is being lost!** 🔍

**Try it now and tell me what you see in BOTH the browser console AND backend terminal!** 🚀

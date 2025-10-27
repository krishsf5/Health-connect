# 🔍 Role-Based Authentication - Complete Debug Guide

## 🎯 **Understanding the Flow:**

### **How it SHOULD work:**

```
1. Register as Doctor at /doctor-create
   ↓
2. Backend creates user with role: "doctor"
   ↓
3. Frontend receives: { token, user: { role: "doctor", ... } }
   ↓
4. Save to localStorage
   ↓
5. Call onLogin(user) → setUser in App.jsx
   ↓
6. App.jsx detects role: "doctor"
   ↓
7. Navigate to /doctor dashboard
   ↓
8. Show DOCTOR dashboard (not patient!)
```

### **Same for Patient:**

```
1. Register at /login (as patient)
   ↓
2. Backend creates user with role: "patient"
   ↓
3. Frontend receives: { token, user: { role: "patient", ... } }
   ↓
4-8. Same flow but navigates to /patient dashboard
```

---

## 🧪 **Step-by-Step Testing:**

### **Test 1: Doctor Registration**

1. **Open browser console** (F12) before starting
2. **Clear everything:**
   ```javascript
   localStorage.clear();
   location.reload();
   ```
3. Go to `http://localhost:5173/doctor-create`
4. Fill the form:
   - Name: TestDoctor
   - Email: doc@test.com
   - Password: test123
   - Specialization: Cardiology
5. **Click "Create Doctor Account"**

### **What to Look For in Console:**

```javascript
// FROM DoctorCreate.jsx:
🏥 Creating doctor account...
📍 API URL: http://localhost:5000/api
📋 Request payload: { name: "TestDoctor", email: "doc@test.com", specialization: "Cardiology" }
📡 Response status: 201
📦 Response data: { token: "...", user: { ... } }
✅ Doctor registered successfully!
👤 User role: doctor  ← MUST SAY "doctor"!
🩺 Specialization: Cardiology

// FROM App.jsx:
🔄 setUser called with: { ... }
  ├─ Name: TestDoctor
  ├─ Email: doc@test.com
  ├─ Role: doctor  ← MUST SAY "doctor"!
  └─ Specialization: Cardiology

🚦 Route check: { pathname: "/doctor", userRole: "doctor", userName: "TestDoctor" }
✅ User logged in: doctor
📍 Valid routes for doctor: ["/doctor", "/doctor/appointments", ...]
🔍 Current path: /doctor
✓ Path is valid for user role
```

### **Test 2: Patient Registration**

1. **Logout** (click logout button)
2. **Clear localStorage:**
   ```javascript
   localStorage.clear();
   ```
3. Go to `http://localhost:5173/login`
4. Switch to **"Create Account"** mode
5. Fill the form:
   - Name: TestPatient
   - Email: patient@test.com
   - Password: test123
6. **Click "Create Account"**

### **What to Look For in Console:**

```javascript
// FROM App.jsx:
🔄 setUser called with: { ... }
  ├─ Name: TestPatient
  ├─ Email: patient@test.com
  ├─ Role: patient  ← MUST SAY "patient"!
  └─ Specialization: undefined

🚦 Route check: { pathname: "/patient", userRole: "patient", userName: "TestPatient" }
✅ User logged in: patient
📍 Valid routes for patient: ["/patient", "/patient/appointments", ...]
🔍 Current path: /patient
✓ Path is valid for user role
```

---

## 🐛 **Common Issues & Solutions:**

### **Issue 1: Role shows "patient" when should be "doctor"**

**Check in console:**
```javascript
👤 User role: patient  ← WRONG! Should be "doctor"
```

**Possible causes:**
1. **Wrong API endpoint** - Check:
   ```javascript
   📍 API URL: http://localhost:5000  ← WRONG! Missing /api
   📍 API URL: http://localhost:5000/api  ← CORRECT!
   ```

2. **Backend not returning correct role** - Check backend response:
   ```javascript
   📦 Response data: { user: { role: "patient" } }  ← Backend issue!
   ```
   **Fix:** Check backend `authController.js` - `registerDoctor` function

3. **Old user in database** - Doctor email already exists as patient
   **Fix:** Delete old user from MongoDB

### **Issue 2: Redirected to wrong dashboard**

**Check in console:**
```javascript
🚦 Route check: { pathname: "/patient", userRole: "doctor" }
🔀 Redirecting to: /doctor
```

This is CORRECT behavior - App.jsx is fixing the wrong path.

**If you see:**
```javascript
✅ User logged in: doctor
🔀 Redirecting to: /patient  ← WRONG!
```

This means role detection in App.jsx is broken.

### **Issue 3: Gets logged out immediately after registration**

**Check in console:**
```javascript
❌ No user logged in
🔀 Redirecting to login
```

**Possible causes:**
1. `onLogin` callback not called
2. `setUser` not called
3. localStorage not saved

**Check:**
```javascript
// Should see this:
localStorage.setItem("token", "...")
localStorage.setItem("user", "...")
🔄 setUser called with: { ... }
```

---

## 🔬 **Manual Verification:**

### **Check localStorage:**

```javascript
// In browser console:
console.log('Token:', localStorage.getItem('token'));
console.log('User:', JSON.parse(localStorage.getItem('user')));

// Should show:
// Token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
// User: { id: "...", name: "TestDoctor", role: "doctor", ... }
```

### **Check User State in App:**

```javascript
// The sidebar should show:
// - Name: TestDoctor (or TestPatient)
// - Role: doctor (or patient)  ← Check this!
```

### **Check Backend Response:**

```javascript
// Run in terminal:
curl -X POST http://localhost:5000/api/auth/register-doctor \
  -H "Content-Type: application/json" \
  -d '{"name":"TestDoctor","email":"doc2@test.com","password":"test123","specialization":"Cardiology"}'

// Should return:
{
  "token": "...",
  "user": {
    "id": "...",
    "name": "TestDoctor",
    "email": "doc2@test.com",
    "role": "doctor",  ← Check this!
    "specialization": "Cardiology"
  }
}
```

---

## 📊 **Decision Tree:**

```
Registration Successful?
│
├─ YES → Check role in response
│         │
│         ├─ role: "doctor" → Should go to /doctor
│         │                   │
│         │                   ├─ Goes to /doctor? ✓ SUCCESS
│         │                   └─ Goes to /patient? ✗ Check App.jsx routing
│         │
│         └─ role: "patient" → Check if this is correct
│                              │
│                              ├─ Registered via /doctor-create? → Backend bug!
│                              └─ Registered via /login? → ✓ CORRECT
│
└─ NO → Check error message in console
```

---

## 🎯 **The Ultimate Test:**

Run this in console after registration:

```javascript
// Check everything at once:
const check = {
  token: !!localStorage.getItem('token'),
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  role: JSON.parse(localStorage.getItem('user') || 'null')?.role,
  currentPath: window.location.pathname
};

console.table(check);

// Expected for doctor:
// token: true
// role: "doctor"
// currentPath: "/doctor"

// Expected for patient:
// token: true
// role: "patient"
// currentPath: "/patient"
```

---

## 🚨 **If Still Not Working:**

### **Nuclear Option - Complete Reset:**

```bash
# 1. Stop all servers
Ctrl+C

# 2. Clear browser data
localStorage.clear();
sessionStorage.clear();

# 3. Delete database user
mongosh "mongodb://localhost:27017/healthconnect"
db.users.deleteMany({})

# 4. Restart servers
# Terminal 1:
cd server
npm run dev

# Terminal 2:
cd client  
npm run dev

# 5. Try registration again with console open
```

---

## 📋 **Checklist:**

Before reporting as "not working", verify:

- [ ] Backend server running on port 5000
- [ ] Frontend running on port 5173
- [ ] MongoDB connected
- [ ] Browser console open (F12)
- [ ] localStorage cleared before test
- [ ] Correct API URL in console logs
- [ ] Backend returns `role: "doctor"` in response
- [ ] `setUser` called with correct role
- [ ] No old user with same email in database

---

## 📞 **What to Share When Asking for Help:**

Copy ALL console logs from registration, including:

```
🏥 Creating doctor account...
📍 API URL: ...
📋 Request payload: ...
📡 Response status: ...
📦 Response data: ...
✅ Doctor registered successfully!
👤 User role: ...
🔄 setUser called with: ...
🚦 Route check: ...
```

Also share:
1. What you expected to happen
2. What actually happened
3. Screenshots of:
   - Browser console
   - Current URL
   - Which dashboard is showing

---

## 🎉 **Success Criteria:**

### **For Doctor:**
✅ Console shows `👤 User role: doctor`
✅ Sidebar shows "Role: doctor"
✅ URL is `/doctor`
✅ See "Doctor Dashboard" title
✅ Can see doctor-specific features

### **For Patient:**
✅ Console shows `👤 User role: patient`
✅ Sidebar shows "Role: patient"
✅ URL is `/patient`
✅ See "Patient Dashboard" title
✅ Can see patient-specific features (book appointments)

---

**With the new console logging, you'll see EXACTLY where the problem is!** 🔍

Every step is logged:
- API call
- Response data
- Role assignment
- User state update
- Navigation decision

**Open console, register a user, and follow the logs!** 🚀

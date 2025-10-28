# Doctor-Patient Reports Access Control

## Overview
Updated the medical reports feature to implement proper role-based access control:
- **Patients**: Can upload, view, and delete their own reports
- **Doctors**: Can only view reports of their patients (read-only access)

## Changes Implemented

### 1. Frontend Changes (Reports.jsx)

#### **For Patients:**
- ✅ Upload button visible
- ✅ Can view all their reports
- ✅ Can delete their own reports
- ✅ Health analytics dashboard visible

#### **For Doctors:**
- ✅ Upload button HIDDEN (doctors cannot upload)
- ✅ Patient selector dropdown to choose which patient's reports to view
- ✅ View-only access to patient reports
- ✅ Download reports allowed
- ✅ Delete button HIDDEN (cannot delete patient reports)
- ✅ Health analytics HIDDEN (not relevant for doctors)

### 2. Backend Changes

#### **New API Endpoint:**
```
GET /api/reports/patient/:patientId
```
- Allows doctors to fetch reports for a specific patient
- **Security**: Verifies doctor has appointments with that patient
- **Access Control**: Only doctors can access this endpoint

#### **Updated Endpoints:**

**GET /api/reports/:id**
- Now allows both patients AND doctors to view specific reports
- Patients: Can view their own reports
- Doctors: Can view reports of their patients (with appointment verification)

**DELETE /api/reports/:id**
- Remains patient-only
- Only the patient who owns the report can delete it

### 3. Security Features

#### **Access Control Matrix:**

| Action | Patient (Owner) | Doctor (Has Appointments) | Other Users |
|--------|----------------|---------------------------|-------------|
| Upload Report | ✅ Yes | ❌ No | ❌ No |
| View Own Reports | ✅ Yes | N/A | ❌ No |
| View Patient Reports | N/A | ✅ Yes | ❌ No |
| Download Reports | ✅ Yes | ✅ Yes | ❌ No |
| Delete Reports | ✅ Yes | ❌ No | ❌ No |

#### **Permission Checks:**
1. **Authentication**: All endpoints require valid JWT token
2. **Ownership**: Patients can only access their own reports
3. **Relationship**: Doctors can only access reports of patients they have appointments with
4. **Role-Based**: Upload and delete actions restricted to patients only

### 4. User Experience

#### **Patient Flow:**
1. Navigate to Reports page
2. See "Upload Report" button
3. View grid of all their uploaded reports
4. Click report to view/download/delete
5. View health analytics based on appointments

#### **Doctor Flow:**
1. Navigate to Reports page
2. See patient selector dropdown (populated from appointments)
3. Select a patient from the list
4. View that patient's uploaded reports
5. Click report to view/download (no delete option)
6. NO health analytics shown (not relevant)

### 5. Files Modified

**Frontend:**
- `client/src/pages/Reports.jsx`
  - Added patient selector for doctors
  - Conditional rendering for upload button
  - Conditional rendering for delete button
  - Conditional rendering for health analytics
  - New function: `fetchDoctorPatients()`
  - New function: `fetchPatientReports(patientId)`

**Backend:**
- `server/src/controllers/reportController.js`
  - New function: `getPatientReports()` - Doctor access to patient reports
  - Updated function: `getReportById()` - Allow doctor access with permission check

- `server/src/routes/reportRoutes.js`
  - New route: `GET /patient/:patientId`

### 6. Implementation Details

#### **How Doctors Get Patient List:**
```javascript
// Doctors see unique patients from their appointments
const appointments = await fetch('/api/appointments/me');
const uniquePatients = extractUniquePatients(appointments);
```

#### **Permission Verification:**
```javascript
// Backend checks if doctor has appointments with patient
const hasAppointment = await Appointment.findOne({
  doctor: doctorId,
  patient: patientId
});

if (!hasAppointment) {
  return 403 Forbidden;
}
```

### 7. Testing Checklist

**As Patient:**
- [ ] Can upload reports
- [ ] Can view all their reports
- [ ] Can download reports
- [ ] Can delete reports
- [ ] Health analytics visible
- [ ] Cannot see other patients' reports

**As Doctor:**
- [ ] Cannot see upload button
- [ ] Can see patient selector
- [ ] Can switch between patients
- [ ] Can view patient reports
- [ ] Can download patient reports
- [ ] Cannot delete patient reports
- [ ] Health analytics NOT visible
- [ ] Can only see patients they have appointments with

### 8. Future Enhancements
- [ ] Report sharing - patients explicitly share specific reports with specific doctors
- [ ] Report categories/tags for better organization
- [ ] Doctor annotations on patient reports
- [ ] Notification when patient uploads new report
- [ ] Report expiry dates
- [ ] Encrypted sensitive reports

## Summary

The reports feature now properly implements role-based access control similar to a messaging system:
- **Patients** have full control over their medical reports
- **Doctors** have read-only access to reports of patients they treat
- **Security** is enforced at both frontend (UI) and backend (API) levels
- **Relationship-based access** ensures doctors can only view reports of their patients

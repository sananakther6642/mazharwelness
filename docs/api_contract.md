# Mazhar Wellness API Contract

## Base URL
```
Production: https://physio-care-15.preview.emergentagent.com/api
Local: http://localhost:8001/api
```

## Authentication
All protected endpoints require either:
- Cookie: `session_token` (httpOnly)
- Header: `Authorization: Bearer <token>`

---

## AUTH ENDPOINTS

### POST /auth/register
Register a new client account.

**Request:**
```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "phone": "+919876543210",
  "password": "securepassword123",
  "role": "client"
}
```

**Response (201):**
```json
{
  "user": {
    "user_id": "user_abc123",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "client"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### POST /auth/login
Login with email/password.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response (200):**
```json
{
  "user": {
    "user_id": "user_abc123",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "client",
    "phone": "+919876543210",
    "picture": null
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### POST /auth/login/otp/send
Send OTP for phone login.

**Request:**
```json
{
  "phone": "+919876543210"
}
```

**Response (200):**
```json
{
  "message": "OTP sent successfully",
  "expires_in": 300
}
```

### POST /auth/login/otp/verify
Verify OTP and login.

**Request:**
```json
{
  "phone": "+919876543210",
  "otp": "123456"
}
```

**Response (200):**
```json
{
  "user": {...},
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### POST /auth/google/session
Exchange Google OAuth session for JWT.

**Request:**
```json
{
  "session_id": "emergent_session_xyz"
}
```

**Response (200):**
```json
{
  "user": {...},
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### GET /auth/me
Get current authenticated user.

**Response (200):**
```json
{
  "user_id": "user_abc123",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "client",
  "phone": "+919876543210",
  "picture": "https://...",
  "is_active": true,
  "created_at": "2025-01-01T00:00:00Z"
}
```

### POST /auth/logout
Logout and clear session.

**Response (200):**
```json
{
  "message": "Logged out successfully"
}
```

---

## GUEST BOOKING ENDPOINTS

### POST /guest/booking
Create guest booking (no auth required).

**Request:**
```json
{
  "full_name": "Jane Doe",
  "phone": "+919876543210",
  "service_category": "paediatric_physio",
  "preferred_date": "2025-01-15",
  "preferred_time": "10:00 AM",
  "message": "My child has developmental delay"
}
```

**Response (201):**
```json
{
  "booking_id": "guest_abc123",
  "message": "Thank you! Your booking request has been received."
}
```

### GET /guest/bookings
List guest bookings (Reception/Admin only).

**Query Params:**
- `status`: pending | contacted | converted | cancelled
- `date_from`: YYYY-MM-DD
- `date_to`: YYYY-MM-DD

**Response (200):**
```json
[
  {
    "booking_id": "guest_abc123",
    "full_name": "Jane Doe",
    "phone": "+919876543210",
    "service_category": "paediatric_physio",
    "preferred_date": "2025-01-15",
    "preferred_time": "10:00 AM",
    "status": "pending",
    "assigned_to": null,
    "notes": null,
    "created_at": "2025-01-10T10:00:00Z"
  }
]
```

### PUT /guest/bookings/{booking_id}/status
Update booking status.

**Request:**
```json
{
  "status": "contacted",
  "notes": "Called and confirmed interest"
}
```

### POST /guest/bookings/{booking_id}/convert
Convert guest to client.

**Request:**
```json
{
  "email": "jane@example.com",
  "password": "temp123",
  "client_type": "parent",
  "child_name": "Tommy Doe",
  "child_age": 5,
  "assign_staff_id": "user_physio1",
  "schedule_appointment": {
    "service_id": "svc_paed_assess",
    "scheduled_date": "2025-01-20",
    "scheduled_time": "10:00 AM"
  }
}
```

**Response (201):**
```json
{
  "user_id": "user_newclient",
  "profile_id": "profile_abc",
  "appointment_id": "apt_xyz",
  "message": "Client created and appointment scheduled"
}
```

---

## SERVICE ENDPOINTS

### GET /services
List active services (public).

**Query Params:**
- `category`: paediatric_physio | weight_management | pcod | zumba_aerobics_yoga | pain_management

**Response (200):**
```json
[
  {
    "service_id": "svc_paed_assess",
    "name": "Paediatric Assessment",
    "description": "Comprehensive developmental assessment",
    "category": "paediatric_physio",
    "duration_minutes": 60,
    "price": 1500,
    "is_active": true
  }
]
```

### POST /services
Create service (Admin only).

**Request:**
```json
{
  "name": "New Service",
  "description": "Service description",
  "category": "paediatric_physio",
  "duration_minutes": 60,
  "price": 1000
}
```

### PUT /services/{service_id}
Update service (Admin only).

### DELETE /services/{service_id}
Soft delete service (Admin only).

---

## APPOINTMENT ENDPOINTS

### POST /appointments
Create appointment.

**Request:**
```json
{
  "client_id": "user_client1",
  "service_id": "svc_paed_assess",
  "staff_id": "user_physio1",
  "scheduled_date": "2025-01-20",
  "scheduled_time": "10:00 AM",
  "duration_minutes": 60,
  "is_online": false,
  "meeting_link": null,
  "notes": "First assessment"
}
```

**Response (201):**
```json
{
  "appointment_id": "apt_abc123",
  "message": "Appointment created"
}
```

### GET /appointments
List appointments (filtered by role).

**Query Params:**
- `client_id`: Filter by client
- `staff_id`: Filter by staff
- `status`: pending | confirmed | completed | cancelled | no_show
- `date`: YYYY-MM-DD
- `date_from`: YYYY-MM-DD
- `date_to`: YYYY-MM-DD

### PUT /appointments/{appointment_id}/status
Update appointment status.

**Request:**
```json
{
  "status": "confirmed"
}
```

### PUT /appointments/{appointment_id}
Update appointment details.

**Request:**
```json
{
  "scheduled_date": "2025-01-21",
  "scheduled_time": "11:00 AM",
  "meeting_link": "https://zoom.us/j/123456",
  "notes": "Rescheduled per client request"
}
```

---

## INVOICE & PAYMENT ENDPOINTS

### POST /invoices
Create invoice (Reception/Admin).

**Request:**
```json
{
  "client_id": "user_client1",
  "items": [
    {
      "description": "Paediatric Assessment",
      "quantity": 1,
      "unit_price": 1500,
      "total": 1500
    },
    {
      "description": "10-Session Package",
      "quantity": 1,
      "unit_price": 7000,
      "total": 7000
    }
  ],
  "notes": "First visit"
}
```

**Response (201):**
```json
{
  "invoice_id": "inv_abc123",
  "subtotal": 8500,
  "tax": 1530,
  "total": 10030
}
```

### GET /invoices
List invoices.

### GET /invoices/{invoice_id}
Get invoice details with PDF link.

### POST /payments/create-order
Create Razorpay order.

**Request:**
```json
{
  "invoice_id": "inv_abc123",
  "amount": 10030,
  "mock_mode": false
}
```

**Response (200):**
```json
{
  "order_id": "order_xyz",
  "amount": 1003000,
  "currency": "INR",
  "key_id": "rzp_test_xxx",
  "mock_mode": false
}
```

### POST /payments/verify
Verify Razorpay payment.

**Request:**
```json
{
  "invoice_id": "inv_abc123",
  "razorpay_order_id": "order_xyz",
  "razorpay_payment_id": "pay_abc",
  "razorpay_signature": "signature_hash"
}
```

**Response (200):**
```json
{
  "payment_id": "pay_internal_123",
  "status": "completed",
  "receipt_url": "/receipts/pay_internal_123.pdf"
}
```

---

## EXERCISE LIBRARY ENDPOINTS

### GET /exercises
List exercises (filtered by role access).

**Query Params:**
- `category`: strength | flexibility | cardio | balance | etc.
- `pcod_safe`: true | false
- `min_age`: number
- `max_age`: number
- `search`: text search

**Response (200):**
```json
[
  {
    "exercise_id": "ex_abc123",
    "name": "Gentle Stretching",
    "description": "Basic stretching routine",
    "category": "flexibility",
    "instructions": ["Step 1...", "Step 2..."],
    "contraindications": ["Acute back pain", "Recent surgery"],
    "pcod_safe": true,
    "min_age": 5,
    "max_age": 99,
    "sets": 3,
    "reps": 10,
    "duration_seconds": null,
    "video_url": "https://...",
    "image_url": "https://...",
    "created_by": "user_physio1"
  }
]
```

### POST /exercises
Create exercise (Physio/Trainer/Admin).

**Request:**
```json
{
  "name": "New Exercise",
  "description": "Exercise description",
  "category": "strength",
  "instructions": ["Step 1", "Step 2"],
  "contraindications": ["Condition 1"],
  "pcod_safe": true,
  "min_age": 10,
  "max_age": 60,
  "sets": 3,
  "reps": 12,
  "video_url": null,
  "image_url": null
}
```

### POST /exercises/{exercise_id}/assign
Assign exercise to client.

**Request:**
```json
{
  "client_id": "user_client1",
  "sets": 3,
  "reps": 10,
  "frequency": "Daily",
  "notes": "Focus on form"
}
```

---

## ASSESSMENT ENDPOINTS

### GET /assessments/{client_id}
Get client's assessments.

### POST /assessments
Create assessment (Physio/Admin).

**Request:**
```json
{
  "client_id": "user_client1",
  "assessment_type": "developmental_milestones",
  "findings": {
    "gross_motor": {
      "score": 3,
      "notes": "Delayed walking"
    },
    "fine_motor": {
      "score": 4,
      "notes": "Good grasp"
    }
  },
  "recommendations": "Weekly therapy sessions recommended"
}
```

### PUT /assessments/{assessment_id}/lock
Lock assessment (immutable after lock).

---

## TREATMENT PLAN ENDPOINTS

### GET /treatment-plans/{client_id}
Get client's treatment plans.

### POST /treatment-plans
Create treatment plan (Physio/Admin).

**Request:**
```json
{
  "client_id": "user_client1",
  "diagnosis": "Developmental Coordination Disorder",
  "goals": [
    "Improve gross motor skills",
    "Enhance balance"
  ],
  "interventions": [
    "Balance exercises",
    "Coordination activities"
  ],
  "frequency": "2x per week",
  "duration_weeks": 12
}
```

---

## DAILY NOTES (SOAP) ENDPOINTS

### GET /daily-notes/{client_id}
Get client's daily notes.

### POST /daily-notes
Create daily note (Physio only).

**Request:**
```json
{
  "client_id": "user_client1",
  "appointment_id": "apt_abc123",
  "subjective": "Patient reports improved mobility",
  "objective": "ROM improved by 10 degrees",
  "assessment": "Good progress, continue current plan",
  "plan": "Continue exercises, increase intensity next week"
}
```

### PUT /daily-notes/{note_id}/lock
Lock note (same-day edit window, then auto-locks).

---

## PROGRESS ENDPOINTS

### POST /progress
Record progress metric.

**Request:**
```json
{
  "client_id": "user_client1",
  "metric_type": "weight",
  "value": 65.5,
  "unit": "kg",
  "notes": "Morning measurement"
}
```

### GET /progress/{client_id}
Get progress history.

**Query Params:**
- `metric_type`: weight | bmi | pain_level | strength | flexibility | etc.
- `date_from`: YYYY-MM-DD
- `date_to`: YYYY-MM-DD

**Response (200):**
```json
{
  "metrics": [
    {
      "metric_id": "metric_abc",
      "metric_type": "weight",
      "value": 65.5,
      "unit": "kg",
      "recorded_at": "2025-01-10T09:00:00Z"
    }
  ],
  "chart_data": {
    "labels": ["Jan 1", "Jan 5", "Jan 10"],
    "values": [68, 66.5, 65.5]
  }
}
```

---

## NOTIFICATION ENDPOINTS

### GET /notifications
Get user's notifications.

**Response (200):**
```json
[
  {
    "notification_id": "notif_abc",
    "title": "Appointment Reminder",
    "message": "Your appointment is tomorrow at 10 AM",
    "type": "appointment",
    "is_read": false,
    "created_at": "2025-01-14T18:00:00Z"
  }
]
```

### PUT /notifications/{notification_id}/read
Mark notification as read.

### POST /notifications/send
Send notification (Admin).

**Request:**
```json
{
  "user_ids": ["user_1", "user_2"],
  "template_id": "tpl_reminder",
  "variables": {
    "appointment_date": "Jan 15",
    "appointment_time": "10:00 AM"
  },
  "channels": ["in_app", "sms", "whatsapp"]
}
```

---

## AUDIT LOG ENDPOINTS (Admin Only)

### GET /audit-logs
Get audit logs.

**Query Params:**
- `user_id`: Filter by user
- `action`: create | update | delete | login | etc.
- `entity_type`: user | appointment | payment | etc.
- `date_from`: YYYY-MM-DD
- `date_to`: YYYY-MM-DD

**Response (200):**
```json
[
  {
    "log_id": "log_abc",
    "user_id": "user_admin1",
    "action": "update",
    "entity_type": "appointment",
    "entity_id": "apt_xyz",
    "old_value": {"status": "pending"},
    "new_value": {"status": "confirmed"},
    "ip_address": "192.168.1.1",
    "created_at": "2025-01-10T10:30:00Z"
  }
]
```

---

## DASHBOARD STATS ENDPOINTS

### GET /dashboard/stats
Get role-based dashboard statistics.

**Response varies by role:**

**Admin/Reception:**
```json
{
  "total_clients": 150,
  "pending_bookings": 12,
  "today_appointments": 8,
  "active_memberships": 45,
  "monthly_revenue": 250000,
  "pending_payments": 35000
}
```

**Physiotherapist:**
```json
{
  "assigned_patients": 25,
  "today_sessions": 5,
  "pending_assessments": 3,
  "active_treatment_plans": 20
}
```

**Client:**
```json
{
  "upcoming_appointments": 2,
  "active_plans": 1,
  "sessions_remaining": 8,
  "unread_messages": 3
}
```

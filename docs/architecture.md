# Mazhar Wellness & Paediatric Physio - Complete System Architecture

## 1. ROUTE MAP

### Public Routes (No Auth)
```
/                       - Home page
/services               - Services listing
/pricing                - Packages & pricing
/about                  - About us
/contact                - Contact page
/gallery                - Image gallery
/book                   - Guest appointment booking
/login                  - Login (email/password + Google OAuth)
/register               - Client registration
/auth/callback          - OAuth callback handler
```

### Client Dashboard Routes
```
/dashboard              - Client home/overview
/dashboard/appointments - View/manage appointments
/dashboard/payments     - Payment history & invoices
/dashboard/progress     - Progress charts & metrics
/dashboard/plans        - Diet & workout plans
/dashboard/exercises    - Assigned exercises
/dashboard/messages     - Chat with staff
/dashboard/documents    - Reports & documents
/dashboard/profile      - Profile settings
/dashboard/consultation/:id - Online consultation room
```

### Reception Dashboard Routes
```
/reception                    - Dashboard overview
/reception/appointments       - Appointment calendar (all)
/reception/guest-bookings     - Guest booking management
/reception/clients            - Client list & registration
/reception/convert/:bookingId - Guest → Client conversion
/reception/billing            - Invoice generation
/reception/payments           - Payment collection
/reception/attendance         - Check-in/check-out
/reception/memberships        - Membership management
/reception/communications     - SMS/WhatsApp templates
/reception/reports            - Basic reports
```

### Admin Dashboard Routes
```
/admin                  - Admin overview
/admin/clients          - All clients management
/admin/staff            - Staff CRUD & roles
/admin/guest-bookings   - Guest booking oversight
/admin/appointments     - All appointments
/admin/memberships      - Membership management
/admin/services         - Services CRUD
/admin/packages         - Packages CRUD
/admin/billing          - All invoices
/admin/finance          - Revenue & analytics
/admin/reports          - Full analytics
/admin/communications   - Template management
/admin/content          - Website CMS
/admin/exercises        - Exercise library management
/admin/settings         - System settings
/admin/audit-logs       - Audit trail viewer
```

### Physiotherapist Dashboard Routes
```
/physio                       - Dashboard overview
/physio/patients              - Assigned patients list
/physio/patient/:id           - Patient detail view
/physio/assessments           - Assessment templates
/physio/assessments/new/:clientId - New assessment
/physio/treatment-plans       - Treatment plan management
/physio/treatment-plans/new/:clientId - New plan
/physio/daily-notes           - Session notes (SOAP)
/physio/appointments          - My schedule
/physio/progress/:clientId    - Progress charts
/physio/exercises             - Exercise library
/physio/exercises/assign/:clientId - Assign exercises
/physio/messages              - Chat with patients
```

### Trainer Dashboard Routes
```
/trainer                      - Dashboard overview
/trainer/classes              - Class/batch management
/trainer/members              - Assigned members
/trainer/member/:id           - Member detail
/trainer/workout-plans        - Workout plan templates
/trainer/workout-plans/new/:clientId - Create plan
/trainer/attendance           - Class attendance
/trainer/progress/:clientId   - Member progress
/trainer/exercises            - Exercise library
/trainer/messages             - Chat with members
```

### Nutritionist Dashboard Routes
```
/nutrition                    - Dashboard overview
/nutrition/clients            - Assigned clients
/nutrition/client/:id         - Client detail
/nutrition/diet-plans         - Diet plan templates
/nutrition/diet-plans/new/:clientId - Create plan
/nutrition/templates          - Template library
/nutrition/progress/:clientId - Weight/BMI/PCOD tracking
/nutrition/follow-ups         - Follow-up scheduler
/nutrition/messages           - Chat with clients
```

---

## 2. ENTITY RELATIONSHIP DIAGRAM (ERD)

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│     USERS       │       │  CLIENT_PROFILE │       │  STAFF_PROFILE  │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ user_id (PK)    │──┐    │ profile_id (PK) │       │ staff_id (PK)   │
│ email           │  │    │ user_id (FK)────│───────│ user_id (FK)────│───┐
│ name            │  │    │ client_type     │       │ specialization  │   │
│ phone           │  └───►│ child_name      │       │ qualifications  │   │
│ password_hash   │       │ child_age       │       │ experience_yrs  │   │
│ role            │       │ age             │       │ bio             │   │
│ is_active       │       │ pcod_tracking   │       │ available_days  │   │
│ picture         │       │ height_cm       │       └─────────────────┘   │
│ created_at      │       │ weight_kg       │                             │
│ updated_at      │       │ goal            │                             │
│ deleted_at      │       │ emergency_contact│                            │
└─────────────────┘       └─────────────────┘                             │
                                                                          │
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐   │
│ GUEST_BOOKINGS  │       │  APPOINTMENTS   │       │    SERVICES     │   │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤   │
│ booking_id (PK) │       │ appt_id (PK)    │       │ service_id (PK) │   │
│ full_name       │       │ client_id (FK)──│───┐   │ name            │   │
│ phone           │       │ staff_id (FK)───│───│───│ description     │   │
│ service_category│       │ service_id (FK)─│───│──►│ category        │   │
│ preferred_date  │       │ scheduled_date  │   │   │ duration_mins   │   │
│ preferred_time  │       │ scheduled_time  │   │   │ price           │   │
│ message         │       │ duration_mins   │   │   │ is_active       │   │
│ status          │       │ status          │   │   │ deleted_at      │   │
│ assigned_to     │       │ meeting_link    │   │   └─────────────────┘   │
│ converted_to    │──────►│ is_online       │   │                         │
│ notes           │       │ notes           │   │   ┌─────────────────┐   │
│ created_at      │       │ created_at      │   │   │    PACKAGES     │   │
│ deleted_at      │       │ deleted_at      │   │   ├─────────────────┤   │
└─────────────────┘       └─────────────────┘   │   │ package_id (PK) │   │
                                                │   │ name            │   │
┌─────────────────┐       ┌─────────────────┐   │   │ services[]      │   │
│   MEMBERSHIPS   │       │    INVOICES     │   │   │ sessions_count  │   │
├─────────────────┤       ├─────────────────┤   │   │ validity_days   │   │
│ membership_id   │       │ invoice_id (PK) │   │   │ price           │   │
│ client_id (FK)──│───────│ client_id (FK)──│───┘   │ deleted_at      │   │
│ package_id (FK) │       │ items[]         │       └─────────────────┘   │
│ start_date      │       │ subtotal        │                             │
│ end_date        │       │ tax             │       ┌─────────────────┐   │
│ sessions_remain │       │ total           │       │    PAYMENTS     │   │
│ is_active       │       │ status          │       ├─────────────────┤   │
│ payment_id      │       │ notes           │◄──────│ payment_id (PK) │   │
│ created_at      │       │ created_at      │       │ invoice_id (FK) │   │
│ deleted_at      │       │ deleted_at      │       │ client_id (FK)  │   │
└─────────────────┘       └─────────────────┘       │ amount          │   │
                                                    │ payment_method  │   │
┌─────────────────┐       ┌─────────────────┐       │ status          │   │
│   ASSESSMENTS   │       │ TREATMENT_PLANS │       │ razorpay_id     │   │
├─────────────────┤       ├─────────────────┤       │ mock_mode       │   │
│ assessment_id   │       │ plan_id (PK)    │       │ receipt_url     │   │
│ client_id (FK)  │       │ client_id (FK)  │       │ created_at      │   │
│ staff_id (FK)───│───────│ staff_id (FK)───│───────│ deleted_at      │   │
│ assessment_type │       │ diagnosis       │       └─────────────────┘   │
│ findings{}      │       │ goals[]         │                             │
│ recommendations │       │ interventions[] │       ┌─────────────────┐   │
│ created_at      │       │ frequency       │       │   DAILY_NOTES   │   │
│ deleted_at      │       │ duration_weeks  │       ├─────────────────┤   │
│ is_locked       │       │ is_active       │       │ note_id (PK)    │   │
└─────────────────┘       │ created_at      │       │ client_id (FK)  │   │
                          │ deleted_at      │       │ staff_id (FK)───│───┘
                          └─────────────────┘       │ appointment_id  │
                                                    │ subjective      │
┌─────────────────┐       ┌─────────────────┐       │ objective       │
│    EXERCISES    │       │ EXERCISE_ASSIGN │       │ assessment      │
├─────────────────┤       ├─────────────────┤       │ plan            │
│ exercise_id(PK) │◄──────│ assignment_id   │       │ is_locked       │
│ name            │       │ client_id (FK)  │       │ created_at      │
│ description     │       │ exercise_id(FK) │       │ deleted_at      │
│ category        │       │ assigned_by(FK) │       └─────────────────┘
│ instructions[]  │       │ sets            │
│ contraindications│      │ reps            │       ┌─────────────────┐
│ pcod_safe       │       │ frequency       │       │   DIET_PLANS    │
│ min_age         │       │ notes           │       ├─────────────────┤
│ max_age         │       │ is_active       │       │ diet_plan_id    │
│ video_url       │       │ created_at      │       │ client_id (FK)  │
│ image_url       │       └─────────────────┘       │ nutritionist_id │
│ created_by      │                                 │ plan_type       │
│ is_active       │       ┌─────────────────┐       │ meals[]         │
│ deleted_at      │       │  WORKOUT_PLANS  │       │ daily_calories  │
└─────────────────┘       ├─────────────────┤       │ notes           │
                          │ workout_plan_id │       │ is_active       │
                          │ client_id (FK)  │       │ deleted_at      │
                          │ trainer_id (FK) │       └─────────────────┘
                          │ name            │
                          │ exercises[]     │       ┌─────────────────┐
                          │ frequency       │       │ PROGRESS_METRICS│
                          │ pcod_safe       │       ├─────────────────┤
                          │ notes           │       │ metric_id (PK)  │
                          │ is_active       │       │ client_id (FK)  │
                          │ deleted_at      │       │ recorded_by(FK) │
                          └─────────────────┘       │ metric_type     │
                                                    │ value           │
┌─────────────────┐       ┌─────────────────┐       │ unit            │
│    MESSAGES     │       │  NOTIFICATIONS  │       │ notes           │
├─────────────────┤       ├─────────────────┤       │ recorded_at     │
│ message_id (PK) │       │ notification_id │       └─────────────────┘
│ conversation_id │       │ user_id (FK)    │
│ sender_id (FK)  │       │ title           │       ┌─────────────────┐
│ receiver_id(FK) │       │ message         │       │  AUDIT_LOGS     │
│ content         │       │ type            │       ├─────────────────┤
│ attachments[]   │       │ is_read         │       │ log_id (PK)     │
│ is_read         │       │ created_at      │       │ user_id (FK)    │
│ created_at      │       └─────────────────┘       │ action          │
└─────────────────┘                                 │ entity_type     │
                          ┌─────────────────┐       │ entity_id       │
                          │  ATTENDANCE_LOG │       │ old_value       │
                          ├─────────────────┤       │ new_value       │
                          │ attendance_id   │       │ ip_address      │
                          │ client_id (FK)  │       │ created_at      │
                          │ appointment_id  │       └─────────────────┘
                          │ class_id        │
                          │ check_in        │       ┌─────────────────┐
                          │ check_out       │       │ NOTIF_TEMPLATES │
                          │ recorded_by     │       ├─────────────────┤
                          └─────────────────┘       │ template_id(PK) │
                                                    │ name            │
┌─────────────────┐       ┌─────────────────┐       │ type (sms/email/│
│   CONSULTATIONS │       │  UPLOADED_DOCS  │       │        whatsapp)│
├─────────────────┤       ├─────────────────┤       │ content         │
│ consult_id (PK) │       │ document_id(PK) │       │ variables[]     │
│ appointment_id  │       │ client_id (FK)  │       │ is_active       │
│ meeting_link    │       │ uploaded_by(FK) │       └─────────────────┘
│ chat_messages[] │       │ file_type       │
│ shared_files[]  │       │ file_url        │
│ session_notes   │       │ description     │
│ follow_up_date  │       │ category        │
│ summary_pdf_url │       │ created_at      │
│ created_at      │       └─────────────────┘
└─────────────────┘
```

---

## 3. PERMISSION MATRIX

| Action                          | Guest | Client | Reception | Physio | Trainer | Nutritionist | Admin |
|---------------------------------|-------|--------|-----------|--------|---------|--------------|-------|
| **PUBLIC WEBSITE**              |       |        |           |        |         |              |       |
| View public pages               | ✅    | ✅     | ✅        | ✅     | ✅      | ✅           | ✅    |
| Submit guest booking            | ✅    | ✅     | ✅        | ✅     | ✅      | ✅           | ✅    |
| **AUTHENTICATION**              |       |        |           |        |         |              |       |
| Register as client              | ✅    | -      | -         | -      | -       | -            | -     |
| Login                           | -     | ✅     | ✅        | ✅     | ✅      | ✅           | ✅    |
| **CLIENT MANAGEMENT**           |       |        |           |        |         |              |       |
| View all clients                | -     | -      | ✅        | -      | -       | -            | ✅    |
| View assigned clients only      | -     | -      | -         | ✅     | ✅      | ✅           | -     |
| Create client (convert guest)   | -     | -      | ✅        | -      | -       | -            | ✅    |
| Edit client profile             | -     | Own    | ✅        | -      | -       | -            | ✅    |
| Delete client                   | -     | -      | -         | -      | -       | -            | ✅    |
| **STAFF MANAGEMENT**            |       |        |           |        |         |              |       |
| View all staff                  | -     | -      | ✅        | -      | -       | -            | ✅    |
| Create staff                    | -     | -      | -         | -      | -       | -            | ✅    |
| Edit staff                      | -     | -      | -         | -      | -       | -            | ✅    |
| Delete staff                    | -     | -      | -         | -      | -       | -            | ✅    |
| Assign roles                    | -     | -      | -         | -      | -       | -            | ✅    |
| **GUEST BOOKINGS**              |       |        |           |        |         |              |       |
| View guest bookings             | -     | -      | ✅        | -      | -       | -            | ✅    |
| Update booking status           | -     | -      | ✅        | -      | -       | -            | ✅    |
| Convert to client               | -     | -      | ✅        | -      | -       | -            | ✅    |
| Delete guest booking            | -     | -      | -         | -      | -       | -            | ✅    |
| **APPOINTMENTS**                |       |        |           |        |         |              |       |
| View all appointments           | -     | -      | ✅        | -      | -       | -            | ✅    |
| View own appointments           | -     | ✅     | -         | ✅     | ✅      | ✅           | -     |
| Create appointment              | -     | ✅     | ✅        | ✅     | ✅      | ✅           | ✅    |
| Update appointment              | -     | Own    | ✅        | Own    | Own     | Own          | ✅    |
| Cancel appointment              | -     | Own    | ✅        | Own    | Own     | Own          | ✅    |
| Delete appointment              | -     | -      | -         | -      | -       | -            | ✅    |
| **SERVICES & PACKAGES**         |       |        |           |        |         |              |       |
| View services/packages          | ✅    | ✅     | ✅        | ✅     | ✅      | ✅           | ✅    |
| Create service/package          | -     | -      | -         | -      | -       | -            | ✅    |
| Edit service/package            | -     | -      | -         | -      | -       | -            | ✅    |
| Change pricing                  | -     | -      | -         | -      | -       | -            | ✅    |
| Delete service/package          | -     | -      | -         | -      | -       | -            | ✅    |
| **BILLING & PAYMENTS**          |       |        |           |        |         |              |       |
| View own invoices               | -     | ✅     | -         | -      | -       | -            | -     |
| View all invoices               | -     | -      | ✅        | -      | -       | -            | ✅    |
| Create invoice                  | -     | -      | ✅        | -      | -       | -            | ✅    |
| Collect payment                 | -     | -      | ✅        | -      | -       | -            | ✅    |
| Issue refund                    | -     | -      | -         | -      | -       | -            | ✅    |
| View finance analytics          | -     | -      | -         | -      | -       | -            | ✅    |
| **ASSESSMENTS**                 |       |        |           |        |         |              |       |
| View own assessments            | -     | ✅     | -         | -      | -       | -            | -     |
| View patient assessments        | -     | -      | -         | ✅     | -       | -            | ✅    |
| Create assessment               | -     | -      | -         | ✅     | -       | -            | ✅    |
| Edit assessment (own, unlocked) | -     | -      | -         | ✅     | -       | -            | ✅    |
| Lock assessment                 | -     | -      | -         | ✅     | -       | -            | ✅    |
| **TREATMENT PLANS**             |       |        |           |        |         |              |       |
| View own treatment plans        | -     | ✅     | -         | -      | -       | -            | -     |
| View patient plans              | -     | -      | -         | ✅     | -       | -            | ✅    |
| Create treatment plan           | -     | -      | -         | ✅     | -       | -            | ✅    |
| Edit treatment plan             | -     | -      | -         | ✅     | -       | -            | ✅    |
| **DAILY NOTES (SOAP)**          |       |        |           |        |         |              |       |
| View own notes summary          | -     | ✅     | -         | -      | -       | -            | -     |
| View patient full notes         | -     | -      | -         | ✅     | -       | -            | ✅    |
| Create daily note               | -     | -      | -         | ✅     | -       | -            | -     |
| Edit note (own, same day)       | -     | -      | -         | ✅     | -       | -            | -     |
| Lock note                       | -     | -      | -         | ✅     | -       | -            | ✅    |
| **EXERCISE LIBRARY**            |       |        |           |        |         |              |       |
| View all exercises              | -     | -      | -         | ✅     | ✅      | Read         | ✅    |
| View assigned exercises         | -     | ✅     | -         | -      | -       | -            | -     |
| Create exercise                 | -     | -      | -         | ✅     | ✅      | -            | ✅    |
| Edit exercise                   | -     | -      | -         | ✅     | ✅      | -            | ✅    |
| Delete exercise                 | -     | -      | -         | -      | -       | -            | ✅    |
| Assign exercise to client       | -     | -      | -         | ✅     | ✅      | -            | ✅    |
| **DIET PLANS**                  |       |        |           |        |         |              |       |
| View own diet plan              | -     | ✅     | -         | -      | -       | -            | -     |
| View all diet plans             | -     | -      | -         | -      | Read    | ✅           | ✅    |
| Create diet plan                | -     | -      | -         | -      | -       | ✅           | ✅    |
| Edit diet plan                  | -     | -      | -         | -      | -       | ✅           | ✅    |
| **WORKOUT PLANS**               |       |        |           |        |         |              |       |
| View own workout plan           | -     | ✅     | -         | -      | -       | -            | -     |
| View all workout plans          | -     | -      | -         | -      | ✅      | -            | ✅    |
| Create workout plan             | -     | -      | -         | -      | ✅      | -            | ✅    |
| Edit workout plan               | -     | -      | -         | -      | ✅      | -            | ✅    |
| **PROGRESS TRACKING**           |       |        |           |        |         |              |       |
| View own progress               | -     | ✅     | -         | -      | -       | -            | -     |
| View patient progress           | -     | -      | -         | ✅     | ✅      | ✅           | ✅    |
| Record progress metric          | -     | ✅     | -         | ✅     | ✅      | ✅           | ✅    |
| **ATTENDANCE**                  |       |        |           |        |         |              |       |
| View own attendance             | -     | ✅     | -         | -      | -       | -            | -     |
| View all attendance             | -     | -      | ✅        | -      | ✅      | -            | ✅    |
| Mark attendance                 | -     | -      | ✅        | ✅     | ✅      | -            | ✅    |
| **MESSAGES/CHAT**               |       |        |           |        |         |              |       |
| Chat with assigned staff        | -     | ✅     | -         | -      | -       | -            | -     |
| Chat with assigned clients      | -     | -      | -         | ✅     | ✅      | ✅           | -     |
| Send broadcast messages         | -     | -      | ✅        | -      | -       | -            | ✅    |
| **NOTIFICATIONS**               |       |        |           |        |         |              |       |
| Receive notifications           | -     | ✅     | ✅        | ✅     | ✅      | ✅           | ✅    |
| Manage notification templates   | -     | -      | -         | -      | -       | -            | ✅    |
| **REPORTS & ANALYTICS**         |       |        |           |        |         |              |       |
| View basic reports              | -     | -      | ✅        | -      | -       | -            | -     |
| View full analytics             | -     | -      | -         | -      | -       | -            | ✅    |
| Export PDF reports              | -     | Own    | ✅        | Own    | Own     | Own          | ✅    |
| **WEBSITE CONTENT**             |       |        |           |        |         |              |       |
| Edit website content            | -     | -      | -         | -      | -       | -            | ✅    |
| **AUDIT LOGS**                  |       |        |           |        |         |              |       |
| View audit logs                 | -     | -      | -         | -      | -       | -            | ✅    |
| **SYSTEM SETTINGS**             |       |        |           |        |         |              |       |
| Manage settings                 | -     | -      | -         | -      | -       | -            | ✅    |

---

## 4. API CONTRACT (Request/Response Shapes)

See `/app/docs/api_contract.md` for full API documentation.

---

## 5. MODULE-WISE IMPLEMENTATION ORDER

### Phase 1: Core Infrastructure ✅ (Completed)
1. Database models & schemas
2. JWT + Google OAuth authentication
3. Basic RBAC middleware
4. Public website pages
5. Guest booking flow

### Phase 2: Admin & Reception (Current)
1. Audit logging system
2. Soft delete implementation
3. Admin dashboard - Staff management
4. Admin dashboard - Services/Packages CRUD
5. Reception dashboard - Guest booking management
6. Guest → Client conversion flow
7. Invoice & Payment system (mock mode)

### Phase 3: Clinical Features
1. Physiotherapist dashboard
2. Assessment templates & CRUD
3. Treatment plan management
4. Daily notes (SOAP) with locking
5. Exercise library with constraints
6. Exercise assignment flow

### Phase 4: Wellness Features
1. Trainer dashboard
2. Workout plan management
3. PCOD-safe tagging system
4. Nutritionist dashboard
5. Diet plan templates
6. Progress tracking with charts

### Phase 5: Communication & Consultation
1. In-app notification system
2. Real-time chat (messages)
3. File upload system
4. Online consultation module
5. Notification template management
6. SMS/WhatsApp hooks (Twilio)

### Phase 6: Reporting & Analytics
1. PDF export (invoices, reports)
2. Progress charts visualization
3. Finance analytics (admin)
4. Attendance tracking
5. Membership renewal alerts
6. Full analytics dashboard

### Phase 7: Polish & Compliance
1. Website CMS (admin)
2. System settings
3. Audit log viewer
4. Data export/backup
5. Performance optimization
6. Security audit

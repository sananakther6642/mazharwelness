# Mazhar Wellness & Paediatric Physio - Requirements & Architecture

## Original Problem Statement
Build a full web app for a Paediatric Physiotherapy + Women's Wellness center with:
- Public website + registration
- Role-based dashboards: Admin, Reception, Physiotherapist, Trainer, Nutritionist, Client
- Online Consultation and central Exercise Library
- India-focused with Razorpay payments and Twilio SMS/WhatsApp

## User Choices
- **Authentication**: JWT + Google OAuth (both available)
- **Video/Meeting**: Simple meeting link integration (Zoom/Google Meet)
- **Notifications**: In-app + SMS/WhatsApp via Twilio (modular)
- **Payments**: Razorpay (with mock mode toggle)
- **Design**: Light, calming healthcare theme (soft teal/blue + white + gray)
- **Branding**: Mazhar Wellness & Paediatric Physio

## Architecture

### Tech Stack
- **Frontend**: React 19 + Tailwind CSS + Shadcn/UI
- **Backend**: FastAPI (Python)
- **Database**: MongoDB
- **Auth**: JWT + Emergent Google OAuth

### Data Models Implemented
- Users (with roles: admin, reception, physiotherapist, trainer, nutritionist, client)
- ClientProfiles (Parent/Woman types)
- Services & Packages
- GuestBookings
- Appointments
- Memberships
- Invoices & Payments
- Assessments & TreatmentPlans
- Exercises & ExerciseAssignments
- DietPlans & WorkoutPlans
- ProgressMetrics
- Messages & Notifications
- Website Content (Testimonials, FAQs, Gallery)

### API Endpoints Implemented
- `/api/auth/*` - Authentication (register, login, Google OAuth, logout)
- `/api/guest/booking` - Guest appointment booking (no auth)
- `/api/services` - Public services listing
- `/api/packages` - Public packages/pricing
- `/api/appointments` - Appointment management
- `/api/clients/*` - Client profile management
- `/api/staff/*` - Staff management (admin)
- `/api/exercises` - Exercise library
- `/api/diet-plans` - Diet plan management
- `/api/workout-plans` - Workout plan management
- `/api/assessments` - Patient assessments
- `/api/treatment-plans` - Treatment plans
- `/api/progress` - Progress tracking
- `/api/invoices` - Billing/invoices
- `/api/dashboard/stats` - Role-based dashboard statistics
- `/api/testimonials`, `/api/faqs`, `/api/gallery` - Website content

### Pages Implemented
1. **Public Website**:
   - Home (hero, services, stats, testimonials, CTA)
   - Services (category cards, service listings)
   - Pricing (packages with pricing tiers)
   - About (mission, values, team, timeline)
   - Contact (form, WhatsApp CTA, social links)
   - Gallery (filterable image grid)

2. **Auth Pages**:
   - Login (email/password + Google OAuth)
   - Register (Parent/Woman category selection flow)
   - Auth Callback (Google OAuth handler)

3. **Booking**:
   - Guest booking form (no login required)
   - Calendar + time slot selection

4. **Dashboards** (implemented shells):
   - Client Dashboard (appointments, stats, quick actions)
   - Admin/Reception/Physio/Trainer/Nutritionist placeholders

## Tasks Completed (Phase 1 - MVP)

### Backend
- [x] MongoDB models and schemas
- [x] JWT authentication with bcrypt password hashing
- [x] Google OAuth integration via Emergent Auth
- [x] RBAC (Role-Based Access Control) middleware
- [x] Guest booking API (no auth required)
- [x] Services and packages CRUD
- [x] Appointments management
- [x] Dashboard statistics API
- [x] Database seeding (default services, FAQs, testimonials, admin user)

### Frontend
- [x] Responsive navigation with mobile menu
- [x] Homepage with all sections
- [x] Services page with dynamic loading
- [x] Pricing page with package cards
- [x] About page with team and values
- [x] Contact page with form and WhatsApp
- [x] Gallery page with category filter
- [x] Guest booking form with calendar
- [x] Login/Register with Google OAuth
- [x] Client dashboard shell
- [x] Protected routes with role-based redirects

### Design
- [x] Teal (#2A9D8F) + Sand (#F4A261) color scheme
- [x] Nunito (headings) + Manrope (body) fonts
- [x] Rounded corners (2xl/3xl)
- [x] Soft shadows and glassmorphism
- [x] Responsive mobile-first design

## Next Tasks (Phase 2)

### High Priority
1. **Admin Dashboard**: Full CRUD for staff, services, packages, guest bookings
2. **Reception Dashboard**: Appointment calendar, guest-to-client conversion, billing
3. **Physiotherapist Dashboard**: Patient list, assessments, treatment plans, daily notes
4. **Exercise Library**: Full CRUD with video/image uploads
5. **Payment Integration**: Razorpay checkout flow

### Medium Priority
6. **Trainer Dashboard**: Classes, workout plans, attendance
7. **Nutritionist Dashboard**: Diet plans with templates
8. **Client Profile Completion**: Additional fields, document uploads
9. **Notification System**: In-app notifications UI
10. **Online Consultation**: Meeting link integration in appointments

### Lower Priority
11. **Reports & Analytics**: Revenue, attendance, progress charts
12. **SMS/WhatsApp Integration**: Twilio for appointment reminders
13. **PDF Export**: Progress reports, invoices
14. **Website CMS**: Admin editable content
15. **Audit Logs**: Track critical actions

## Default Credentials
- **Admin**: admin@mazharwellness.com / admin123

## Environment Variables
### Backend (.env)
- MONGO_URL
- DB_NAME
- JWT_SECRET (optional, has default)
- RAZORPAY_KEY_ID (for payments)
- RAZORPAY_KEY_SECRET
- TWILIO_ACCOUNT_SID (for SMS)
- TWILIO_AUTH_TOKEN

### Frontend (.env)
- REACT_APP_BACKEND_URL

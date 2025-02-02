# YER Tuition Platform

## Overview
The **YER Tuition Services** platform is an **online tuition system** designed to connect students, tutors, and administrators in a structured learning environment. The platform provides **course enrollment, tutor management, classroom scheduling, and secure payment processing**.

---

## **Features**
### **For Students**
- **Student Dashboard**: View enrolled courses, upcoming lessons, and class schedules.
- **Course Enrollment**: Join **group or one-on-one** sessions in **various subjects**.
- **Live Classroom**: Attend online lessons and interact with tutors.
- **Progress Tracking**: Monitor class attendance and assignments.

### **For Tutors**
- **Tutor Dashboard**: Manage assigned courses and upcoming classes.
- **New Class Creation**: Set up courses with duration, mode, and subject details.
- **Teaching Preferences**: Define **availability, subjects, and preferred teaching modes**.
- **Secure Account Verification**: Email authentication for tutors.

### **For Administrators**
- **Admin Dashboard**: Oversee **students, tutors, and courses**.
- **Student & Tutor Management**: Assign courses, approve tutors, and monitor class schedules.
- **Course Management**: Modify **course details, scheduling, and enrollments**.

### **General Features**
- **Secure Authentication**: User login and session management via **Auth0**.
- **Payment Integration**: **Stripe API** for **tuition payments and subscriptions**.
- **Privacy & Security**: **Data protection, access control, and session security**.
- **Contact & Support**: Inquiry form for **student, tutor, and parent** inquiries.

---

## **Tech Stack**
- **Backend**: Node.js with Express.js  
- **Frontend**: Pug templating engine  
- **Database**: Airtable (for user and course data)  
- **Authentication**: Auth0 with Passport.js  
- **Security**: Helmet.js, Cookie Parser, and Morgan for logging  
- **Payment Processing**: Stripe API  

---

## **Installation & Setup**
### **1. Clone the Repository**
```bash
git clone https://github.com/your-username/your-repo.git
cd your-repo
```

### **2. Install Dependencies**
```bash
npm install
```

### **3. Set Up Environment Variables**
Create a `.env` file in the root directory and add:
```env
AUTH0_DOMAIN=your-auth0-domain
AUTH0_CLIENT_ID=your-client-id
AUTH0_CLIENT_SECRET=your-client-secret
AUTH0_CALLBACK_URL=http://localhost:3000/callback
AIRTABLE_API_KEY=your-airtable-api-key
AIRTABLE_BASE_ID=your-airtable-base-id
STRIPE_SECRET_KEY=your-stripe-secret-key
```

### **4. Run the Server**
```bash
npm start
```
The server will start at `http://localhost:3000`.

---

## **Project Structure**
```
/public             # Static assets (CSS, JS, Images)
/views              # Pug templates for different users
  ├── index.pug                    # Homepage
  ├── about.pug                    # About the platform
  ├── contact.pug                  # Contact page
  ├── courses.pug                  # Course catalog
  ├── login.pug                    # Login page
  ├── password-reset.pug           # Password recovery page
  ├── privacy.pug                  # Privacy policy
  ├── terms-and-conditions.pug     # Terms & Conditions
  ├── 404.pug                      # Custom error page
  ├── student-dashboard.pug        # Student dashboard
  ├── tutor-dashboard.pug          # Tutor dashboard
  ├── admin-dashboard.pug          # Admin dashboard
  ├── student-sign-up.pug          # Student registration
  ├── tutor-sign-up.pug            # Tutor registration
  ├── tutor-preferences.pug        # Tutor preferences setup
  ├── verify-tutor.pug             # Tutor verification page
  ├── classroom.pug                # Virtual classroom access
  ├── course-details-group.pug     # Course details for group sessions
  ├── course-details-single.pug    # Course details for individual classes
  ├── tutor-preferences.html       # Tutor profile settings
/server.js         # Main backend server
/auth_config.json  # Auth0 configuration file
```

---

## **Routes Overview**
| Route | Description |
|--------|------------|
| `/` | Homepage with overview and CTA buttons |
| `/about` | Information about the tuition platform |
| `/courses` | Course catalog and details |
| `/contact` | Contact form for inquiries |
| `/login` | User login page |
| `/password-reset` | Password recovery page |
| `/privacy` | Privacy policy |
| `/terms-and-conditions` | Service terms and conditions |
| `/student/dashboard` | Student dashboard |
| `/tutor/dashboard` | Tutor dashboard |
| `/administrator/dashboard` | Admin dashboard |
| `/student/signup` | Student registration |
| `/tutor/signup` | Tutor registration |
| `/tutor/preferences` | Tutor teaching preferences |
| `/tutor/verify` | Tutor verification page |
| `/student/classroom` | Virtual classroom access |
| `/logout` | User logout |

---

const express = require("express");
const fs = require('fs');
const path = require('path');
const { join } = require("path");
const morgan = require("morgan");
const helmet = require("helmet");
const flash = require('connect-flash');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const url = require('url');
const util = require('util');
const querystring = require('querystring');
const cert = fs.readFileSync('./Cwd_jH4lbFBTDoaiT56n1.pem');
const jsonwebtoken = require('jsonwebtoken');
const crypto = require('crypto');
const isSecured = require('./lib/middleware/secured');
const userInViews = require('./lib/middleware/userInViews');
const app = express();
const authConfig = require("./auth_config.json");
const session = require("express-session");

// Load environment variables from .env
const dotenv = require('dotenv');
dotenv.config();

// Load Passport
const passport = require('passport');
const Auth0Strategy = require('passport-auth0');

const sessionConfig = {
  secret : 'XatMz*b]?;B)y4O5FbP(vh&~%m#[Y&',
  cookie: {},
  resave: false,
  saveUninitialized: true
};

// Configure Passport to use Auth0
const strategy = new Auth0Strategy(
  {
    domain: process.env.AUTH0_DOMAIN,
    clientID: process.env.AUTH0_CLIENT_ID,
    clientSecret: process.env.AUTH0_CLIENT_SECRET,
    callbackURL:
      process.env.AUTH0_CALLBACK_URL || 'http://localhost:3000/callback'
  },
  function (accessToken, refreshToken, extraParams, profile, done) {
    // accessToken is the token to call Auth0 API (not needed in the most cases)
    // extraParams.id_token has the JSON Web Token
    // profile has all the information from the user
    // var decoded = jsonwebtoken.decode(extraParams.id_token);
    // console.log(decoded);
    return done(null, profile);
  }
);

if (app.get('env') === 'production') {
  // Use secure cookies in production (requires SSL/TLS)
  sessionConfig.cookie.secure = true;

  // Uncomment the line below if your application is behind a proxy (like on Heroku)
  // or if you're encountering the error message:
  // "Unable to verify authorization request state"
  app.set('trust proxy', 1);
}

// create application/json parser
var jsonParser = bodyParser.json()

// Set your secret key. Remember to switch to your live secret key in production!
// See your keys here: https://dashboard.stripe.com/account/apikeys
const Stripe = require('stripe');
const stripe = Stripe('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'); //sk_test_51Hz5XxDLEOZtYomMEXLwv3mH5jGp45a2jIFVcuzm8mNIdACQHymsXI24htAXDYdYBOzI3yPQ4OCYAaagxNbkSo8v007bmcRC8B

const Airtable = require('airtable');
// const base = new Airtable({apiKey: 'key3o0yTllKlqkJF4'}).base('appLuIZdcNMmDwsS6');
    const base = new Airtable({apiKey : process.env.AIRTABLE_API_KEy}).base(process.env.AIRTABLE_BASE_ID);
    
    const Products  = []

    base('Products').select({
      // Selecting the first 3 records in Grid view:
      maxRecords: 3,
      view: "Grid view"
  }).eachPage(function page(records, fetchNextPage) {
      // This function (`page`) will get called for each page of records.
  
      records.forEach(function(record) {
          console.log('Retrieved', record.get('Title'));
          Products.push(record)
      });
  
      // To fetch the next page of records, call `fetchNextPage`.
      // If there are more records, `page` will get called again.
      // If there are no more records, `done` will get called.
      fetchNextPage();
  
  }, function done(err) {
      if (err) { console.error(err); return; }
  });


  


   


app.use(session(sessionConfig));
passport.use(strategy);

app.use(passport.initialize());
app.use(passport.session());
app.use(morgan("dev"));
app.use(cookieParser());
app.use(helmet());
app.use(express.static(join(__dirname, "public")));

if (!authConfig.domain || !authConfig.audience) {
  throw "Please make sure that auth_config.json is in place and populated";
}

// You can use this section to keep a smaller payload
passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});

app.set('views', [path.join(__dirname, 'public'), 
  path.join(__dirname, 'public/administrator'),
  path.join(__dirname, 'public/tutor'),
  path.join(__dirname, 'public/student')]);
app.set('view engine', 'pug');
app.use(flash());
app.use(userInViews());

app.use(function (req, res, next) {
  if (req && req.query && req.query.error) {
    req.flash('error', req.query.error);
  }
  if (req && req.query && req.query.error_description) {
    req.flash('error_description', req.query.error_description);
  }
  next();
});

// const checkJwt = jwt({
//   secret: jwksRsa.expressJwtSecret({
//     cache: true,
//     rateLimit: true,
//     jwksRequestsPerMinute: 5,
//     jwksUri: `https://${authConfig.domain}/.well-known/jwks.json`
//   }),

//   audience: authConfig.audience,
//   issuer: `https://${authConfig.domain}/`,
//   algorithms: ["RS256"]
// });

// const authenticateToken = function (req, res, next) {
//   const token = req.cookies['yts_principal'];

//   if (token == null) return res.sendStatus(401);

//   jwtz.verify(token, cert, {ignoreExpiration: true}, (err, user) => {
//     console.log(err);

//     if (err && err.name !== "TokenExpiredError") {return res.sendStatus(403);}    

//     console.log(jwtz.decode(token, cert));
//     req.user = user;

//     next();
//   });
// }

const generateSignature = (apiKey, apiSecret, meetingNumber, role) => {
  // Prevent time sync issue between client signature generation and zoom 
  const timestamp = new Date().getTime() - 30000;
  const msg = Buffer.from(apiKey + meetingNumber + timestamp + role).toString('base64');
  const hash = crypto.createHmac('sha256', apiSecret).update(msg).digest('base64');
  const signature = Buffer.from(`${apiKey}.${meetingNumber}.${timestamp}.${role}.${hash}`).toString('base64');

  return signature;
};

// app.use(function(err, req, res, next) {
//   if (err.name === "UnauthorizedError") {
//     return res.status(401).send({ msg: "Invalid token" });
//   }

//   next(err, req, res);
// });

// app.get("/auth_config.json", (req, res) => {
//   res.sendFile(join(__dirname, "auth_config.json"));
// });

app.get("/", (_, res) => {
  console.log(Products)
  res.render('index', {data: Products});
});

app.get("/courses", (_, res) => {
  res.render('courses');
});

app.get("/pricing", (_, res) => {
  res.render('about');
});

app.get("/contact", (_, res) => {
  res.render('contact');
});

app.get("/privacy", (_, res) => {
  res.render('privacy');
});

app.get("/terms", (_, res) => {
  res.render('terms-and-conditions');
});

app.get("/login", passport.authenticate('auth0', {
  scope: 'openid email profile'
}), function (req, res) {
  res.redirect('/');
});

app.get('/logout', (req, res) => {
  req.logout();

  let returnTo = req.protocol + '://' + req.hostname;
   let port = req.socket.localPort;
   if (port !== undefined && port !== 80 && port !== 443) {
     returnTo += ':' + port;
   }

  let logoutURL = new url.URL(
    util.format('https://%s/v2/logout', process.env.AUTH0_DOMAIN)
  );
  let searchString = querystring.stringify({
    client_id: process.env.AUTH0_CLIENT_ID,
    returnTo: returnTo
  });
  logoutURL.search = searchString;

  res.redirect(logoutURL);
});

app.get('/callback', function (req, res, next) {
  passport.authenticate('auth0', function (err, user, info) {
    if (err) { return next(err); }
    if (!user) { return res.redirect('/login'); }
    req.logIn(user, function (err) {
      if (err) { return next(err); }
      const returnTo = req.session.returnTo;
      delete req.session.returnTo;
      res.redirect(returnTo || '/');
    });
  })(req, res, next);
});

app.get("/reset-password/request", (_, res) => {
  res.render('password-reset');
});

app.get("/student/dashboard", isSecured(), (_, res) => {
  // Redirect Admin
  let tutors = [];
  if(_.user.id === "auth0|630564cc518f64499b172b68") {
    return res.redirect("/administrator/dashboard");
  } else {
    //check if tutor
    try{
      base('Tutors').select({
            view: "Grid view"
        }).eachPage(function page(records, fetchNextPage) {
            try {
              records.forEach(function(record) {
                  tutors.push(record);
              });
              fetchNextPage();
            } catch (e) {
              console.log(e);
            }
        }, function done(err) {
            var isTutor = false;
            if (err) { 
              console.error(err); 
              return res.sendFile("dashboard-single");
            } else {
              tutors.forEach(function(rec, index) {
                if(rec.fields.ID && "auth0|" + rec.fields.ID === _.user.id){
                  isTutor = true;
                }
              });
              return isTutor ? res.redirect("/tutor/dashboard") : res.render('dashboard-single');
            }
            
        });
    } catch(e) {
      console.log(e);
    }
  }
});

app.get("/student/signup/1", (_, res) => {
  res.render('student-sign-up-1');
});

app.get("/student/signup/2", (_, res) => {
  res.render('student-sign-up-2');
});

app.get("/student/signup/3", (_, res) => {
  res.render('verify-student');
});

app.get("/student/classroom", isSecured(), (_, res) => {
  res.render('classroom');
});

app.get("/student/group", isSecured(), (_, res) => {
  res.render('dashboard-group');
});

app.get("/course/details", (_, res) => {
  res.render('course-details-single');
});

app.get("/tutor/signup/1", (_, res) => {
  res.sendFile(join(__dirname, "/public/tutor/sign-up.html"));
});

app.get("/tutor/signup/2", (_, res) => {
  res.sendFile(join(__dirname, "/public/tutor/sign-up-student.html"));
});

app.get("/tutor/signup/3", (_, res) => {
  res.sendFile(join(__dirname, "/public/tutor/tutor-preferences.html"));
});

app.get("/tutor/signup/4", (_, res) => {
  res.sendFile(join(__dirname, "/public/tutor/verify-tutor.html"));
});

app.get("/tutor/dashboard", isSecured(), (_, res) => {
  res.render('tutor-dashboard');
});

app.get("/administrator/dashboard", isSecured(), (_, res) => {
  // Redirect Admin
  if(_.user.id === "auth0|630564cc518f64499b172b68") {
    res.render('dashboard');
  } else {
    // Redirect Other Users
    res.redirect("/student/dashboard");
  }
});

app.get("/administrator/courses", isSecured(), (_, res) => {
  // Redirect Admin
  if(_.user.id === "auth0|630564cc518f64499b172b68") {
    res.sendFile(join(__dirname, "/public/administrator/courses.html"));
  } else {
    // Redirect Other Users
    res.redirect("/student/dashboard");
  }
});

app.get("/administrator/guardians", isSecured(), (_, res) => {
  // Redirect Admin
  if(_.user.id === "auth0|630564cc518f64499b172b68") {
    res.render('guardian');
  } else {
    // Redirect Other Users
    res.redirect("/student/dashboard");
  }
});

app.get("/administrator/students", isSecured(), (_, res) => {
  // Redirect Admin
  if(_.user.id === "auth0|630564cc518f64499b172b68") {
    res.render('students');
  } else {
    // Redirect Other Users
    res.redirect("/student/dashboard");
  }
});

app.get("/administrator/tutors", isSecured(), (_, res) => {
  // Redirect Admin
  if(_.user.id === "auth0|630564cc518f64499b172b68") {
    res.render('tutors');
  } else {
    // Redirect Other Users
    res.redirect("/student/dashboard");
  }
});

app.get("/administrator/new/course/1", isSecured(), (_, res) => {
  // Redirect Admin
  if(_.user.id === "auth0|630564cc518f64499b172b68") {
    res.sendFile(join(__dirname, "/public/tutor/new-class.html"));
  } else {
    // Redirect Other Users
    res.redirect("/student/dashboard");
  }
});

app.get("/administrator/new/course/2", isSecured(), (_, res) => {
  // Redirect Admin
  if(_.user.id === "auth0|630564cc518f64499b172b68") {
    res.sendFile(join(__dirname, "/public/tutor/step-2.html"));
  } else {
    // Redirect Other Users
    res.redirect("/student/dashboard");
  }
});

app.get("/administrator/new/course/3", isSecured(), (_, res) => {
  // Redirect Admin
  if(_.user.id === "auth0|630564cc518f64499b172b68") {
    res.sendFile(join(__dirname, "/public/tutor/step-3.html"));
  } else {
    // Redirect Other Users
    res.redirect("/student/dashboard");
  }
});

app.get("/administrator/new/course/4", isSecured(), (_, res) => {
  // Redirect Admin
  if(_.user.id === "auth0|630564cc518f64499b172b68") {
    res.sendFile(join(__dirname, "/public/tutor/step-4.html"));
  } else {
    // Redirect Other Users
    res.redirect("/student/dashboard");
  }
});

app.post('/checkout', jsonParser, async (req, res) => {
  if(req.body.id) {
    let origin = req.get('origin');
    // GET record from Airtable
    base('Products').find(req.body.id, async function(err, record) {
        if (err) { 
          console.error(err); 
          return res.json({ error : 'No such course' });; 
        }
        console.log('Retrieved', record.id);

        try {
          const session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [
              {
                price: req.body.priceId
              },
            ],
            // {CHECKOUT_SESSION_ID} is a string literal; do not change it!
            // the actual Session ID is returned in the query parameter when your customer
            // is redirected to the success page.
            success_url: `${origin}/student/dashboard?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${origin}/student/dashboard?order=0`
            // success_url: 'https://example.com/success.html?session_id={CHECKOUT_SESSION_ID}',
            // cancel_url: 'https://example.com/canceled.html',
          });
      
          res.send({
            sessionId: session.id,
          });

        } catch (e) {
          res.status(400);
          return res.send({
            error: {
              message: e.message,
            }
          });
        }

        // const session = await stripe.checkout.sessions.create({
        //   mode: 'subscription',
        //   payment_method_types: ['card'],
        //   line_items: [
        //     {
        //       price: {
        //         currency: 'gbp',
        //         product_data: {
        //           name: record.fields.Title,
        //           images: req.body.images,
        //         },
        //         unit_amount: record.fields.Price * 100,
        //         recurring: {
        //           "interval": req.body.interval
        //         }
        //       },
        //       // quantity: 1,
        //     },
        //   ],
        //   mode: 'payment',
        //   success_url: `${origin}/student/classroom`,
        //   cancel_url: `${origin}/student/dashboard?order=0`,
        // });

        res.json({ id: session.id });
    });
  } else {
    res.json({ error : 'Missing required parameters' });
  }
});

app.post("/api/signup/student", jsonParser, async (req, res) => {
  if(req.body.studentData && req.body.parentData) {
    var allStudents = [];
      base('Students').select({
          view: "Grid view"
      }).eachPage(function page(records, fetchNextPage) {
          records.forEach(function(record) {
            allStudents.push(record);
          });
          fetchNextPage();
      }, async function done(err) {
          if (err) { console.error(err); return; }

          let student = allStudents.filter((s, i) => { return s.fields["Guardian Email"] === req.body.parentData.Email || s.fields["Email Address"] === req.body.studentData.StudentEmail; })
          if(student.length) {
            res.json({"code" : 500, "message" : "Account already exists"});
          } else {
            const customer = await stripe.customers.create({
              email : req.body.parentData.Email,
              description: req.body.parentData.FirstName + " " + req.body.parentData.Surname,
            });
            base('Students').create([{
              "fields": {
                "First Name": req.body.studentData.FirstName,
                "Surname": req.body.studentData.Surname,
                "Current School": req.body.studentData.StudentSchool,
                "SHS": req.body.studentData.SHS,
                "Current Exam Board": req.body.studentData.CurrentExamBoard,
                "Subject of Interest": req.body.studentData.SupportNeeded,
                "Relationship to Guardian": req.body.studentData.RelationshipToStudent,
                "Email Address": req.body.studentData.StudentEmail,
                "Guardian Name": req.body.parentData.FirstName + " " + req.body.parentData.Surname,
                "Guardian Email": req.body.parentData.Email,
                "Guardian Phone": req.body.parentData.Phone,
                "Guardian Postal Address": req.body.parentData.PostalCode,
                "Guardian House Address": req.body.parentData.Address,
                "Is Verified": false,
                "ID" : customer.id
                }
              }
            ], function(err, records) {
              if (err) {
                console.error(err);
                return res.json({"code" : 500, "message" : "Error inserting into database"});;
              }
              return res.json({"code" : 200, "message" : "Account created."});
            });
          }
      });
  } else {
    res.json({"code" : 500});
  }
});

app.post("/api/signup/tutor", jsonParser, (req, res) => {
  if(req.body.tutorData && req.body.tutorBackground) {

    base('Tutors').create([{
      "fields": {
        "Name": req.body.tutorData.FirstName + " " + req.body.tutorData.Surname,
        "Email": req.body.tutorData.Email,
        "Resume": null,
        "Phone": req.body.tutorData.Phone,
        "Currently Teaching": req.body.tutorBackground.CurrentlyTeaching,
        "Courses Taught": req.body.tutorBackground.CoursesTaught,
        "Teaching Location": req.body.tutorBackground.TeachingLocation,
        "Teaching Experience" : req.body.teachingTypes,
        "Is Verified": false,
        "Classes Assigned" : null,
        "ID" : req.body.ID
      }
    }
  ], function(err, records) {
    if (err) {
      console.error(err);
      return res.json({"code" : 500});;
    }
    return res.json({"code" : 200});
  });
  } else {
    res.json({"code" : 500});
  }
});

app.get("/api/get/tutors", isSecured(), (_, res) => {
  let tutors = [];
  base('Tutors').select({
      view: "Grid view"
  }).eachPage(function page(records, fetchNextPage) {
      records.forEach(function(record) {
          tutors.push(record);
      });
      fetchNextPage();

  }, function done(err) {
      if (err) { 
        console.error(err); 
        return res.send({"error" : err }); 
      } else {
        return res.send(tutors);
      }
      
  });
});

app.get("/api/get/students", isSecured(), (_, res) => {
  let students = [];
  base('Students').select({
      view: "Grid view"
  }).eachPage(function page(records, fetchNextPage) {
      records.forEach(function(record) {
          students.push(record);
      });
      fetchNextPage();
  }, function done(err) {
      if (err) { 
        console.error(err); 
        return res.send({"error" : err }); 
      } else {
        return res.send(students);
      }    
  });
});

app.post("/api/get/classes", isSecured(), jsonParser, (_, res) => {
  let classes = [];
  base('Classes').select({
      view: "Grid view"
  }).eachPage(function page(records, fetchNextPage) {
      try {
        records.forEach(function(record) {
          console.log(record.fields["Guardian Email (from Students)"]);
            classes.push(record);
        });
        fetchNextPage();
      } catch(e) {
        console.log(e);
      }
  }, function done(err) {
      if (err) { 
        console.error(err); 
        return res.send({"error" : err }); 
      } else {
        if(_.user.id !== "auth0|630564cc518f64499b172b68") {
          // Filter classes
          classes = classes.filter((c, i) => { return c.fields["Guardian Email (from Students)"] && c.fields["Guardian Email (from Students)"].includes(_.user._json.email); });
        }
        return res.send(classes);
      }
  });
});

app.get("/api/get/tutor/classes", isSecured(), (_, res) => {
  let tutors = [], tutor, classes = [];
  base("Tutors").select({
    view: "Grid view"
  }).eachPage(function page(records, fetchNextPage) {
      try {
        records.forEach(function(record) {
          if (record.fields.ID && "auth0|" + record.fields.ID === _.user.id) {
            tutors.push(record);
          }
        });
        fetchNextPage();
      } catch (e) {
        console.log("Get Tutors: ", e)
      }
  }, function done(err) {
      if (err) { 
        console.error(err); 
        return res.send({"error" : err }); 
      } else {
        tutor = tutors[0];
        if(tutor) {
          base('Classes').select({
              view: "Grid view"
          }).eachPage(function page(records, fetchNextPage) {
              try {
                records.forEach(function(record) {
                  console.log(tutor);
                  if(tutor.fields["Assigned"].includes(record.id)){
                    classes.push(record);
                  }
                });
                fetchNextPage();
              } catch (e) {
                console.log("Get classes for Tutors: ", e);
              }
          }, function done(err) {
              if (err) { 
                console.error(err); 
                return res.send({"error" : err }); 
              } else {
                return res.send(classes);
              }
          });
        } else {
          return res.send(classes);
        }
      }
  });
});


app.post("/api/create/class", isSecured(), jsonParser, (req, res) => {
  // Approve Admin
  if(req.user.id === "auth0|630564cc518f64499b172b68") {
    if(req.body.Title && req.body.Course) {
      base('Classes').create([{
          "fields": {
            "Class ID" : Math.floor(100000000 + Math.random() * 900000000),
            "Class Password" : req.body.ClassroomPassword,
            "Class Title" : req.body.Title,
            "Description" : req.body.Description,
            "Start Time" : req.body.StartTime,
            "Course" : [req.body.Course],
            "Type" : req.body.Type,
            "Start Date": req.body.StartDate
          }
        }
      ], function(err, records) {
        if (err) {
          console.error(err);
          return res.json({"code" : 500});;
        }
        return res.json({"code" : 200});
      });
    } else {
      res.json({"code" : 500, "message" : "Missing parameters"});
    }
  } else {
    // Forbid Other Users
    res.sendStatus(403);
  }
});

app.post("/api/get/meeting/signature", isSecured(), jsonParser, (req, res) => {
  res.send(generateSignature("qsLY5j2OWWrf4u0J01jRR6ZJ8Ssfq3oBf4Ld", "ySPFNokD2NJVe7dh7gI1xWn5utTKULfEwXnV", req.body.meetingNumber, 0));
});

process.on("SIGINT", function() {
  process.exit();
});

module.exports = app;

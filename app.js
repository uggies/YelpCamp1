const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');

const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user')

const ExpressError = require('./utils/ExpressError');

const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');
const userRoutes = require('./routes/users');

mongoose.connect('mongodb://localhost:27017/yelpcamp',{
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true, 
    useFindAndModify: false
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once('open', () => {
    console.log("Database connected");
})

const app = express();

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true}))
app.use(methodOverride('_method'));

app.use(express.static(path.join(__dirname, 'public')));
const sessionConfig = {
    secret : 'thishouldbeabettersecret!',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 *24 * 7,
        maxAge: 1000 * 60 * 60 *24 * 7
    }
}
app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req, res, next) => {
    // console.log(req.user);
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

// app.get('/fakeUser', async (req, res) => {
//     const user = new User({
//         email: 'coltttt1@gmail.com', username: 'colttt1'
//     })
//     const newUser = await User.register(user, 'chicken');
//     res.send(newUser);
// })

// campground routes
// require('./routes/campgrounds_old')(app);
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);
app.use('/', userRoutes);


app.all('*', (req, res, next) => {
    // res.send("404!!!")
    next(new ExpressError("Page not found", 404))
})

app.use((err, req, res, next)=> {
    /*
    // res.send("Error! Something went wrong...")
    const { statusCode = 500, message = "Something went wrong"} = err;
    // res.status(statusCode).send(message);
    res.render('error');
    */
   const { statusCode } = err;
   if ( !err.message) err.message = "Oh No, Something went wrong!";
    res.render('error', { err })
});

app.get('/', (req,res) => {
    res.render('home');
});

app.listen(3000, console.log("Server running on port 3000"));
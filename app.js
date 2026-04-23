import express from 'express';
import mongoose from 'mongoose';
import session from 'express-session';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcryptjs';
import 'dotenv/config';
import User from './models/userModel.js';
import { register, logout } from './controllers/authController.js';
import { renderAlbums, renderAddForm, createAlbum, testingApi, PostTest } from './controllers/albumController.js';
import { isAdmin } from './middleware/auth.js';
import flash from 'connect-flash'; 

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('MongoDB Connected');
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch(err => console.error('Connection Error:', err));


app.set('view engine', 'pug');
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: process.env.ACCESS_TOKEN_SECRET || 'secret-key',
    resave: false,
    saveUninitialized: false
}));

app.use(flash()); 
app.use(passport.initialize());
app.use(passport.session());

//  Brute Force Protection logic
passport.use(new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
    try {
        const user = await User.findOne({ email });
        if (!user) return done(null, false, { message: 'Invalid Email or Password' });
        
        if (user.lockUntil && user.lockUntil > Date.now()) {
            return done(null, false, { message: 'Account locked due to too many failed attempts. Try again in 15 minutes.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            user.loginAttempts += 1
            if (user.loginAttempts >= 3){
                user.lockUntil = Date.now() + 15 * 60 * 1000
            }
            await user.save()
            return done(null, false, { message: 'Invalid Email or Password' });
        }
        user.loginAttempts = 0;
        user.lockUntil = 0; 
        await user.save();
        return done(null, user);
        } 
        catch (err) {
        return done(err);
    }
}));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
    const user = await User.findById(id);
    done(null, user);
});
app.get('/', (req, res) => {
    res.redirect('/albums');
});

const isAuth = (req, res, next) => req.isAuthenticated() ? next() : res.redirect('/login');
app.get("/api/albums", testingApi)
app.post('/api/albums', PostTest);

app.get('/register', (req, res) => res.render('register'));
app.post('/register', register);

app.get('/login', (req, res) => {
    const errorMessages = req.flash('error');
    res.render('login', { 
        error: errorMessages.length > 0 ? errorMessages[0] : null 
    });
});

app.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) { return next(err); }
        if (!user) {
            if (info && info.message && info.message.includes('Account locked')) {
                return res.redirect('/locked'); 
            }
            req.flash('error', info.message);
            return res.redirect('/login'); 
        }
        req.logIn(user, (err) => {
            if (err) { return next(err); }
            return res.redirect('/albums');
        });
    })(req, res, next); 
});

app.get('/locked', (req, res) => {
    res.render('locked');
});
app.get('/logout', logout);

app.get('/albums', renderAlbums);
app.get('/albums/add', isAdmin ,isAuth, renderAddForm);
app.post('/albums', isAuth, createAlbum);

app.listen(3000, () => console.log('Server running on http://localhost:3000'));

export default app;
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

const app = express();
app.use(express.json());

if (process.env.NODE_ENV !== 'test') {
    mongoose.connect(process.env.MONGO_URI);
}

// 2. Config
app.set('view engine', 'pug');
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: process.env.ACCESS_TOKEN_SECRET || 'secret-key',
    resave: false,
    saveUninitialized: false
}));


app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
    try {
        const user = await User.findOne({ email });
        if (!user) return done(null, false, { message: 'Invalid Email' });
        
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return done(null, false, { message: 'Invalid Password' });
        
        return done(null, user);
    } catch (err) {
        return done(err);
    }
}));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
    const user = await User.findById(id);
    done(null, user);
});


const isAuth = (req, res, next) => req.isAuthenticated() ? next() : res.redirect('/login');
app.get("/api/albums", testingApi)
app.post('/api/albums', PostTest);

app.get('/register', (req, res) => res.render('register'));
app.post('/register', register);

app.get('/login', (req, res) => res.render('login'));
app.post('/login', passport.authenticate('local', {
    successRedirect: '/albums',
    failureRedirect: '/login'
}));

app.get('/logout', logout);

app.get('/albums', renderAlbums);
app.get('/albums/add', isAdmin ,isAuth, renderAddForm);
app.post('/albums', isAuth, createAlbum);

app.listen(3000, () => console.log('Server running on http://localhost:3000'));


export default app
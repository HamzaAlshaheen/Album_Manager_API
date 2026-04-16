import User from '../models/userModel.js';

export const register = async (req, res) => {
    try {
        const { userName, email, password, role } = req.body;
        
    
        await User.create({ 
            userName: userName,
            email, 
            password,
            role: role 
        });
        
        res.redirect('/login');
    } catch (err) {
        console.error("DETAILED ERROR:", err);
        res.status(500).send("Registration failed: " + err.message);
    }
};

export const logout = (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);
        res.redirect('/login');
    });
};
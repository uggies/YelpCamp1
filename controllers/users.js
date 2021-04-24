
const User = require('../models/user');

module.exports.renderRegister = (req, res) => {
    res.render('users/register');
}

module.exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const user = new User({username, email})
        const addUser = await User.register(user, password);    
        // console.log(addUser);
        req.login(addUser, err => {
            if ( err) return next(err);
            req.flash('success', 'Welcome to Yelp Camp!');
            res.redirect('/campgrounds');
        })    
    } catch(e) {
        req.flash('error', e.message);
        res.redirect('/register')
    }
}

module.exports.renderLogin = (req, res) => {
    res.render('users/login');
}

module.exports.login = (req, res) => {
    const redirectUrl = req.session.returnTo || '/campgrounds';
    delete req.session.returnTo;
    req.flash('success', 'Welcome Back!');
    res.redirect('/campgrounds');
}

module.exports.logout = (req, res) => {
    req.logout();
    req.flash('success', 'Goodbye!')
    res.redirect('/campgrounds');
}
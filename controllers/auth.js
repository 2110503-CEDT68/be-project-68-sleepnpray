const User = require('../models/User');

// --- HELPER: Send Token and User Data ---
const sendTokenResponse = (user, statusCode, res) => {
    // 1. Generate the token
    const token = user.getSignedJwtToken();

    // 2. Cookie options (Still good to have for security)
    const options = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
        httpOnly: true
    };

    if (process.env.NODE_ENV === 'production') {
        options.secure = true;
    }

    // 3. THE FIX: Include the 'user' object in the JSON response
    // This allows NextAuth to "see" the role, name, and email
    res.status(statusCode).cookie('token', token, options).json({
        success: true,
        token,
        data: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            telephone: user.telephone
        }
    });
};

exports.register = async (req, res, next) => {
    try {
        const { name, email, password, role, telephone } = req.body;
        const user = await User.create({
            name, email, password, role, telephone
        });
        
        // Changed status to 201 for "Created"
        sendTokenResponse(user, 201, res);
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
        console.log(err.stack);
    }
};

exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ success: false, msg: 'Please provide an email and password' });
        }

        // Must select +password to compare, but it won't be sent in the response
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({ success: false, msg: 'Invalid credentials' });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, msg: 'Invalid credentials' });
        }

        sendTokenResponse(user, 200, res);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, msg: 'Server Error' });
    }
};

exports.getMe = async (req, res, next) => {
    // req.user.id comes from your protect middleware
    const user = await User.findById(req.user.id);
    res.status(200).json({ success: true, data: user });
};

exports.logout = async (req, res, next) => {
    res.cookie('token', 'none', {
        expires: new Date(0),
        httpOnly: true
    });
    res.status(200).json({ success: true, data: {} });
};
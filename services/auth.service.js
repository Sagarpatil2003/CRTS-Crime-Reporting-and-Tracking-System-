const UserModel = require('../models/user.model')
const RefreshToken = require('../models/refreshToken.model')
const jwt = require('jsonwebtoken')
const ApiError = require('../utils/ApiError')

exports.generateToken = (userId) => {
    const accessToken = jwt.sign({ id: userId }, process.env.JWT_ACCESS_SECRET, { expiresIn: '15m' })
    const refreshToken = jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' })
    return { accessToken, refreshToken }
}


// exports.registerUser = async ({ name, email, role, password,  }) => {
//     const existing = await UserModel.findOne({ email });
//     if (existing) throw new ApiError(409, "Email already in use");
   
//     const user = await UserModel.create({ name, email, role, password });

//     const userObj = user.toObject();
//     delete userObj.password;

//     return { name, email, role, password };
// }

exports.registerUser = async ({ name, email, role, password, location }) => {
    const existing = await UserModel.findOne({ email });
    if (existing) throw new ApiError(409, "Email already in use");

    // 1. Ensure location follows GeoJSON format for MongoDB 2dsphere
    // Frontend should send: { coordinates: [72.87, 19.07] }
    const userData = { 
        name, 
        email, 
        role, 
        password,
        location: location || { type: 'Point', coordinates: [0, 0] } 
    };

    const user = await UserModel.create(userData);

    const userObj = user.toObject();
    delete userObj.password;

    return userObj; // Return the full object (minus password) for testing
};

exports.loginUser = async ({ email, password }) => {
    const user = await UserModel.findOne({ email }).select("+password");

    if (!user || !(await user.comparePassword(password))) {
        throw new ApiError(401, "Invalid email or password");
    }

    //Check account status
    if (user.accountStatus !== "ACTIVE") {
        throw new ApiError(403, `Access denied. Your account is ${user.accountStatus}`);
    }

    //Generate Tokens
    const { accessToken, refreshToken } = exports.generateToken(user._id);

    // Store Refresh Token
    await RefreshToken.create({
        user: user._id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    // Update last login
    user.lastLoginAt = new Date();
    await user.save();

    return {
        accessToken,
        refreshToken,
        user: { id: user._id, name: user.name, role: user.role }
    };
}


exports.logoutUser = async (token) => {
    // Revoke specifically this session
    await RefreshToken.deleteOne({ token })
}


exports.refreshAccessToken = async (token) => {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET)

    //  Does this specific token exist in our DB?
    //  If the token isn't in the DB, it was either 
    // revoked (logout) or never existed.
    const tokenRecord = await RefreshToken.findOne({ user: decoded.id, token: token })
    if (!tokenRecord) {
        throw new ApiError(401, 'Token revoked or invalid')
    }

    // Check if token is actually expired (if not using TTL index)
    if (new Date() > tokenRecord.expiresAt) {
        await RefreshToken.deleteOne({ token }) // Clean up expired token
        throw new ApiError(401, "token expired");
    }
    // Generate new Access Token
    const accessToken = jwt.sign({ id: decoded.id }, process.env.JWT_ACCESS_SECRET, { expiresIn: "15m" })
    return  accessToken 
}

const jwt = require('jsonwebtoken')
const UserModel = require('../models/user.model')

const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization
        // console.log(authHeader) 
        if (!authHeader || !authHeader.startsWith('Bearer')) {
            return res.status(401).json({
                success: false,
                message: "Authentication token missing"
            })
        }

        const token = authHeader.split(" ")[1]
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET)

        const user = await UserModel.findById(decoded.id).select('+accountStatus +role')
        
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User no longer exists'
            })
        }

        if (user.accountStatus !== "ACTIVE") {
            return res.status(403).json({
                success: false,
                message: `Account ${user.accountStatus}`
            })
        }
       
        req.user = {
            id: user._id,
            role: user.role
        }
        
        next()

    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                success: false,
                message: "Access token expired"
            })
        }

        return res.status(401).json({
            success: false,
            message: "Invalid authentication token"
        })
    }
}

module.exports = authMiddleware
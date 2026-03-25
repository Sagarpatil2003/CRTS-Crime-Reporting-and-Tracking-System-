const authService = require('../services/auth.service')
const catchAsync = require('../utils/catchAsync')
const ApiError = require('../utils/ApiError')
const ApiResponse = require('../utils/ApiResponse')

exports.register = catchAsync(async (req, res) => {
    const user = await authService.registerUser(req.body)

    const response = new ApiResponse(201, user, "User registered successfully")
    res.status(response.statusCode).json(response)
})

exports.login = catchAsync(async (req, res) => {
    const user = await authService.loginUser(req.body)
    
    const response = new ApiResponse(200, user, "Login successful")
    res.status(response.statusCode).json(response)
})


exports.logout = catchAsync(async (req, res) => {
    const token = req.body.refreshToken
    if (!token) {
        throw new ApiError(400, "Please provide a refresh token")
    }

    await authService.logoutUser(token)

    const response = new ApiResponse(200, null, "Logged out successfully")
    res.status(response.statusCode).json(response)
})


exports.refreshAccessToken = catchAsync(async (req, res) => {
    const token = req.headers['refresh-token']

    if (!token) {
        // Updated error message to match the logic (refresh token is needed here)
        throw new ApiError(400, "Please provide a refresh token")
    }

    const newAccessToken = await authService.refreshAccessToken(token)

    const response = new ApiResponse(200, { accessToken: newAccessToken }, "Token refreshed")
    res.status(response.statusCode).json(response)
})

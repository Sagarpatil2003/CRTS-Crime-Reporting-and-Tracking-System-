const authService = require('../services/auth.service')
const catchAsync = require('../utils/catchAsync')
const ApiError = require('../utils/ApiError')
const ApiResponse = require('../utils/ApiResponse')

exports.register = catchAsync(async (req, res) => {
    const user = await authService.registerUser(req.body)
    console.log(req.body)
    res.status(201).json({
        success: true,
        data: user
    })
})

exports.login = catchAsync(async (req, res) => {
    const user = await authService.loginUser(req.body)
    res.status(200).json({
        success: true,
        data: user
    })
})

exports.logout = catchAsync(async (req, res) => {

    const token = req.body.refreshToken
    if (!token) {
        throw new ApiError(400, "Please provide a refresh token")
    }

    await authService.logoutUser(token)

    res.status(200).json({
        success: true,
        message: "Logged out successfully"
    })
})

exports.refreshAccessToken = catchAsync(async (req, res) => {
    const token = req.headers['refresh-token']

    if (!token) {
        throw new ApiError(400, "Please provide a access token")
    }

    const newAccessToken = await authService.refreshAccessToken(token)

    res.status(200).json({
        success: true,
        message: "Refreshed token",
        newAccessToken
    })

})

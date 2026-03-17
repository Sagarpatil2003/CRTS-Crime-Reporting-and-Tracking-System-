let mongoose = require('mongoose')

async function connectDB () {
    try {
       await mongoose.connect('mongodb://127.0.0.1:27017/SCI')
       console.log('DB connected..')
    }catch(error) {
        console.log('Error in DB config')
        console.log(error)
    }
}

module.exports = connectDB
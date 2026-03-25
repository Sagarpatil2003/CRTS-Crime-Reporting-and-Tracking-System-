let mongoose = require('mongoose')

async function connectDB () {
    try {
       await mongoose.connect(process.env.MONGODB_URL)
       console.log('DB connected..')
    }catch(error) {
        console.log('Error in DB config')
        console.log(error)
    }
}

module.exports = connectDB


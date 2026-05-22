const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        // await mongoose.connect("mongodb://127.0.0.1:27017/cracker_junction");
        await mongoose.connect("mongodb+srv://balusathish185_db_user:SR2b8jk2xMflNicJ@crackerjunction.z3olodk.mongodb.net/test");
        console.log("MongoDB connected");
    } catch (error) {
        console.error("MongoDB connection error:", error.message);
        process.exit(1);
    }
};

module.exports = connectDB;

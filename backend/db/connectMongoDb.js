import mongoose from "mongoose";

const connectMongoDb = async () => {
  try {
    const conn = mongoose.connect(process.env.MONGO_URI);
    console.log(`Mongo DB connnected successfully`);
  } catch (error) {
    console.error(`Error connecting to database: ${error.message}`);
    process.exit(1);
  }
};

export default connectMongoDb;

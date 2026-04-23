import mongoose from "mongoose";

import { DB_NAME } from "../constants.js";

const connectDB = async () =>{
  try {
    await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
    console.log("mongoose connected ");
  } catch (error) {
    console.log("while connect the error to mongoose",error);
    process.exit(1);
  }

}

export default connectDB;
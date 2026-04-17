import mongoose from "mongoose";

const buildSchema = new mongoose.Schema({
  status: String,
  logs: String,
  explanation: String, 
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Build = mongoose.model("Build", buildSchema);

export default Build;
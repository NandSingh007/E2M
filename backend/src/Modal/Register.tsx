import mongoose, { Schema, Document } from "mongoose";

// Define the User interface (for TypeScript support)
interface IUser extends Document {
  username: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

// Create the User schema
const userSchema = new Schema<IUser>({
  username: {
    type: String,
    required: [true, " username,  is required"]
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [6, "Password must be at least 6 characters long"]
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Add a pre-save hook to update the updatedAt field automatically on modification
userSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

// Create a model using the schema
const User = mongoose.model<IUser>("User", userSchema);

export default User;

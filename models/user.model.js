import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    select: false, //don't show the password in the response
    trim: true
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'superadmin'],
    default: 'user'
  },
  travels: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Travel"
    }
  ]
},
{ timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;

import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const UserSchema = new mongoose.Schema({
    userName: {
        type: String, 
        required: false, 
        trim: true,
        maxlength: 15,
        minlength: 5,
       
        unique: true,
        sparse: true 
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true, 
        minlength: 8,
        match: [/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, "Please provide a valid email"]
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        minlength: 15
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user"
    }
});


UserSchema.pre('save', async function() {
    if (!this.isModified('password')) return;
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    } catch (err) {
       throw new Error("Password hashing failed: " + err.message);
    }
});

export default mongoose.model("User", UserSchema);
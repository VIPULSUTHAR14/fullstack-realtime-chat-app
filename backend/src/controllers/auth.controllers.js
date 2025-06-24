import bcrypt from "bcryptjs"
import { generateToken } from "../lib/utiles.js"
import User from "../models/user.model.js"
import jwt from "jsonwebtoken"
import cloudinary from "../lib/cloudinary.js"
export const signup = async (req, res) => {
  const { fullname, email, password } = req.body;

  try {
    if (!fullname || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists with this email address" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullname,
      email,
      password: hashedPassword,
    });

    await newUser.save();
    generateToken(newUser._id, res);

    return res.status(201).json({
      _id: newUser._id,
      fullname: newUser.fullname,
      email: newUser.email,
      profilePic: newUser.profilePic,
    });

  } catch (err) {
    console.error("Error in SignUp controller:", err.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
export const login = async (req, res) => {
try {
    const {email,password} = req.body;
    const user = await User.findOne({email});
    if(!user){
        return res.status(400).json({message:"Invaild Credentials"})
    }

    const isPasswordCorrect = await bcrypt.compare(password,user.password)
    if(!isPasswordCorrect){
        return res.status(400).json({message:"Invaild Credentials"})
    }

    generateToken(user._id,res)

    res.status(200).json({
        _id:user._id,
        fullname:user.fullname,
        email:user.email,
        profilePic:user.profilePic
    })

} catch (err) {
    console.log("Error in Login controller",err.message)
    return res.status(500).json({message:"Internal Server Error"})
}
}
export const logout = async (req, res) => {
    try {
        res.cookie("jwt","",{maxAge:0})
        res.status(200).json({message:"Logged Out Successfully"})
    } catch (error) {
        console.log("Error in Logout controller");
        return res.status(500).json({message:"Internal server Error"})
    }
}

export const UpdateProfile = async (req, res) => {
  try {
    const { profilePic } = req.body;
    const userId = req.user._id;

    if (!profilePic) {
      return res.status(400).json({ message: "Profile pic is required" });
    }

    const uploadResponse = await cloudinary.uploader.upload(profilePic);
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePic: uploadResponse.secure_url },
      { new: true }
    );

    res.status(200).json(updatedUser);
  } catch (error) {
    console.log("error in update profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
export const checkAuth = async (req,res)=>{
    try{
        return res.status(200).json(req.user)
    }catch(error){
        console.log("Error in CheckAuth controller",error.message)
        return res.status(500).json({message:"Internal Server Error"})
    }
}
import mongoose from "mongoose";

const userschema = new mongoose.Schema(
    {
        email:{
            type:String,
            required: true,
            unique:true,
        },

        fullname:{
            type:String,
            required:true,
        },
        password:{
            type:String,
            required:true,
            unique:true,
            minimun_length: 6,
        },
        profilePic:{
            type:String,
            default:"",
        }
    },
    {timestamps: true}
)

const User = new mongoose.model("User",userschema)

export default User;
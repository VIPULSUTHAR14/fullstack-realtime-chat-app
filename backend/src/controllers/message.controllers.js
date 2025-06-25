import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId ,getIO } from "../lib/socket.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import mongoose from "mongoose";

export const getUserForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    const users = await User.find({ _id: { $ne: loggedInUserId } })
      .select("-password");

    res.status(200).json(users);
  } catch (error) {
    console.error("Error in getUserForSidebar:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getMessages = async (req, res) => {
    try {
        const { id: UserToChatId } = req.params;
        const myId = req.user._id;

        // Validate ObjectId format
        if (!mongoose.Types.ObjectId.isValid(UserToChatId)) {
            return res.status(400).json({ message: "Invalid user ID format" });
        }

        // Check if the user to chat with exists
        const userExists = await User.findById(UserToChatId);
        if (!userExists) {
            return res.status(404).json({ message: "User not found" });
        }

        const messages = await Message.find({
            $or: [
                { senderId: myId, receiverId: UserToChatId },
                { senderId: UserToChatId, receiverId: myId },
            ]
        }).sort({ createdAt: 1 });

        res.status(200).json(messages);
    } catch (error) {
        console.error("Error in getMessages Controller:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const SendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;
    let imageUrl;

    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });

    await newMessage.save();

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      getIO().to(receiverSocketId).emit("newMessage", newMessage);
    }

    const senderSocketId = getReceiverSocketId(senderId);
    if (senderSocketId && senderSocketId !== receiverSocketId) {
      getIO().to(senderSocketId).emit("newMessage", newMessage);
    }

    res.status(200).json(newMessage);
  } catch (error) {
    console.log("Error in SendMessage Controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

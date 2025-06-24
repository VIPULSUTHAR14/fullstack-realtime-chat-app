import { create } from "zustand";
import { toast } from "react-hot-toast";
import { axiosInstance } from "../lib/axios.js";
import { useAuthStore } from "./useAuthStore.js";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      if (error.response?.status === 401) {
        set({ users: [] });
      } else {
        console.log("Error in get users", error);
        toast.error(error.response?.data?.message || "Failed to load users");
      }
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    if (!userId) return;
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      console.log("Error in get messages", error);
      if (error.response?.status === 404) {
        set({ messages: [] });
      } else {
        toast.error(error.response?.data?.message || "Failed to load messages");
      }
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    try {
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
      set({ messages: [...messages, res.data] });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send message");
    }
  },

  subscribeToMessages: () => {
    const socket = useAuthStore.getState().socket;
    const { authUser } = useAuthStore.getState();
    socket?.off("newMessage");

    socket?.on("newMessage", (newMessage) => {
      const { selectedUser, messages } = get();

      // Check if the message is between the current user and the selected user
      const isRelevant =
        selectedUser &&
        authUser &&
        ((newMessage.senderId === authUser._id && newMessage.receiverId === selectedUser._id) ||
         (newMessage.senderId === selectedUser._id && newMessage.receiverId === authUser._id));

      if (!isRelevant) return;

      set({ messages: [...messages, newMessage] });
    });
  },

  unSubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket?.off("newMessage");
  },

  setSelectedUser: (selectedUser) => {
    get().unSubscribeFromMessages();
    set({ selectedUser });
    get().subscribeToMessages();
  },
}));

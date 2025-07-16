import { User } from "firebase/auth";
// import { DocumentData } from "firebase/firestore";
import nextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      _id: string;
      name: string;
      username: string;
      phoneNumber: string;
      role: "admin" | "shopkeeper";
      assignedShop?: any;
      isSuspended: boolean;
      gender: string;
    };
  }
}

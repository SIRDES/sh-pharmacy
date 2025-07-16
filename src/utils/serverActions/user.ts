"use server";

import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "../authOptions";

// get the cuurently logined user from the session in server side

export const getCurrentUser = async () => {
  const session = await getServerSession(authOptions);
  return session?.user || null;
};

export const getAllUsers = async () => {
  try {
    await connectDB();
    const currentUser = await getCurrentUser();
    const usersWithShop = await User.aggregate([
      ...(currentUser?._id
        ? [{
          $match: { _id: { $ne: new mongoose.Types.ObjectId(currentUser?._id) } }, // Exclude current user if userId is provided
        }]
        : []),
      {
        $lookup: {
          from: "shops",
          localField: "assignedShop",
          foreignField: "_id",
          as: "shopDetails",
        },
      },
      {
        $project: {
          password: 0, // Exclude password field
        },
      },
      {
        $sort: { name: 1 },
      },
    ]);

    if (!usersWithShop || usersWithShop.length === 0) {
      return { success: false, message: "No user found", data: [] };
    }
    return { success: true, data: JSON.parse(JSON.stringify(usersWithShop)) };
  } catch (err: any) {
    console.log(err);
    return { success: false, message: err?.message || "An error occurred", data: [] }
  }
};




export const AddUser = async (data: {
  name: string;
  role: string;
  // status: string;
  username: string;
  password: string;
  gender: string;
  phoneNumber: string;
  assignedShop?: string;
}) => {
  try {
    await connectDB();
    // console.log("data", data);
    const { name, role, username, password, assignedShop, gender, phoneNumber } = data;

    const result = await User.create({
      name,
      role,
      username,
      password,
      // status,
      gender,
      assignedShop: assignedShop ? assignedShop : null,
      phoneNumber: phoneNumber ? phoneNumber : null,
    });
    // console.log("subjects", subjects);
    return { success: true, message: "User added successfullu" };;
  } catch (err: any) {
    console.log(err);
    return { success: false, message: err?.message || "An error occurred" };
  }
};

// get user by id
export const getUserById = async (id: string) => {
  try {
    await connectDB();
    const user = await User.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(id) } },
      {
        $lookup: {
          from: "shops",
          localField: "assignedShop",
          foreignField: "_id",
          as: "assignedShop"
        }
      },
      {
        $unwind: {
          path: "$assignedShop",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          password: 0 // Exclude password field
        }
      }
    ]);
    const userResult = user[0] || null;
    if (!userResult) {
      return { success: false, message: "User not found" };
    }
    return { success: true, data: JSON.parse(JSON.stringify(userResult)) };
  } catch (err: any) {
    console.log(err);
    return { success: false, message: err?.message || "An error occurred" };
  }
}


// update user
export const updateUser = async ({ userId, userData }: { userId: string, userData: any }) => {
  try {
    await connectDB();
    console.log("userData", userData);
    // Find the user by ID and update their details
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        ...userData,
      },
      { new: true } // Return the updated document
    );
    // console.log("updatedUser", updatedUser)
    if (!updatedUser) {
      return { success: false, message: "User not found" };
    }
    return { success: true, data: JSON.parse(JSON.stringify(updatedUser)) };
  } catch (err: any) {
    console.log(err);
    return { success: false, message: err?.message || "An error occurred" };
  }
}

// delete a user
export const deleteUser = async (userId: string) => {
  try {
    await connectDB();
    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser) {
      return { success: false, message: "User not found" };
    }
    return { success: true, data: JSON.parse(JSON.stringify(deletedUser)), message: "User deleted successfully" };
  } catch (err: any) {
    console.log(err);
    return { success: false, message: err?.message || "An error occurred" };
  }
}


// change password
export const changePassword = async ({ oldPassword, password }: { password: string, oldPassword: string }) => {
  try {
    await connectDB();
    const currentuser = await getCurrentUser();

    const currentUser = await User.findById(currentuser?._id).lean();
    if (!currentUser) {
      return { success: false, message: "User not found" };
    }

    const userInstance = new User(currentUser);

    const isPasswordValid = await userInstance.comparePassword(oldPassword);

    if (!isPasswordValid) {
      return { success: false, message: "Wrong Old password" };
    }

    const updatedUser = await User.findByIdAndUpdate(
      currentuser?._id,
      {
        password,
      },
      { new: true } // Return the updated document
    );
    if (!updatedUser) {
      return { success: false, message: "User not found" };
    }
    return { success: true, data: JSON.parse(JSON.stringify(updatedUser)), message: "Password changed successfully" };
  } catch (err: any) {
    console.log(err);
    return { success: false, message: err?.message || "An error occurred" };
  }
}


// reset a user password by an admin. Verify the admin password first
export const resetUserPassword = async ({ adminPassword, userId, password }: { userId: string, password: string, adminPassword: string }) => {
  try {
    await connectDB();
    const currentuser = await getCurrentUser();
    // verify to check if the requester is an admin
    const admin = await User.findById(currentuser?._id).lean();
    if (!admin) {
      return { success: false, message: "Admin not found" };
    }
    // chec if the user is an admin
    if (admin.role !== "admin") {
      return { success: false, message: "You are not an admin" };
    }
    const userInstance = new User(admin);

    const isPasswordValid = await userInstance.comparePassword(adminPassword);

    if (!isPasswordValid) {
      return { success: false, message: "Invalid admin password" };
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        password,
      },
      { new: true } // Return the updated document
    );
    // console.log("updatedUser", updatedUser)
    if (!updatedUser) {
      return { success: false, message: "User not found" };
    }
    return { success: true, data: JSON.parse(JSON.stringify(updatedUser)), message: "User password reset successfully" };
  } catch (err: any) {
    console.log(err);
    return { success: false, message: err?.message || "An error occurred" };
  }
}
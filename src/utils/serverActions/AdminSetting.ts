"use server";
import { connectDB } from "@/lib/mongodb";
import AdminSetting from "@/models/AdminSettings";

export const addAdminSetting
  = async () => {
    try {

      const batch = [
        {
          contact: ["0541164327", "0243902305", "0243829222", "0244968205"],
          email: "aquinasremedial@gmail.com",
          endOfSMS: "Contact us on: 0541164327 0243902305 0243829222 0244968205",
          startOfSMS: "This is the results of your ward for the AQ Vac classes",
        },
      ];
      // console.log("batch", batch);
      await connectDB();
      const result = await AdminSetting.insertMany(batch);
      // console.log("result", result);
      return { success: true, message: "Admin setting added successfully" };
    } catch (err: any) {
      console.log(err);
      return { success: false, message: err?.message || "An error occurred" };
    }
  };
export const getAdminSettings = async () => {
  try {
    await connectDB();
    const batches = await AdminSetting.find().sort({ createdAt: 1 });

    return { success: true, data: JSON.parse(JSON.stringify(batches[0])) };
  } catch (err: any) {
    console.log(err);
    return { success: false, message: err?.message || "An error occurred" };
  }
};


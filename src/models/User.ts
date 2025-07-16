import mongoose, { Model, Types } from "mongoose";
import bcrypt from "bcryptjs";

export type IUser = mongoose.Document & {
  _id: string;
  username: string;
  name: string;
  password: string;
  role: string;
  gender?: string;
  phoneNumber?: string;
  assignedShop?: Types.ObjectId;
  isDeleted?: boolean;
  isSuspended?: boolean;
  deleteBy?: string;

  // Add the comparePassword method to the interface
  comparePassword(password: string): Promise<boolean>;
};


const userSchema = new mongoose.Schema<IUser>(
  {
    username: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    password: { type: String, trim: true, required: true },
    role: { type: String, required: true },
    phoneNumber: { type: String, default: null },
    gender: { type: String, default: null },
    assignedShop: { type: Types.ObjectId, ref: "Shop", default: null },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    isSuspended: {
      type: Boolean,
      default: false,
    },
    deleteBy: {
      type: String,
    },
  },
  {
    timestamps: true,
    id: false,
    toJSON: {
      getters: true,
    },
    toObject: {
      getters: true,
    },
  }
);

userSchema.pre("save", async function (next) {
  try {
    const user = this as IUser;
    if (user.isModified("password")) {
      const saltRounds = parseInt(process.env.BCRYPT_SALT as string, 10) || 10;
      user.password = await bcrypt.hash(user.password, saltRounds);
    }
    return next();
  } catch (e) {
    return next(e as mongoose.CallbackError);
  }
});

// Hash password on update if password field is present
userSchema.pre("findOneAndUpdate", async function (next) {
  try {
    const update = this.getUpdate() as any;
    if (update && update.password) {
      const saltRounds = parseInt(process.env.BCRYPT_SALT as string, 10) || 10;
      update.password = await bcrypt.hash(update.password, saltRounds);
      this.setUpdate(update);
    }
    next();
  } catch (e) {
    next(e as mongoose.CallbackError);
  }
});

userSchema.methods.comparePassword = async function (password: string) {
  try {
    return await bcrypt.compare(password, this.password);
  } catch {
    return false;
  }
};

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", userSchema);

export default User;

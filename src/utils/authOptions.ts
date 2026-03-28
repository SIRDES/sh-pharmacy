import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export const authOptions: AuthOptions = {
    providers: [
        CredentialsProvider({
            id: "credentials",
            name: "Credentials",
            credentials: { email: {}, password: {} },
            async authorize(credentials) {
                try {
                    await connectDB();
                    const users = await User.aggregate([
                        {
                            $match: {
                                username: credentials?.email,
                            },
                        },
                        {
                            $lookup: {
                                from: "shops",
                                localField: "assignedShop",
                                foreignField: "_id",
                                as: "assignedShop"
                            }
                        },
                        { $unwind: { path: "$assignedShop", preserveNullAndEmptyArrays: true } },
                        {
                            $project: {
                                username: 1,
                                name: 1,
                                role: 1,
                                assignedShop: 1,
                                gender: 1,
                                phoneNumber: 1,
                                password: 1,
                                isSuspended: 1,
                                deleteBy: 1
                            },
                        },
                    ]);
                    const user = users[0] ?? null;
                    if (!user) throw new Error("Invalid username");
                    if (user.isSuspended) throw new Error("Account deactivated");

                    const userInstance = new User(user);
                    const passwordMatch = await userInstance.comparePassword(
                        credentials!.password
                    );
                    if (!passwordMatch) throw new Error("Wrong Password");

                    return {
                        id: user._id.toString(),
                        _id: user._id.toString(),
                        username: user.username,
                        name: user.name,
                        role: user.role,
                        assignedShop: user.assignedShop,
                        assignedShopDetails: user?.assignedShopDetails,
                        gender: user?.gender,
                        phoneNumber: user?.phoneNumber
                    };
                } catch (error: any) {
                    throw new Error(error.message || "Authentication failed");
                }
            },
        }),
    ],
    callbacks: {
        async session({ session, token }) {
            session.user = token as any;
            return session;
        },
        async signIn({ user }) {
            if (user && typeof user === "object" && "role" in user) {
                return true;
            }
            throw new Error(user ? user.toString() : "Unauthorized");
        },
        async jwt({ token, user }) {
            if (user) return { ...token, ...user };
            return token;
        },
    },
    pages: {
        signIn: "/login",
    },
    session: {
        strategy: "jwt",
        maxAge:
            process.env.NODE_ENV === "development"
                ? 30 * 24 * 60 * 60
                : 0.02 * 24 * 60 * 60,
    },
    jwt: {
        secret: process.env.NEXTAUTH_JWT_SECRET,
    },
    secret: process.env.NEXTAUTH_SECRET,
};

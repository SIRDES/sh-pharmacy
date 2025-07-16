"use client";
import LoadingAlert from "@/components/LoadingAlert";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function ProductDetailsLayout({
    children, }: {
        children: React.ReactNode;
    }) {
    const session = useSession();
    const router = useRouter();

    if (session?.status === "loading") {
        return <LoadingAlert open={true} />;
    }
    if (session?.status === "unauthenticated") {
        router.push("/login");
        return;
    }
    if (session?.status === "authenticated") {
        if (session?.data?.user?.role !== "admin") {
            signOut();
            return;
        }

    }
    return children
}

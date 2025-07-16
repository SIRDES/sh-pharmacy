// hooks/useAdminGuard.ts
import { useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";

export const useAdminGuard = () => {
    const { data: session, status } = useSession();
    const [allowed, setAllowed] = useState(false);

    useEffect(() => {
        if (status === "loading") return; // Don't do anything until session is ready

        const isAdmin = session?.user?.role === "admin";
        if (!isAdmin) {
            signOut(); // This redirects automatically
        } else {
            setAllowed(true);
        }
    }, [session, status]);

    return { allowed, status };
};

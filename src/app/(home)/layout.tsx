"use client";
import DashboardSideNav from "@/components/DashboardSideNav";
import LoadingAlert from "@/components/LoadingAlert";
import PageHeader from "@/components/PageHeader";
import { adminNavLists } from "@/utils/mainNavLists";
import { Box, Stack } from "@mui/material";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminLayout({
  children, }: {
    children: React.ReactNode;
  }) {
  const session = useSession();
  const router = useRouter();
  const [sideNavWidth, setSideNavWidth] = useState("247px");

  if (session?.status === "loading") {
    return <LoadingAlert open={true} />;
  }
  if (session?.status === "unauthenticated") {
    router.push("/login");
    return;
  }
  return (
    <Stack direction={{ sm: "column", md: "row" }} sx={{ minHeight: "100vh" }}>
      <DashboardSideNav
        sideNavWidth={sideNavWidth}
        setSideNavWidth={setSideNavWidth}
        userType="admin"
      // navLists={adminNavLists}
      />
      <Box
        sx={{
          marginLeft: { xs: "", md: sideNavWidth },
          transition: "ease-in-out 0.6s",
          pb: { xs: 3, md: 4 },
          width: "100%",
        }}
      >
        <PageHeader text={"Dashboard"} />
        {children}
      </Box>
    </Stack>
  );
}

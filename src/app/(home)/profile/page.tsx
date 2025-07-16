"use client";
import React from "react";

import {
  Box,
  Typography,
  CircularProgress,
  Stack,
  Tabs,
  Tab,
  Grid,
  Paper,
  Button,
} from "@mui/material";
import NoProfileImage from "../../assets/noProfileImage.jpg";
// import { useAuth } from "../../context/AuthContext";
import { getRoleText } from "@/types/constants";
import { useSession } from "next-auth/react";
import Link from "next/link";

const General = () => {
  const { data: session } = useSession();
  const staffDetails = session?.user;
  return (
    <Stack spacing={4} mb={2} mt={2} px={{ xs: 1, sm: 2, md: 3 }}>
      <Paper
        sx={{
          width: "100%",
          position: "relative",
          borderRadius: "10px",
          padding: "1.5rem",
          background: "#fff",
          border: "1px solid #ddd",
        }}
        elevation={0}
      >
        <Stack spacing={3}>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="h6" sx={{ fontWeight: 500 }}>User Information</Typography>
            <Button variant="contained" size="small" component={Link} href="/profile/edit">edit</Button>
          </Box>
          <Grid
            container
            columns={12}
            sx={{ fontSize: "16px", color: "#000" }}
            spacing={3}
          >
            <Grid size={{ xs: 12, sm: 3, }}>
              <Stack>
                <Typography
                  variant="subtitle1"
                  component="h3"
                  sx={{
                    color: "#000", // Black color
                    fontWeight: 500, // Boldness of 500
                  }}
                >
                  Name
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: "#666", // Grey color
                  }}
                >
                  {staffDetails?.name}
                </Typography>
              </Stack>
            </Grid>


            <Grid size={{ xs: 12, sm: 3, }}>
              <Stack>
                <Typography
                  variant="subtitle1"
                  component="h3"
                  sx={{
                    color: "#000", // Black color
                    fontWeight: 500, // Boldness of 500
                  }}
                >
                  Username
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: "#666", // Grey color
                  }}
                >
                  {staffDetails?.username}
                </Typography>
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, sm: 3, }}>
              <Stack>
                <Typography>Gender</Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: "#666", // Grey color
                  }}
                >
                  {staffDetails?.gender}
                </Typography>
              </Stack>
            </Grid>
            <Grid size={{ xs: 12, sm: 3, }}>
              <Stack>
                <Typography>Contact</Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: "#666", // Grey color
                  }}
                >
                  {staffDetails?.phoneNumber}
                </Typography>
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, sm: 3, }}>
              <Stack>
                <Typography>Status</Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: "#666", // Grey color
                  }}
                >
                  {staffDetails?.isSuspended ? "inactive" : "active"}
                </Typography>
              </Stack>
            </Grid>
            <Grid size={{ xs: 12, sm: 3, }}>
              <Stack>
                <Typography>Role</Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: "#666", // Grey color
                  }}
                >
                  {staffDetails?.role}
                </Typography>
              </Stack>
            </Grid>
            <Grid size={{ xs: 12, sm: 3, }}>
              <Stack>
                <Typography>Shop</Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: "#666", // Grey color
                  }}
                >
                  {staffDetails?.assignedShop?.name?.toUpperCase() || "N/A"}
                </Typography>
              </Stack>
            </Grid>
          </Grid>
        </Stack>
      </Paper>
    </Stack>
  );
};


export default General;

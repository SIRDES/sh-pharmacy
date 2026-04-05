"use client"

import * as React from 'react';
import { useTheme } from '@mui/material/styles';
import AppBar from '@mui/material/AppBar';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import ArrowUpwardIcon from "@mui/icons-material/ArrowBack";
import Link from 'next/link';
import AllDrafts from '@/components/sales/AllDrafts';
import EditDraft from '@/components/sales/EditDraft';
import AddNewOrder from '@/components/sales/AddOrder';

interface TabPanelProps {
  children?: React.ReactNode;
  dir?: string;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      // hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `full-width-tab-${index}`,
    'aria-controls': `full-width-tabpanel-${index}`,
  };
}

export default function AddSalesPage() {
  const theme = useTheme();
  const [value, setValue] = React.useState(0);
  const [editDraftId, setEditDraftId] = React.useState<string | null>(null)
  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const handleEditDraft = (selectedDraftId: string) => {
    setValue(2)
    setEditDraftId(selectedDraftId)
  }

  return (
    <>
      <Box mb={1} mt={1} px={{ xs: 1, sm: 2, md: 3 }}>
        <Link
          href="/sales"
          style={{
            textDecoration: "none",
            color: "black",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "5px",
            }}
          >
            <ArrowUpwardIcon />
            Sales
          </Box>
        </Link>
      </Box>
      {/* <Divider /> */}
      <Box mb={1} mt={1} sx={{ height: '100%' }}>
        <AppBar position="static">
          <Tabs
            value={value}
            onChange={handleChange}
            indicatorColor="secondary"
            textColor="inherit"
          // variant="fullWidth"
          >
            <Tab label="New Sales" {...a11yProps(0)} />
            <Tab label="All Drafts" {...a11yProps(1)} />
            <Tab label="Edit Draft" {...a11yProps(2)} disabled />
          </Tabs>
        </AppBar>
        <TabPanel value={value} index={0} dir={theme.direction}>
          <AddNewOrder />
        </TabPanel>
        <TabPanel value={value} index={1} dir={theme.direction}>
          <AllDrafts handleEditDraft={handleEditDraft} />
        </TabPanel>
        <TabPanel value={value} index={2} dir={theme.direction}>
          <EditDraft draftId={editDraftId} handleGoToDrafts={() => setValue(1)} />
        </TabPanel>
      </Box></>
  );
}

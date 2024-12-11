import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import VideocamIcon from "@mui/icons-material/Videocam";
import LogoutIcon from "@mui/icons-material/Logout";
import MenuIcon from "@mui/icons-material/Menu";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setMobileOpen(false); // Close drawer after navigation on mobile
  };

  const handleLogout = () => {
    // Remove token or cookies (example with localStorage and cookies)
    localStorage.removeItem("token"); // Assuming the token is stored in localStorage
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/"; // Clear cookie if set
    // Redirect to registration page
    navigate("/Registration");
  };

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ width: 250 }}>
      <List>
        <ListItem onClick={() => handleNavigation("/home")}>
          <ListItemIcon>
            <HomeIcon sx={{ color: "#075E54" }} />
          </ListItemIcon>
          <ListItemText primary="Home" />
        </ListItem>

        <ListItem onClick={() => handleNavigation("/videoChat")}>
          <ListItemIcon>
            <VideocamIcon sx={{ color: "#075E54" }} />
          </ListItemIcon>
          <ListItemText primary="Video Chat" />
        </ListItem>

        <ListItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon sx={{ color: "#075E54" }} />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" sx={{ backgroundColor: "#075E54" }}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={handleDrawerToggle}
            sx={{ display: { xs: "block", sm: "none" } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1, display: { xs: "none", sm: "block" } }}
          >
            E2M Solutions
          </Typography>
          <Box sx={{ display: { xs: "none", sm: "flex" } }}>
            <IconButton color="inherit" onClick={handleLogout}>
              <LogoutIcon />
              <Typography sx={{ ml: 1 }}>Logout</Typography>
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      <Drawer
        anchor="left"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true
        }}
        sx={{
          display: { xs: "block", sm: "none" },
          "& .MuiDrawer-paper": { boxSizing: "border-box", width: 250 }
        }}
      >
        {drawer}
      </Drawer>
    </Box>
  );
};

export default Navbar;

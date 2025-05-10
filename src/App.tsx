import { BrowserRouter, Route, Routes } from "react-router-dom"
import HomePage from "./pages/HomePage"
import { ThemeProvider } from "@emotion/react"
import { useState } from "react"
import { darkTheme, lightTheme } from "./common/theme";
import { AppBar, Box, CssBaseline, IconButton, Switch, Toolbar, Typography } from "@mui/material";
import Brightness7Icon from '@mui/icons-material/Brightness7';
import Brightness4Icon from '@mui/icons-material/Brightness4';

function App() {
  const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem("theme") !== "light");
  const handleThemeChange = () => {
    setIsDarkMode((v) => {
      localStorage.setItem("theme", !v ? "dark" : "light");
      return !v;
    }); 
  };

  return (
    <>
      <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
        <CssBaseline />

        <Box
            sx={{
                position: 'relative',
                minHeight: '100vh',
                bgcolor: 'transparent',
                overflow: 'hidden',
                display: 'flex',
            }}
        >
          <Box
            component="main"
            sx={{
                flexGrow: 1,
                p: 0,
                position: 'relative',
                zIndex: 1,
                backgroundColor: 'transparent',
            }}
          >
            <AppBar position="static" elevation={0} style={{ borderLeft: 'none' }}>
              <Toolbar>
                  <Typography variant="h5" sx={{ flexGrow: 1 }}>
                      Shortener Dashboard
                  </Typography>
                  <IconButton onClick={handleThemeChange} color="inherit">
                      {isDarkMode ? <Brightness7Icon /> : <Brightness4Icon />}
                  </IconButton>
                  <Switch
                      checked={isDarkMode}
                      onChange={handleThemeChange}
                      color="secondary"
                  />
              </Toolbar>
            </AppBar>
          
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<HomePage />} />
              </Routes>
            </BrowserRouter>
          </Box>
        </Box>
      </ThemeProvider>
    </>
  )
}

export default App

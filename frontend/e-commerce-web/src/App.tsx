import React from 'react';
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Container,
  Box,
  AppBar,
  Toolbar,
  Typography,
  Tabs,
  Tab,
  Paper,
} from '@mui/material';
import {
  Inventory as InventoryIcon,
  ShoppingCart as ShoppingCartIcon,
  Store as StoreIcon,
} from '@mui/icons-material';
import ProductList from './components/products/ProductList';
import OrderList from './components/orders/OrderList';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
      light: '#4791db',
      dark: '#115293',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
});

function App() {
  const [currentTab, setCurrentTab] = React.useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
        <AppBar position="static" elevation={0}>
          <Toolbar sx={{ py: 1 }}>
            <StoreIcon sx={{ mr: 2, fontSize: 32 }} />
            <Typography variant="h5" component="h1" sx={{ flexGrow: 1, fontWeight: 700 }}>
              E-Commerce Manager
            </Typography>
          </Toolbar>
        </AppBar>

        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Paper elevation={1} sx={{ mb: 3, overflow: 'hidden' }}>
            <Tabs
              value={currentTab}
              onChange={handleTabChange}
              variant="fullWidth"
              sx={{
                borderBottom: 1,
                borderColor: 'divider',
              }}
            >
              <Tab
                icon={<InventoryIcon />}
                label="Products"
                iconPosition="start"
                sx={{
                  textTransform: 'none',
                  fontSize: '1rem',
                  fontWeight: 600,
                  py: 2,
                }}
              />
              <Tab
                icon={<ShoppingCartIcon />}
                label="Orders"
                iconPosition="start"
                sx={{
                  textTransform: 'none',
                  fontSize: '1rem',
                  fontWeight: 600,
                  py: 2,
                }}
              />
            </Tabs>
          </Paper>

          <Box sx={{ mt: 3 }}>
            {currentTab === 0 && <ProductList />}
            {currentTab === 1 && <OrderList />}
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import QuoteManagement from './pages/QuoteManagement';
import PaymentManagement from './pages/PaymentManagement';
import ContractManagement from './pages/ContractManagement';
import ScheduleManagement from './pages/ScheduleManagement';
import ReviewManagement from './pages/ReviewManagement';
import ChatMonitoring from './pages/ChatMonitoring';
import Layout from './components/Layout';

const theme = createTheme({
  palette: {
    primary: {
      main: '#007AFF',
    },
    secondary: {
      main: '#4CAF50',
    },
  },
});

function App() {
  const isAuthenticated = localStorage.getItem('adminToken');

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route
            path="/login"
            element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />}
          />
          <Route
            path="/"
            element={
              isAuthenticated ? (
                <Layout>
                  <Routes>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/quotes" element={<QuoteManagement />} />
                    <Route path="/payments" element={<PaymentManagement />} />
                    <Route path="/contracts" element={<ContractManagement />} />
                    <Route path="/schedules" element={<ScheduleManagement />} />
                    <Route path="/reviews" element={<ReviewManagement />} />
                    <Route path="/chats" element={<ChatMonitoring />} />
                    <Route path="/" element={<Navigate to="/dashboard" />} />
                  </Routes>
                </Layout>
              ) : (
                <Navigate to="/login" />
              )
            }
          />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
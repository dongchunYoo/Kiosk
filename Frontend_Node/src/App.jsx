import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardLayout from './components/DashboardLayout';
import HomePage from './pages/HomePage';
import StoresPage from './pages/StoresPage';
import UsersPage from './pages/UsersPage';
import ProductsPage from './pages/ProductsPage';
import LicensesPage from './pages/LicensesPage';
import SalesPage from './pages/SalesPage';
import './index.css';

const App = () => {
  // A simple check for JWT token
  const isAuthenticated = !!localStorage.getItem('jwt_token');

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={isAuthenticated ? <DashboardLayout /> : <Navigate to="/login" />}
        >
          <Route index element={<HomePage />} />
          <Route path="stores" element={<StoresPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="products/:storeId" element={<ProductsPage />} />
          <Route path="licenses/:storeId" element={<LicensesPage />} />
          <Route path="sales" element={<SalesPage />} />
        </Route>
        {/* If authenticated and trying to access a non-defined route, redirect to home */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default App;

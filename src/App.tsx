import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { NavBar } from './components/NavBar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { ProfilePage } from './pages/ProfilePage';
import { SellPage } from './pages/sell/SellPage';
import { ProductPage } from './pages/buy/ProductPage';
import { JobsPage } from './pages/jobs/JobsPage';
import { JobPage } from './pages/jobs/JobPage';
import { PostJobPage } from './pages/jobs/PostJobPage';
import { ServicesPage } from './pages/services/ServicesPage';
import { PostServicePage } from './pages/services/PostServicePage';
import { ServicePage } from './pages/services/ServicePage';
import { BuyPage } from './pages/buy/BuyPage';
import { SearchPage } from './pages/SearchPage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <CurrencyProvider>
          <div className="flex flex-col min-h-screen">
            <NavBar />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/sell" element={<SellPage />} />
                <Route path="/buy/:id" element={<ProductPage />} />
                <Route path="/jobs" element={<JobsPage />} />
                <Route path="/jobs/:id" element={<JobPage />} />
                <Route path="/post-job" element={<PostJobPage />} />
                <Route path="/services" element={<ServicesPage />} />
                <Route path="/services/:id" element={<ServicePage />} />
                <Route path="/post-service" element={<PostServicePage />} />
                <Route path='/buy' element={<BuyPage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
          </div>
          <Toaster position="top-center" />
        </CurrencyProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
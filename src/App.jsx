import React, { useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { ScrollToTop } from './components/ui/ScrollToTop';
import { AppRoutes } from './routes/AppRoutes';
import { SplashScreen } from './pages/auth/SplashScreen';

export function App() {
  const [showSplash, setShowSplash] = useState(() => {
    // Show splash screen once per browser session on initial load
    return !sessionStorage.getItem('cmcart_splash_shown');
  });

  const handleSplashFinish = () => {
    sessionStorage.setItem('cmcart_splash_shown', 'true');
    setShowSplash(false);
  };

  return (
    <BrowserRouter>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <CartProvider>
              <WishlistProvider>
                <ScrollToTop />
                {showSplash && <SplashScreen onFinish={handleSplashFinish} />}
                <AppRoutes />
              </WishlistProvider>
            </CartProvider>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;

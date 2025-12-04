import React from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

interface AppLayoutProps {
  children: React.ReactNode;
  showFooter?: boolean;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ 
  children, 
  showFooter = true 
}) => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 pt-24">
        {children}
      </main>
      {showFooter && <Footer />}
    </div>
  );
};

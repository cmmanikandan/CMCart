import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ShoppingBag, ShieldCheck, Truck } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();

  const screens = [
    {
      title: 'Best Products. Best Prices.',
      subtitle: 'Discover millions of genuine products across electronics, fashion, and home with unbeatable daily deals.',
      icon: ShoppingBag,
      image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&auto=format&fit=crop&q=80',
    },
    {
      title: 'Fast & Secure Shopping',
      subtitle: 'Seamless 1-click checkout with trusted UPI, cards, and bank-grade payment encryption.',
      icon: ShieldCheck,
      image: 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?w=800&auto=format&fit=crop&q=80',
    },
    {
      title: 'Delivered To Your Doorstep',
      subtitle: 'Lightning-fast delivery with live real-time milestone tracking right from fulfillment to your door.',
      icon: Truck,
      image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop&q=80',
    },
  ];

  const handleNext = () => {
    if (currentStep < screens.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      localStorage.setItem('cmcart_onboarded', 'true');
      navigate('/login');
    }
  };

  const handleSkip = () => {
    localStorage.setItem('cmcart_onboarded', 'true');
    navigate('/login');
  };

  const activeScreen = screens[currentStep];

  return (
    <div className="min-h-screen bg-white dark:bg-[#111111] text-[#171717] dark:text-[#F5F5F5] flex flex-col justify-between p-6 sm:p-10 select-none max-w-md mx-auto">
      {/* Top Header with Skip */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="CMCart" className="w-8 h-8 object-contain" />
          <span className="font-extrabold text-lg">CM<span className="text-[#E63946]">Cart</span></span>
        </div>
        <button
          onClick={handleSkip}
          className="text-xs font-semibold text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
        >
          Skip
        </button>
      </div>

      {/* Screen Graphic & Content */}
      <div className="my-auto py-6 flex flex-col items-center text-center">
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-3xl overflow-hidden shadow-lg border border-neutral-100 dark:border-neutral-800 mb-8">
          <img
            src={activeScreen.image}
            alt={activeScreen.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent flex items-end justify-center pb-4">
            <div className="w-12 h-12 rounded-full bg-white text-[#E63946] flex items-center justify-center shadow-md">
              <activeScreen.icon className="w-6 h-6" />
            </div>
          </div>
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-3">
          {activeScreen.title}
        </h2>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-xs leading-relaxed">
          {activeScreen.subtitle}
        </p>
      </div>

      {/* Bottom Controls: Dots & CTA */}
      <div className="flex flex-col gap-6">
        {/* Pagination Dots */}
        <div className="flex items-center justify-center gap-2">
          {screens.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all duration-300 ${
                currentStep === index ? 'w-8 bg-[#E63946]' : 'w-2 bg-neutral-200 dark:bg-neutral-800'
              }`}
            />
          ))}
        </div>

        {/* CTA Button */}
        <Button
          onClick={handleNext}
          variant="primary"
          size="lg"
          className="w-full"
          icon={ArrowRight}
          iconPosition="right"
        >
          {currentStep === screens.length - 1 ? 'Get Started' : 'Next'}
        </Button>
      </div>
    </div>
  );
}

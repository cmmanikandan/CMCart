import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  HelpCircle,
  Phone,
  Mail,
  MessageSquare,
  Truck,
  RotateCcw,
  ShieldCheck,
  ChevronDown,
  ArrowLeft
} from 'lucide-react';
import { Button } from '../../components/ui/Button';

export function HelpPage() {
  const [openFaq, setOpenFaq] = useState(0);

  const faqs = [
    {
      q: 'How do I track my CMCart order?',
      a: 'You can track your order status in real time by going to the "My Orders" tab and clicking "Track Order". We provide live milestone updates from packaging to delivery.'
    },
    {
      q: 'What is the return & replacement policy?',
      a: 'We offer an easy 7-day hassle-free doorstep return and exchange policy for all eligible products. Simply raise a request under My Orders.'
    },
    {
      q: 'Are the products authentic and original?',
      a: 'Yes, 100% of our inventory is sourced directly from certified authorized brand distributors with genuine manufacturer warranty.'
    },
    {
      q: 'What payment methods does CMCart support?',
      a: 'We accept UPI (Google Pay, PhonePe, Paytm, BHIM), Credit/Debit Cards (Visa, Mastercard, RuPay), Net Banking, and Cash on Delivery (COD).'
    },
    {
      q: 'How do I apply promotional coupon codes?',
      a: 'On the Shopping Cart page or Checkout review step, enter your coupon code into the "Apply Coupon" field and click Apply to see instant price deductions.'
    }
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      <div className="flex items-center gap-2">
        <Link to="/profile" className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-neutral-100">
            Help & Customer Support
          </h1>
          <p className="text-xs text-neutral-500">We're here 24/7 to help you with your shopping experience.</p>
        </div>
      </div>

      {/* Support Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#181818] p-5 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 text-center space-y-2">
          <div className="w-10 h-10 rounded-xl bg-[#E63946]/10 text-[#E63946] flex items-center justify-center mx-auto">
            <Phone className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">Toll-Free Helpline</h3>
          <p className="text-xs text-[#E63946] font-bold">1800-CMC-SHOP (262-7467)</p>
          <p className="text-[11px] text-neutral-400">Available Mon-Sun, 8 AM - 10 PM</p>
        </div>

        <div className="bg-white dark:bg-[#181818] p-5 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 text-center space-y-2">
          <div className="w-10 h-10 rounded-xl bg-[#E63946]/10 text-[#E63946] flex items-center justify-center mx-auto">
            <Mail className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">Email Support</h3>
          <p className="text-xs text-[#E63946] font-bold">care@cmcart.com</p>
          <p className="text-[11px] text-neutral-400">Responses within 2-4 hours</p>
        </div>

        <div className="bg-white dark:bg-[#181818] p-5 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 text-center space-y-2">
          <div className="w-10 h-10 rounded-xl bg-[#E63946]/10 text-[#E63946] flex items-center justify-center mx-auto">
            <MessageSquare className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">Live Chat Assistant</h3>
          <p className="text-xs text-[#16A34A] font-bold">Online & Active</p>
          <p className="text-[11px] text-neutral-400">Instant AI & Agent resolutions</p>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div className="bg-white dark:bg-[#181818] p-6 sm:p-8 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 space-y-4">
        <h3 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-neutral-100 mb-2">
          Frequently Asked Questions
        </h3>

        <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
          {faqs.map((faq, idx) => (
            <div key={idx} className="py-3.5">
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full flex items-center justify-between text-left gap-4 font-semibold text-xs sm:text-sm text-neutral-900 dark:text-neutral-100 cursor-pointer"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-neutral-400 shrink-0 transition-transform ${
                    openFaq === idx ? 'rotate-180 text-[#E63946]' : ''
                  }`}
                />
              </button>
              {openFaq === idx && (
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2 leading-relaxed pl-1">
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

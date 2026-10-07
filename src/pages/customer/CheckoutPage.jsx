import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  MapPin,
  CreditCard,
  CheckCircle2,
  Plus,
  ShieldCheck,
  ChevronRight,
  ArrowRight,
  Smartphone,
  Building,
  Banknote,
  Truck
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { commerceDb } from '../../services/supabase/supabaseClient';

export function CheckoutPage() {
  const { cartItems, totalAmount, subtotal, discountAmount, deliveryFee, taxAmount, clearCart } = useCart();
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1: Address, 2: Payment, 3: Review
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('UPI'); // 'UPI' | 'Card' | 'Net Banking' | 'Cash on Delivery'
  const [upiId, setUpiId] = useState('rahul@okaxis');
  const [cardDetails, setCardDetails] = useState({
    number: '4532 •••• •••• 8812',
    name: 'Rahul Sharma',
    expiry: '10/28',
    cvv: '•••'
  });
  const [placingOrder, setPlacingOrder] = useState(false);

  // New Address Modal state
  const [showAddAddressModal, setShowAddAddressModal] = useState(false);
  const [newAddr, setNewAddr] = useState({
    full_name: '',
    phone: '',
    address_line: '',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560038',
    type: 'Home'
  });

  useEffect(() => {
    commerceDb.getAddresses().then((list) => {
      setAddresses(list);
      const defaultAddr = list.find((a) => a.is_default) || list[0];
      if (defaultAddr) setSelectedAddressId(defaultAddr.id);
    });
  }, []);

  const handleSaveNewAddress = async (e) => {
    e.preventDefault();
    if (!newAddr.full_name || !newAddr.phone || !newAddr.address_line) {
      showToast('Please fill all mandatory fields', 'error');
      return;
    }
    const created = await commerceDb.addAddress(newAddr);
    setAddresses([...addresses, created]);
    setSelectedAddressId(created.id);
    setShowAddAddressModal(false);
    showToast('New address added!', 'success');
  };

  const handlePlaceOrder = async () => {
    const selectedAddress = addresses.find((a) => a.id === selectedAddressId);
    if (!selectedAddress) {
      showToast('Please select a delivery address', 'error');
      setStep(1);
      return;
    }

    setPlacingOrder(true);
    try {
      // Simulate Razorpay / Gateway authorization
      await new Promise((r) => setTimeout(r, 900));

      const newOrder = await commerceDb.createOrder({
        shipping_address: selectedAddress,
        items: cartItems.map((item) => ({
          id: item.id,
          product_id: item.productId,
          product_name: item.name,
          variant: item.variant,
          unit_price: item.price,
          quantity: item.quantity,
          image: item.image,
          total: item.price * item.quantity
        })),
        subtotal: subtotal,
        discount_amount: discountAmount || 0,
        delivery_fee: deliveryFee,
        tax_amount: taxAmount,
        total_amount: totalAmount,
        payment_method: paymentMethod,
        payment_status: paymentMethod === 'Cash on Delivery' ? 'Pending' : 'Completed'
      });

      // Trigger victory celebratory confetti!
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // Safe fallback
      }

      clearCart();
      showToast('Order placed successfully!', 'success');
      navigate(`/order/${newOrder.id}/tracking`);
    } catch {
      showToast('Failed to place order. Please try again.', 'error');
    } finally {
      setPlacingOrder(false);
    }
  };

  if (cartItems.length === 0 && !placingOrder) {
    return (
      <div className="text-center py-20 bg-white dark:bg-[#181818] rounded-2xl border p-8">
        <h2 className="text-xl font-bold mb-2">No items to checkout</h2>
        <p className="text-sm text-neutral-500 mb-6">Your shopping cart is currently empty.</p>
        <Link to="/products">
          <Button variant="primary" size="md">Continue Shopping</Button>
        </Link>
      </div>
    );
  }

  const selectedAddress = addresses.find((a) => a.id === selectedAddressId);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-20 md:pb-10">
      {/* Checkout Progress Stepper */}
      <div className="bg-white dark:bg-[#181818] p-4 sm:p-6 rounded-2xl border border-neutral-200/80 dark:border-neutral-800">
        <div className="flex items-center justify-between max-w-xl mx-auto">
          {[
            { num: 1, label: 'Delivery Address' },
            { num: 2, label: 'Payment Method' },
            { num: 3, label: 'Order Review' }
          ].map((s, idx) => (
            <React.Fragment key={s.num}>
              <div
                onClick={() => setStep(s.num)}
                className={`flex items-center gap-2 cursor-pointer select-none ${
                  step === s.num
                    ? 'text-[#E63946] font-bold'
                    : step > s.num
                    ? 'text-[#16A34A] font-semibold'
                    : 'text-neutral-400 font-medium'
                }`}
              >
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold border-2 transition-all ${
                    step === s.num
                      ? 'border-[#E63946] bg-[#E63946] text-white shadow-xs'
                      : step > s.num
                      ? 'border-[#16A34A] bg-[#16A34A] text-white'
                      : 'border-neutral-300 dark:border-neutral-700 bg-transparent text-neutral-400'
                  }`}
                >
                  {step > s.num ? '✓' : s.num}
                </div>
                <span className="text-xs sm:text-sm hidden sm:inline">{s.label}</span>
              </div>
              {idx < 2 && (
                <div className={`flex-1 h-0.5 mx-2 sm:mx-4 ${step > idx + 1 ? 'bg-[#16A34A]' : 'bg-neutral-200 dark:bg-neutral-800'}`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Steps Content (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* STEP 1: Address Selection */}
          {step === 1 && (
            <div className="bg-white dark:bg-[#181818] rounded-2xl border border-neutral-200/80 dark:border-neutral-800 p-5 sm:p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                    Select Delivery Address
                  </h2>
                  <p className="text-xs text-neutral-500">Where should we deliver your order?</p>
                </div>
                <Button
                  onClick={() => setShowAddAddressModal(true)}
                  variant="outline"
                  size="sm"
                  icon={Plus}
                >
                  Add New
                </Button>
              </div>

              <div className="space-y-3">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    onClick={() => setSelectedAddressId(addr.id)}
                    className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-start gap-3.5 ${
                      selectedAddressId === addr.id
                        ? 'border-[#E63946] bg-[#E63946]/5'
                        : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="deliveryAddress"
                      checked={selectedAddressId === addr.id}
                      onChange={() => setSelectedAddressId(addr.id)}
                      className="mt-1 w-4 h-4 text-[#E63946] focus:ring-[#E63946]"
                    />
                    <div className="flex-1 text-xs sm:text-sm">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-neutral-900 dark:text-neutral-100">{addr.full_name}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 uppercase">
                          {addr.type}
                        </span>
                        {addr.is_default && (
                          <span className="text-[10px] text-[#E63946] font-semibold">DEFAULT</span>
                        )}
                      </div>
                      <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed">{addr.address_line}</p>
                      <p className="text-neutral-600 dark:text-neutral-300">{addr.city}, {addr.state} - {addr.pincode}</p>
                      <p className="text-neutral-500 text-xs mt-1.5 font-medium">Contact: {addr.phone}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  onClick={() => setStep(2)}
                  variant="primary"
                  size="md"
                  icon={ArrowRight}
                  iconPosition="right"
                >
                  Deliver to this Address
                </Button>
              </div>
            </div>
          )}

          {/* STEP 2: Payment Options */}
          {step === 2 && (
            <div className="bg-white dark:bg-[#181818] rounded-2xl border border-neutral-200/80 dark:border-neutral-800 p-5 sm:p-6 space-y-6">
              <div className="border-b border-neutral-100 dark:border-neutral-800 pb-4">
                <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                  Select Payment Method
                </h2>
                <p className="text-xs text-neutral-500">All transactions are encrypted and secured.</p>
              </div>

              {/* Payment Methods Tabs */}
              <div className="space-y-3">
                {[
                  {
                    id: 'UPI',
                    name: 'UPI (Google Pay, PhonePe, Paytm, BHIM)',
                    icon: Smartphone,
                    desc: 'Pay directly from your bank via any UPI app with 0% extra fee'
                  },
                  {
                    id: 'Card',
                    name: 'Credit / Debit Card',
                    icon: CreditCard,
                    desc: 'Visa, Mastercard, RuPay & American Express accepted'
                  },
                  {
                    id: 'Net Banking',
                    name: 'Net Banking',
                    icon: Building,
                    desc: 'All major Indian retail banks supported'
                  },
                  {
                    id: 'Cash on Delivery',
                    name: 'Cash on Delivery (COD)',
                    icon: Banknote,
                    desc: 'Pay in cash or QR code scan upon doorstep delivery'
                  }
                ].map((m) => {
                  const Icon = m.icon;
                  return (
                    <div
                      key={m.id}
                      onClick={() => setPaymentMethod(m.id)}
                      className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                        paymentMethod === m.id
                          ? 'border-[#E63946] bg-[#E63946]/5'
                          : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="paymentMethodRadio"
                          checked={paymentMethod === m.id}
                          onChange={() => setPaymentMethod(m.id)}
                          className="w-4 h-4 text-[#E63946] focus:ring-[#E63946]"
                        />
                        <Icon className="w-5 h-5 text-[#E63946]" />
                        <div className="flex-1">
                          <span className="font-bold text-xs sm:text-sm text-neutral-900 dark:text-neutral-100 block">
                            {m.name}
                          </span>
                          <span className="text-[11px] text-neutral-500">{m.desc}</span>
                        </div>
                      </div>

                      {/* Extended Config for selected method */}
                      {paymentMethod === 'UPI' && m.id === 'UPI' && (
                        <div className="mt-3.5 pt-3 border-t border-neutral-200/60 dark:border-neutral-700/60 pl-7 space-y-2">
                          <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-300 block">
                            Enter UPI ID:
                          </label>
                          <div className="flex gap-2 max-w-sm">
                            <input
                              type="text"
                              value={upiId}
                              onChange={(e) => setUpiId(e.target.value)}
                              placeholder="username@upi"
                              className="flex-1 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-[#E63946]"
                            />
                            <span className="text-xs font-semibold text-[#16A34A] flex items-center gap-1">
                              ✓ Verified
                            </span>
                          </div>
                        </div>
                      )}

                      {paymentMethod === 'Card' && m.id === 'Card' && (
                        <div className="mt-3.5 pt-3 border-t border-neutral-200/60 dark:border-neutral-700/60 pl-7 space-y-3 max-w-md">
                          <div>
                            <label className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-300 block mb-1">
                              Card Number
                            </label>
                            <input
                              type="text"
                              value={cardDetails.number}
                              readOnly
                              className="w-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg px-3 py-1.5 text-xs font-mono"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-300 block mb-1">
                                Expiry (MM/YY)
                              </label>
                              <input
                                type="text"
                                value={cardDetails.expiry}
                                readOnly
                                className="w-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg px-3 py-1.5 text-xs font-mono"
                              />
                            </div>
                            <div>
                              <label className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-300 block mb-1">
                                CVV
                              </label>
                              <input
                                type="password"
                                value={cardDetails.cvv}
                                readOnly
                                className="w-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg px-3 py-1.5 text-xs font-mono"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-between pt-2">
                <Button onClick={() => setStep(1)} variant="outline" size="md">
                  Back to Address
                </Button>
                <Button
                  onClick={() => setStep(3)}
                  variant="primary"
                  size="md"
                  icon={ArrowRight}
                  iconPosition="right"
                >
                  Review Order
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: Review Order & Place */}
          {step === 3 && (
            <div className="bg-white dark:bg-[#181818] rounded-2xl border border-neutral-200/80 dark:border-neutral-800 p-5 sm:p-6 space-y-6">
              <div className="border-b border-neutral-100 dark:border-neutral-800 pb-4">
                <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                  Review & Confirm Order
                </h2>
                <p className="text-xs text-neutral-500">Please verify your items, address and payment.</p>
              </div>

              {/* Delivery Address Summary */}
              {selectedAddress && (
                <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-700/60 flex items-start justify-between">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 block mb-1">
                      Shipping To:
                    </span>
                    <p className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                      {selectedAddress.full_name} ({selectedAddress.type})
                    </p>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5">
                      {selectedAddress.address_line}, {selectedAddress.city}, {selectedAddress.state} - {selectedAddress.pincode}
                    </p>
                    <p className="text-xs text-neutral-500 mt-1">Phone: {selectedAddress.phone}</p>
                  </div>
                  <button
                    onClick={() => setStep(1)}
                    className="text-xs font-bold text-[#E63946] hover:underline"
                  >
                    Change
                  </button>
                </div>
              )}

              {/* Payment Summary */}
              <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-700/60 flex items-start justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 block mb-1">
                    Payment Method:
                  </span>
                  <p className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                    {paymentMethod}
                  </p>
                  <p className="text-xs text-[#16A34A] font-semibold mt-0.5">
                    Ready to complete order safely
                  </p>
                </div>
                <button
                  onClick={() => setStep(2)}
                  className="text-xs font-bold text-[#E63946] hover:underline"
                >
                  Change
                </button>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 block">
                  Items Ordered ({cartItems.length})
                </span>
                <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                  {cartItems.map((item) => (
                    <div key={item.id} className="py-2.5 flex items-center justify-between gap-3 text-xs sm:text-sm">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-10 h-10 rounded-lg object-cover bg-neutral-100 shrink-0"
                        />
                        <div className="truncate">
                          <p className="font-semibold text-neutral-800 dark:text-neutral-200 truncate">{item.name}</p>
                          <p className="text-neutral-500 text-[11px]">Qty: {item.quantity} {item.variant !== 'Default' ? `• ${item.variant}` : ''}</p>
                        </div>
                      </div>
                      <span className="font-bold shrink-0">
                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between pt-2">
                <Button onClick={() => setStep(2)} variant="outline" size="md">
                  Back to Payment
                </Button>
                <Button
                  onClick={handlePlaceOrder}
                  loading={placingOrder}
                  variant="primary"
                  size="lg"
                  className="min-w-[180px]"
                >
                  Place Order (₹{totalAmount.toLocaleString('en-IN')})
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Price Summary Box (4 cols) */}
        <div className="lg:col-span-4 bg-white dark:bg-[#181818] rounded-2xl border border-neutral-200/80 dark:border-neutral-800 p-5 sm:p-6 space-y-4 sticky top-24">
          <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100 border-b border-neutral-100 dark:border-neutral-800 pb-3">
            Payment Summary
          </h3>

          <div className="space-y-2 text-xs sm:text-sm">
            <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
              <span>Items Total</span>
              <span>₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-[#16A34A] font-semibold">
                <span>Discount Saved</span>
                <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
              <span>Delivery Fee</span>
              {deliveryFee === 0 ? (
                <span className="text-[#16A34A] font-semibold">FREE</span>
              ) : (
                <span>₹{deliveryFee}</span>
              )}
            </div>
            <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
              <span>Taxes (18% GST)</span>
              <span>₹{taxAmount.toLocaleString('en-IN')}</span>
            </div>
            <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex justify-between text-base font-black text-neutral-900 dark:text-neutral-100">
              <span>Total Payable</span>
              <span>₹{totalAmount.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="pt-2 text-[11px] text-neutral-400 flex items-center justify-center gap-1.5 text-center">
            <ShieldCheck className="w-4 h-4 text-[#16A34A] shrink-0" />
            <span>Guaranteed Safe Checkout</span>
          </div>
        </div>
      </div>

      {/* Add Address Modal */}
      <Modal
        isOpen={showAddAddressModal}
        onClose={() => setShowAddAddressModal(false)}
        title="Add New Delivery Address"
      >
        <form onSubmit={handleSaveNewAddress} className="space-y-4 text-xs sm:text-sm">
          <div>
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
              Recipient Name *
            </label>
            <input
              type="text"
              value={newAddr.full_name}
              onChange={(e) => setNewAddr({ ...newAddr, full_name: e.target.value })}
              placeholder="e.g. Rahul Sharma"
              required
              className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-2.5"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
              Mobile Number *
            </label>
            <input
              type="tel"
              value={newAddr.phone}
              onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })}
              placeholder="+91 98765 43210"
              required
              className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-2.5"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
              Flat / House No. / Building / Street *
            </label>
            <textarea
              value={newAddr.address_line}
              onChange={(e) => setNewAddr({ ...newAddr, address_line: e.target.value })}
              placeholder="Full address details"
              rows={2}
              required
              className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-2.5"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                City *
              </label>
              <input
                type="text"
                value={newAddr.city}
                onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                required
                className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-2.5"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                Pincode *
              </label>
              <input
                type="text"
                value={newAddr.pincode}
                onChange={(e) => setNewAddr({ ...newAddr, pincode: e.target.value })}
                required
                maxLength={6}
                className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-2.5"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
              Address Type
            </label>
            <div className="flex gap-4">
              {['Home', 'Office', 'Other'].map((t) => (
                <label key={t} className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="addrType"
                    checked={newAddr.type === t}
                    onChange={() => setNewAddr({ ...newAddr, type: t })}
                    className="text-[#E63946] focus:ring-[#E63946]"
                  />
                  <span>{t}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowAddAddressModal(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save Address
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

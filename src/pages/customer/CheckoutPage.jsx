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
  ArrowLeft,
  X,
  Smartphone,
  Building,
  Banknote,
  Truck,
  Package,
  Edit3,
  Tag,
  AlertCircle,
  ShoppingBag,
  Zap,
  Check
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { RazorpayModal } from '../../components/customer/RazorpayModal';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { commerceDb } from '../../services/supabase/supabaseClient';

export function CheckoutPage() {
  const {
    cartItems,
    selectedCartItems,
    totalAmount,
    subtotal,
    catalogDiscount,
    couponDiscount,
    deliveryFee,
    taxAmount,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    clearPurchasedItems
  } = useCart();

  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Use selected products if available, fallback to all cart items
  const checkoutItems = selectedCartItems && selectedCartItems.length > 0 ? selectedCartItems : cartItems;

  const [step, setStep] = useState(1); // 1: Address, 2: Payment, 3: Review
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);

  // Exactly 2 payment methods: Online Payment (Razorpay) & Cash on Delivery
  const [paymentMethod, setPaymentMethod] = useState('Online Payment (Razorpay)');
  const [onlineTab, setOnlineTab] = useState('upi'); // 'upi' | 'card'
  const [upiId, setUpiId] = useState('rahul@okaxis');

  const [cardDetails, setCardDetails] = useState({
    number: '4532 •••• •••• 8812',
    name: 'Rahul Sharma',
    expiry: '10/28',
    cvv: '•••'
  });

  const [placingOrder, setPlacingOrder] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);

  // Confirmation Modal state
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Razorpay Gateway Modal state
  const [showRazorpayModal, setShowRazorpayModal] = useState(false);

  // Coupon state in checkout
  const [checkoutCouponCode, setCheckoutCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  // Add Address Modal state
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

  // Edit Address Modal state
  const [showEditAddressModal, setShowEditAddressModal] = useState(false);
  const [editingAddr, setEditingAddr] = useState(null);

  useEffect(() => {
    commerceDb.getAddresses().then((list) => {
      setAddresses(list);
      const defaultAddr = list.find((a) => a.is_default) || list[0];
      if (defaultAddr) setSelectedAddressId(defaultAddr.id);
    });
  }, []);

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!checkoutCouponCode.trim()) return;
    setCouponLoading(true);
    await applyCoupon(checkoutCouponCode);
    setCouponLoading(false);
    setCheckoutCouponCode('');
  };

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
    showToast('New delivery address added!', 'success');
  };

  const handleOpenEditAddress = (addr, e) => {
    e.stopPropagation();
    setEditingAddr({ ...addr });
    setShowEditAddressModal(true);
  };

  const handleSaveEditedAddress = async (e) => {
    e.preventDefault();
    if (!editingAddr || !editingAddr.full_name || !editingAddr.phone || !editingAddr.address_line) {
      showToast('Please fill all required address fields', 'error');
      return;
    }
    const updated = await commerceDb.updateAddress(editingAddr.id, editingAddr);
    if (updated) {
      setAddresses((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
      setShowEditAddressModal(false);
      showToast('Address updated successfully!', 'success');
    }
  };

  const promptOrderConfirmation = () => {
    const selectedAddress = addresses.find((a) => a.id === selectedAddressId);
    if (!selectedAddress) {
      showToast('Please select a delivery address to proceed', 'error');
      setStep(1);
      return;
    }
    setShowConfirmModal(true);
  };

  // Red Celebration Blast
  const triggerRedCelebrationBlast = () => {
    try {
      const redColors = ['#E63946', '#FF3B30', '#D90429', '#EF233C', '#FFFFFF', '#FFD166'];
      
      confetti({
        particleCount: 130,
        spread: 90,
        origin: { y: 0.5 },
        colors: redColors
      });

      setTimeout(() => {
        confetti({
          particleCount: 80,
          angle: 60,
          spread: 65,
          origin: { x: 0.1, y: 0.6 },
          colors: redColors
        });
        confetti({
          particleCount: 80,
          angle: 120,
          spread: 65,
          origin: { x: 0.9, y: 0.6 },
          colors: redColors
        });
      }, 250);

      setTimeout(() => {
        confetti({
          particleCount: 90,
          spread: 110,
          origin: { y: 0.4 },
          colors: redColors
        });
      }, 550);
    } catch {
      // Safe fallback
    }
  };

  // Called after confirmation or after Razorpay payment succeeds
  const finalizeOrderPlacement = async (paymentMethodUsed, paymentStatus = 'Completed', paymentId = null) => {
    const selectedAddress = addresses.find((a) => a.id === selectedAddressId);
    if (!selectedAddress) {
      showToast('Please select a delivery address', 'error');
      setStep(1);
      return;
    }

    setPlacingOrder(true);
    try {
      const newOrder = await commerceDb.createOrder({
        shipping_address: selectedAddress,
        items: checkoutItems.map((item) => ({
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
        discount_amount: (catalogDiscount || 0) + (couponDiscount || 0),
        delivery_fee: deliveryFee,
        tax_amount: taxAmount,
        total_amount: totalAmount,
        payment_method: paymentMethodUsed,
        payment_status: paymentStatus,
        payment_id: paymentId
      });

      setPlacedOrder(newOrder);

      // Clear ONLY the purchased products, keeping unselected items in cart
      clearPurchasedItems();

      // Trigger brand red confetti blast
      triggerRedCelebrationBlast();

      showToast('Order placed successfully!', 'success');
    } catch {
      showToast('Failed to place order. Please try again.', 'error');
    } finally {
      setPlacingOrder(false);
    }
  };

  // Handler for Confirm Order in modal:
  // If Online -> opens Razorpay modal
  // If COD -> directly places order
  const handleConfirmOrder = () => {
    setShowConfirmModal(false);

    if (paymentMethod === 'Online Payment (Razorpay)') {
      setShowRazorpayModal(true);
    } else {
      finalizeOrderPlacement('Cash on Delivery', 'Pending');
    }
  };

  const handleRazorpaySuccess = (paymentResult) => {
    setShowRazorpayModal(false);
    finalizeOrderPlacement('Online Payment (Razorpay)', 'Completed', paymentResult.payment_id);
  };

  // SUCCESS SCREEN: When order is placed, show interactive success card with proper top spacing & equal buttons
  if (placedOrder) {
    return (
      <div className="max-w-2xl mx-auto pt-8 sm:pt-12 pb-20 px-4 animate-in fade-in zoom-in-95 duration-300">
        <div className="bg-white dark:bg-[#181818] rounded-3xl border border-neutral-200/90 dark:border-neutral-800 p-6 sm:p-9 text-center shadow-lg relative overflow-hidden">
          {/* Subtle decorative brand red glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-36 bg-[#E63946]/10 dark:bg-[#E63946]/20 blur-3xl rounded-full pointer-events-none" />

          {/* Success Checkmark & Verified Header: Perfectly Centered */}
          <div className="flex flex-col items-center justify-center text-center mb-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border-2 border-emerald-500/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-3 shadow-sm">
              <Check className="w-8 h-8 sm:w-10 sm:h-10 stroke-[3]" />
            </div>

            <span className="inline-flex items-center gap-1.5 text-[11px] font-black tracking-widest text-[#16A34A] uppercase bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-3.5 py-1 rounded-full mb-2.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" />
              Order & Payment Verified
            </span>

            <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-neutral-100 tracking-tight">
              Order Placed Successfully!
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1 max-w-md mx-auto leading-relaxed">
              Thank you! Your order <strong className="text-neutral-800 dark:text-neutral-200">#{placedOrder.order_number}</strong> is confirmed and is now being packaged.
            </p>
          </div>

          {/* Order Details Summary Box */}
          <div className="mt-6 bg-neutral-50 dark:bg-neutral-800/40 rounded-2xl border border-neutral-200/80 dark:border-neutral-700/60 p-4 sm:p-5 text-left space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs border-b border-neutral-200/60 dark:border-neutral-700/60 pb-3">
              <div>
                <span className="text-neutral-400 text-[11px] block">Order ID</span>
                <span className="font-bold text-neutral-900 dark:text-neutral-100 truncate block">#{placedOrder.order_number}</span>
              </div>
              <div>
                <span className="text-neutral-400 text-[11px] block">Payment Method</span>
                <span className="font-bold text-neutral-900 dark:text-neutral-100">{placedOrder.payment_method}</span>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <span className="text-neutral-400 text-[11px] block">Total Amount</span>
                <span className="font-black text-[#E63946] text-sm">₹{placedOrder.total_amount?.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Estimated Delivery & Shipping */}
            <div className="flex items-start gap-2.5 text-xs text-neutral-600 dark:text-neutral-300">
              <Truck className="w-4 h-4 text-[#E63946] shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-neutral-800 dark:text-neutral-200">
                  Estimated Delivery: {placedOrder.estimated_delivery || 'Within 2-3 Business Days'}
                </p>
                {placedOrder.shipping_address && (
                  <p className="text-neutral-500 text-[11px] mt-0.5 truncate max-w-md">
                    Delivering to {placedOrder.shipping_address.full_name}, {placedOrder.shipping_address.city} - {placedOrder.shipping_address.pincode}
                  </p>
                )}
              </div>
            </div>

            {/* Purchased Items List */}
            {placedOrder.items && placedOrder.items.length > 0 && (
              <div className="pt-2 border-t border-neutral-200/60 dark:border-neutral-700/60">
                <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block mb-2">
                  Items In This Order ({placedOrder.items.length})
                </span>
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                  {placedOrder.items.map((item, idx) => (
                    <Link
                      key={idx}
                      to={`/product/${item.product_id || item.id}`}
                      className="group flex items-center gap-2 bg-white dark:bg-neutral-800 p-1.5 pr-3 rounded-xl border border-neutral-200/80 dark:border-neutral-700/80 shrink-0 hover:border-[#E63946] transition-colors"
                      title={item.product_name}
                    >
                      <img
                        src={item.image}
                        alt={item.product_name}
                        className="w-9 h-9 rounded-lg object-cover bg-neutral-100"
                      />
                      <div className="max-w-[130px] text-[11px] truncate">
                        <p className="font-bold text-neutral-800 dark:text-neutral-200 truncate group-hover:text-[#E63946] transition-colors">
                          {item.product_name}
                        </p>
                        <p className="text-neutral-400 text-[10px]">Qty: {item.quantity}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons: Standardized UI, matching height and balanced sizing */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 w-full">
            <Link to={`/order/${placedOrder.id}`} className="w-full sm:flex-1">
              <Button
                variant="primary"
                size="lg"
                icon={Truck}
                className="w-full justify-center h-12 text-sm font-bold shadow-sm"
              >
                Track Order
              </Button>
            </Link>
            <Link to={`/order/${placedOrder.id}`} className="w-full sm:flex-1">
              <Button
                variant="outline"
                size="lg"
                icon={Package}
                className="w-full justify-center h-12 text-sm font-bold border-2"
              >
                View Order Details
              </Button>
            </Link>
            <Link to="/products" className="w-full sm:flex-1">
              <Button
                variant="secondary"
                size="lg"
                icon={ShoppingBag}
                className="w-full justify-center h-12 text-sm font-bold bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-900 dark:text-neutral-100 border border-neutral-300 dark:border-neutral-700"
              >
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (checkoutItems.length === 0 && !placingOrder) {
    return (
      <div className="text-center py-20 bg-white dark:bg-[#181818] rounded-2xl border p-8 max-w-lg mx-auto">
        <ShoppingBag className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
        <h2 className="text-xl font-bold mb-2">No items selected for checkout</h2>
        <p className="text-sm text-neutral-500 mb-6">
          Please select the products you wish to order from your cart.
        </p>
        <Link to="/cart">
          <Button variant="primary" size="md">Return to Cart</Button>
        </Link>
      </div>
    );
  }

  const selectedAddress = addresses.find((a) => a.id === selectedAddressId);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-24 md:pb-12">
      {/* Top Header Bar with Cancel Action */}
      <div className="flex items-center justify-between px-1">
        <button
          type="button"
          onClick={() => navigate('/cart')}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-neutral-600 dark:text-neutral-400 hover:text-[#E63946] dark:hover:text-[#E63946] transition-colors cursor-pointer group py-1"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform text-[#E63946]" />
          <span>Cancel & Return to Cart</span>
        </button>
        <div className="flex items-center gap-1.5 text-xs text-neutral-500 font-medium">
          <ShieldCheck className="w-4 h-4 text-[#16A34A]" />
          <span className="hidden sm:inline">256-Bit SSL Encrypted Checkout</span>
          <span className="sm:hidden">SSL Secure</span>
        </div>
      </div>

      {/* Checkout Progress Stepper */}
      <div className="bg-white dark:bg-[#181818] p-4 sm:p-6 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-xs">
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
          {/* STEP 1: Address Selection with Edit Address */}
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
                    className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-start gap-3.5 relative ${
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
                    <div className="flex-1 text-xs sm:text-sm pr-16 sm:pr-20">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
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

                    {/* Edit Address Button */}
                    <button
                      type="button"
                      onClick={(e) => handleOpenEditAddress(addr, e)}
                      className="absolute top-4 right-4 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:text-[#E63946] hover:border-[#E63946] transition-colors cursor-pointer"
                      title="Edit this address"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-[#E63946]" />
                      <span>Edit</span>
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-neutral-100 dark:border-neutral-800">
                <Button
                  type="button"
                  onClick={() => navigate('/cart')}
                  variant="outline"
                  size="md"
                  icon={X}
                >
                  Cancel Checkout
                </Button>
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

          {/* STEP 2: Payment Options - Exactly 2 methods: Online (Razorpay) & Cash on Delivery */}
          {step === 2 && (
            <div className="bg-white dark:bg-[#181818] rounded-2xl border border-neutral-200/80 dark:border-neutral-800 p-5 sm:p-6 space-y-6">
              <div className="border-b border-neutral-100 dark:border-neutral-800 pb-4">
                <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                  Select Payment Method
                </h2>
                <p className="text-xs text-neutral-500">
                  Choose between Instant Online Payment via Razorpay or Cash on Delivery.
                </p>
              </div>

              <div className="space-y-4">
                {/* Method 1: Online Payment (Razorpay) */}
                <div
                  onClick={() => setPaymentMethod('Online Payment (Razorpay)')}
                  className={`p-4 sm:p-5 rounded-2xl border-2 transition-all cursor-pointer ${
                    paymentMethod === 'Online Payment (Razorpay)'
                      ? 'border-[#0D6EFD] bg-blue-50/20 dark:bg-blue-950/20 shadow-xs'
                      : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <input
                      type="radio"
                      name="paymentMethodRadio"
                      checked={paymentMethod === 'Online Payment (Razorpay)'}
                      onChange={() => setPaymentMethod('Online Payment (Razorpay)')}
                      className="mt-1 w-4 h-4 text-[#0D6EFD] focus:ring-[#0D6EFD] accent-[#0D6EFD]"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <span className="font-black text-sm sm:text-base text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                          <CreditCard className="w-5 h-5 text-[#0D6EFD]" />
                          Online Payment (Razorpay)
                        </span>
                        <span className="text-[10px] font-bold text-[#0D6EFD] bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Zap className="w-3 h-3 fill-[#0D6EFD]" />
                          Opens Razorpay Gateway
                        </span>
                      </div>
                      <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                        Pay via UPI (GPay, PhonePe, Paytm, CRED), Credit/Debit Cards, Net Banking & Wallets via official Razorpay modal.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Method 2: Cash on Delivery (COD) */}
                <div
                  onClick={() => setPaymentMethod('Cash on Delivery')}
                  className={`p-4 sm:p-5 rounded-2xl border-2 transition-all cursor-pointer ${
                    paymentMethod === 'Cash on Delivery'
                      ? 'border-[#E63946] bg-[#E63946]/5 shadow-xs'
                      : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <input
                      type="radio"
                      name="paymentMethodRadio"
                      checked={paymentMethod === 'Cash on Delivery'}
                      onChange={() => setPaymentMethod('Cash on Delivery')}
                      className="mt-1 w-4 h-4 text-[#E63946] focus:ring-[#E63946] accent-[#E63946]"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <span className="font-black text-sm sm:text-base text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                          <Banknote className="w-5 h-5 text-[#E63946]" />
                          Cash on Delivery (COD)
                        </span>
                        <span className="text-[10px] font-bold text-neutral-600 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-full">
                          Pay at Doorstep
                        </span>
                      </div>
                      <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                        Pay with cash or scan the delivery agent’s QR code when your package arrives at your door.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-neutral-100 dark:border-neutral-800">
                <div className="flex items-center gap-2">
                  <Button onClick={() => setStep(1)} variant="outline" size="md">
                    Back to Address
                  </Button>
                  <Button
                    type="button"
                    onClick={() => navigate('/cart')}
                    variant="ghost"
                    size="md"
                    className="text-neutral-500 hover:text-[#DC2626]"
                  >
                    Cancel
                  </Button>
                </div>
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
                <p className="text-xs text-neutral-500">
                  Please verify your items, delivery address, and payment method before placing.
                </p>
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
                    className="text-xs font-bold text-[#E63946] hover:underline cursor-pointer"
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
                    {paymentMethod === 'Online Payment (Razorpay)'
                      ? 'Opens secure Razorpay gateway on confirmation'
                      : 'Pay via cash/QR on delivery'}
                  </p>
                </div>
                <button
                  onClick={() => setStep(2)}
                  className="text-xs font-bold text-[#E63946] hover:underline cursor-pointer"
                >
                  Change
                </button>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 block">
                  Items to be Ordered ({checkoutItems.length})
                </span>
                <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                  {checkoutItems.map((item) => (
                    <div key={item.id} className="py-2.5 flex items-center justify-between gap-3 text-xs sm:text-sm">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-10 h-10 rounded-lg object-cover bg-neutral-100 shrink-0"
                        />
                        <div className="truncate">
                          <p className="font-semibold text-neutral-800 dark:text-neutral-200 truncate">{item.name}</p>
                          <p className="text-neutral-500 text-[11px]">
                            Qty: {item.quantity} {item.variant && item.variant !== 'Default' ? `• ${item.variant}` : ''}
                          </p>
                        </div>
                      </div>
                      <span className="font-bold shrink-0">
                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-neutral-100 dark:border-neutral-800">
                <div className="flex items-center gap-2">
                  <Button onClick={() => setStep(2)} variant="outline" size="md">
                    Back to Payment
                  </Button>
                  <Button
                    type="button"
                    onClick={() => navigate('/cart')}
                    variant="ghost"
                    size="md"
                    className="text-neutral-500 hover:text-[#DC2626]"
                  >
                    Cancel
                  </Button>
                </div>
                <Button
                  onClick={promptOrderConfirmation}
                  loading={placingOrder}
                  variant="primary"
                  size="lg"
                  className="min-w-[190px]"
                >
                  Place Order (₹{totalAmount.toLocaleString('en-IN')})
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Price Summary Box & Apply Coupon (4 cols) */}
        <div className="lg:col-span-4 space-y-4 sticky top-24">
          {/* Apply Coupon Box inside Checkout Page */}
          <div className="bg-white dark:bg-[#181818] rounded-2xl border border-neutral-200/80 dark:border-neutral-800 p-4 sm:p-5">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5 mb-2.5">
              <Tag className="w-4 h-4 text-[#E63946]" />
              Apply Coupon at Checkout
            </span>

            {appliedCoupon ? (
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
                  <div>
                    <span className="text-xs font-bold text-[#16A34A]">{appliedCoupon.code}</span>
                    <p className="text-[10px] text-neutral-500">{appliedCoupon.description}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={removeCoupon}
                  aria-label="Remove coupon"
                  className="p-1 text-neutral-400 hover:text-red-500 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  value={checkoutCouponCode}
                  onChange={(e) => setCheckoutCouponCode(e.target.value.toUpperCase())}
                  placeholder="e.g. WELCOME50, BIGSAVER15"
                  className="flex-1 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl px-3 py-2 text-xs uppercase font-semibold focus:outline-none focus:border-[#E63946]"
                />
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  loading={couponLoading}
                >
                  Apply
                </Button>
              </form>
            )}

            <div className="mt-2.5 flex gap-1.5 flex-wrap text-[11px]">
              <span className="text-neutral-400">Available:</span>
              <button
                type="button"
                onClick={() => setCheckoutCouponCode('WELCOME50')}
                className="text-[#E63946] font-semibold hover:underline"
              >
                WELCOME50
              </button>
              <span className="text-neutral-300">•</span>
              <button
                type="button"
                onClick={() => setCheckoutCouponCode('BIGSAVER15')}
                className="text-[#E63946] font-semibold hover:underline"
              >
                BIGSAVER15
              </button>
            </div>
          </div>

          {/* Payment Summary Box */}
          <div className="bg-white dark:bg-[#181818] rounded-2xl border border-neutral-200/80 dark:border-neutral-800 p-5 sm:p-6 space-y-4">
            <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100 border-b border-neutral-100 dark:border-neutral-800 pb-3">
              Payment Summary ({checkoutItems.length} items)
            </h3>

            <div className="space-y-2 text-xs sm:text-sm">
              <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                <span>Items Subtotal</span>
                <span>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              {catalogDiscount > 0 && (
                <div className="flex justify-between text-[#16A34A] font-semibold">
                  <span>Product Discount</span>
                  <span>-₹{catalogDiscount.toLocaleString('en-IN')}</span>
                </div>
              )}
              {couponDiscount > 0 && (
                <div className="flex justify-between text-[#16A34A] font-semibold">
                  <span>Coupon Discount</span>
                  <span>-₹{couponDiscount.toLocaleString('en-IN')}</span>
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

            <Button
              onClick={promptOrderConfirmation}
              variant="primary"
              size="lg"
              className="w-full mt-2"
              loading={placingOrder}
            >
              Place Order (₹{totalAmount.toLocaleString('en-IN')})
            </Button>

            <div className="pt-2 text-[11px] text-neutral-400 flex items-center justify-center gap-1.5 text-center">
              <ShieldCheck className="w-4 h-4 text-[#16A34A] shrink-0" />
              <span>Guaranteed Safe 256-bit Checkout</span>
            </div>

            <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800">
              <button
                type="button"
                onClick={() => navigate('/cart')}
                className="w-full text-center text-xs font-semibold text-neutral-500 hover:text-[#DC2626] dark:hover:text-[#DC2626] py-1 cursor-pointer transition-colors"
              >
                Cancel & Return to Cart
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* CONFIRMATION MODAL BEFORE PLACING ORDER */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirm Your Order"
      >
        <div className="space-y-4 text-xs sm:text-sm">
          <p className="text-neutral-600 dark:text-neutral-300">
            Please confirm that you want to proceed with this order:
          </p>

          <div className="bg-neutral-50 dark:bg-neutral-800/50 p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-700 space-y-2">
            <div>
              <span className="text-[10px] uppercase font-bold text-neutral-400 block">Deliver To</span>
              <p className="font-bold text-neutral-900 dark:text-neutral-100">
                {selectedAddress?.full_name} ({selectedAddress?.phone})
              </p>
              <p className="text-neutral-500 text-xs">
                {selectedAddress?.address_line}, {selectedAddress?.city} - {selectedAddress?.pincode}
              </p>
            </div>

            <div className="pt-2 border-t border-neutral-200/60 dark:border-neutral-700/60 grid grid-cols-2 gap-2">
              <div>
                <span className="text-[10px] uppercase font-bold text-neutral-400 block">Payment Method</span>
                <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                  {paymentMethod}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-neutral-400 block">Total Payable</span>
                <span className="font-black text-[#E63946] text-sm">
                  ₹{totalAmount.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-neutral-200/60 dark:border-neutral-700/60">
              <span className="text-[10px] uppercase font-bold text-neutral-400 block">
                Selected Products ({checkoutItems.length})
              </span>
              <p className="text-xs text-neutral-700 dark:text-neutral-300 truncate">
                {checkoutItems.map((i) => i.name).join(', ')}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => setShowConfirmModal(false)}
            >
              Review Details
            </Button>
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={handleConfirmOrder}
              className="min-w-[150px]"
            >
              {paymentMethod === 'Online Payment (Razorpay)'
                ? 'Proceed to Razorpay'
                : 'Confirm & Place Order'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* RAZORPAY PAYMENT GATEWAY MODAL */}
      <RazorpayModal
        isOpen={showRazorpayModal}
        onClose={() => setShowRazorpayModal(false)}
        amount={totalAmount}
        orderNumber={`CMC-${Date.now().toString().slice(-6)}`}
        onSuccess={handleRazorpaySuccess}
      />

      {/* Edit Address Modal */}
      {editingAddr && (
        <Modal
          isOpen={showEditAddressModal}
          onClose={() => setShowEditAddressModal(false)}
          title="Edit Delivery Address"
        >
          <form onSubmit={handleSaveEditedAddress} className="space-y-4 text-xs sm:text-sm">
            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                Recipient Name *
              </label>
              <input
                type="text"
                value={editingAddr.full_name || ''}
                onChange={(e) => setEditingAddr({ ...editingAddr, full_name: e.target.value })}
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
                value={editingAddr.phone || ''}
                onChange={(e) => setEditingAddr({ ...editingAddr, phone: e.target.value })}
                placeholder="+91 98765 43210"
                required
                className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-2.5"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                Address Details *
              </label>
              <textarea
                value={editingAddr.address_line || ''}
                onChange={(e) => setEditingAddr({ ...editingAddr, address_line: e.target.value })}
                placeholder="Flat / Building / Street details"
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
                  value={editingAddr.city || ''}
                  onChange={(e) => setEditingAddr({ ...editingAddr, city: e.target.value })}
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
                  value={editingAddr.pincode || ''}
                  onChange={(e) => setEditingAddr({ ...editingAddr, pincode: e.target.value })}
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
                      name="editAddrType"
                      checked={editingAddr.type === t}
                      onChange={() => setEditingAddr({ ...editingAddr, type: t })}
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
                onClick={() => setShowEditAddressModal(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Save Changes
              </Button>
            </div>
          </form>
        </Modal>
      )}

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

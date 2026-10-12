import React, { useState } from 'react';
import { CreditCard, Smartphone, Building, ShieldCheck, X, Loader2, Plus, Minus, Popcorn } from 'lucide-react';

const BookingModal = ({ isOpen, onClose, show, selectedSeats, seatPriceTotal, onConfirmPayment, isProcessing }) => {
  const [paymentMethod, setPaymentMethod] = useState('Card');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [upiId, setUpiId] = useState('user@okhdfcbank');

  // Food & Beverage Add-ons (BookMyShow / AMC feature)
  const [snacks, setSnacks] = useState([
    { id: 'popcorn', name: 'Caramel Tub Popcorn', price: 180, count: 0, emoji: '🍿' },
    { id: 'beverage', name: 'Cold Fountain Pepsi (Large)', price: 120, count: 0, emoji: '🥤' },
    { id: 'nachos', name: 'Crispy Cheese Nachos', price: 160, count: 0, emoji: '🧀' }
  ]);

  if (!isOpen || !show) return null;

  const updateSnackCount = (id, delta) => {
    setSnacks((prev) =>
      prev.map((s) => (s.id === id ? { ...s, count: Math.max(0, s.count + delta) } : s))
    );
  };

  const snacksTotal = snacks.reduce((sum, s) => sum + s.price * s.count, 0);
  const basePrice = seatPriceTotal;
  const convenienceFee = 30;
  const taxes = 20;
  const grandTotal = basePrice + snacksTotal + convenienceFee + taxes;

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirmPayment({
      paymentMethod,
      cardDetails: {
        last4: '4242',
        brand: 'Visa',
        upiId: paymentMethod === 'UPI' ? upiId : ''
      },
      snacks: snacks.filter((s) => s.count > 0)
    });
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '1rem',
        overflowY: 'auto'
      }}
    >
      <div
        style={{
          background: '#121826',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '540px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.8)',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            flexShrink: 0
          }}
        >
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Confirm Reservation</h3>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              {show.movie?.title} • {show.theatre?.name}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', color: '#94a3b8', padding: '0.2rem' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Body */}
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem', overflowY: 'auto' }}>
          {/* Seats Summary */}
          <div
            style={{
              background: '#182032',
              padding: '1rem',
              borderRadius: '10px',
              marginBottom: '1.25rem'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.85rem' }}>
              <span style={{ color: '#94a3b8' }}>Seats Reserved ({selectedSeats.length}):</span>
              <span style={{ fontWeight: 800, color: '#fbbf24' }}>{selectedSeats.join(', ')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
              <span style={{ color: '#94a3b8' }}>Showtime:</span>
              <span style={{ fontWeight: 600 }}>{new Date(show.showDate).toLocaleDateString()} at {show.showTime}</span>
            </div>
          </div>

          {/* Snacks & Food Add-On Section (BookMyShow / AMC Feature) */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.88rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.6rem' }}>
              <span>🍿 Cinema Combos & Bites (Optional)</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {snacks.map((snack) => (
                <div
                  key={snack.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: '#182032',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    padding: '0.6rem 0.9rem',
                    borderRadius: '8px',
                    fontSize: '0.85rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span style={{ fontSize: '1.2rem' }}>{snack.emoji}</span>
                    <div>
                      <div style={{ fontWeight: 600 }}>{snack.name}</div>
                      <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>₹{snack.price}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <button
                      type="button"
                      onClick={() => updateSnackCount(snack.id, -1)}
                      style={{
                        background: '#1e293b',
                        color: 'white',
                        width: '26px',
                        height: '26px',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Minus size={13} />
                    </button>
                    <span style={{ fontWeight: 700, minWidth: '16px', textAlign: 'center' }}>{snack.count}</span>
                    <button
                      type="button"
                      onClick={() => updateSnackCount(snack.id, 1)}
                      style={{
                        background: 'var(--accent-red)',
                        color: 'white',
                        width: '26px',
                        height: '26px',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Plus size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Method Selector */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#cbd5e1', display: 'block', marginBottom: '0.5rem' }}>
              Select Payment Method
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.6rem' }}>
              {[
                { id: 'Card', label: 'Card', icon: CreditCard },
                { id: 'UPI', label: 'UPI / GPay', icon: Smartphone },
                { id: 'NetBanking', label: 'NetBanking', icon: Building }
              ].map((m) => {
                const Icon = m.icon;
                const isSelected = paymentMethod === m.id;
                return (
                  <button
                    type="button"
                    key={m.id}
                    onClick={() => setPaymentMethod(m.id)}
                    style={{
                      background: isSelected ? 'rgba(229, 9, 20, 0.15)' : '#182032',
                      border: `1px solid ${isSelected ? '#e50914' : 'rgba(255,255,255,0.08)'}`,
                      color: isSelected ? '#fff' : '#94a3b8',
                      padding: '0.8rem 0.5rem',
                      borderRadius: '8px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.4rem',
                      fontSize: '0.8rem',
                      fontWeight: 600
                    }}
                  >
                    <Icon size={18} color={isSelected ? '#e50914' : '#94a3b8'} />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Payment Form Details */}
          {paymentMethod === 'Card' ? (
            <div style={{ marginBottom: '1.25rem' }}>
              <input
                type="text"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                placeholder="Card Number"
                style={{
                  width: '100%',
                  background: '#182032',
                  border: '1px solid rgba(255,255,255,0.1)',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '0.88rem',
                  marginBottom: '0.6rem'
                }}
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                <input
                  type="text"
                  defaultValue="12/28"
                  placeholder="MM/YY"
                  style={{
                    background: '#182032',
                    border: '1px solid rgba(255,255,255,0.1)',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '0.88rem'
                  }}
                />
                <input
                  type="password"
                  defaultValue="888"
                  placeholder="CVV"
                  style={{
                    background: '#182032',
                    border: '1px solid rgba(255,255,255,0.1)',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '0.88rem'
                  }}
                />
              </div>
            </div>
          ) : (
            <div style={{ marginBottom: '1.25rem' }}>
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="Enter UPI ID (e.g. mobile@upi)"
                style={{
                  width: '100%',
                  background: '#182032',
                  border: '1px solid rgba(255,255,255,0.1)',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '0.88rem'
                }}
              />
            </div>
          )}

          {/* Transparent Live Pricing Breakdown */}
          <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '1rem', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', marginBottom: '0.35rem' }}>
              <span>Tickets Subtotal</span>
              <span>₹{basePrice}</span>
            </div>
            {snacksTotal > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#fbbf24', marginBottom: '0.35rem' }}>
                <span>Snacks & Combos</span>
                <span>₹{snacksTotal}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', marginBottom: '0.35rem' }}>
              <span>Convenience Fee</span>
              <span>₹{convenienceFee}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', marginBottom: '0.6rem' }}>
              <span>Integrated Taxes (GST)</span>
              <span>₹{taxes}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.15rem', color: '#fff', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '0.6rem' }}>
              <span>Total Payable</span>
              <span style={{ color: '#e50914' }}>₹{grandTotal}</span>
            </div>
          </div>

          {/* Confirm Button */}
          <button
            type="submit"
            disabled={isProcessing}
            className="btn-primary"
            style={{ width: '100%', padding: '0.85rem', fontSize: '1rem' }}
          >
            {isProcessing ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Processing Payment...</span>
              </>
            ) : (
              <>
                <ShieldCheck size={18} />
                <span>Pay ₹{grandTotal} & Confirm Tickets</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BookingModal;

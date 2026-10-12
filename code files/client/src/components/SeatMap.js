import React from 'react';

const SeatMap = ({ seats, selectedSeats, onToggleSeat, pricing }) => {
  // Group seats by row (A, B, C...)
  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

  const getTierForCustomer = (row) => {
    if (row === 'A' || row === 'B') return { name: 'VIP Recliner', price: pricing?.vip || 350, color: '#8b5cf6' };
    if (row === 'C' || row === 'D' || row === 'E') return { name: 'Premium Lounge', price: pricing?.premium || 250, color: '#06b6d4' };
    return { name: 'Standard Classic', price: pricing?.standard || 180, color: '#94a3b8' };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
      {/* Curved Screen Banner */}
      <div className="screen-area">
        <div className="screen-curve" />
        <div className="screen-text">All eyes this way • Screen</div>
        <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.4rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
          ↔ Pan horizontally on mobile to view all rows & seats
        </div>
      </div>

      {/* Legend */}
      <div
        style={{
          display: 'flex',
          gap: '1.5rem',
          flexWrap: 'wrap',
          justifyContent: 'center',
          margin: '1.2rem 0',
          fontSize: '0.82rem',
          color: '#cbd5e1'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <div className="seat-box seat-available" style={{ width: '18px', height: '18px' }} />
          <span>Available</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <div className="seat-box seat-selected" style={{ width: '18px', height: '18px' }} />
          <span>Selected</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <div className="seat-box seat-locked" style={{ width: '18px', height: '18px' }} />
          <span>Reserved (Live)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <div className="seat-box seat-booked" style={{ width: '18px', height: '18px' }} />
          <span>Sold</span>
        </div>
      </div>

      {/* Seat Rows by Tier */}
      <div className="seat-grid-container">
        {rows.map((rowName) => {
          const tierInfo = getTierForCustomer(rowName);
          const rowSeats = seats.filter((s) => s.row === rowName);

          return (
            <React.Fragment key={rowName}>
              {(rowName === 'A' || rowName === 'C' || rowName === 'F') && (
                <div
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    color: tierInfo.color,
                    margin: '0.8rem 0 0.3rem 0',
                    width: '100%',
                    textAlign: 'center',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                    paddingBottom: '0.2rem'
                  }}
                >
                  {tierInfo.name} — ₹{tierInfo.price}
                </div>
              )}

              <div className="seat-row">
                <span className="row-label">{rowName}</span>

                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  {rowSeats.map((seat) => {
                    const isSelected = selectedSeats.includes(seat.seatNumber);
                    let seatClass = 'seat-available';

                    if (seat.status === 'booked') {
                      seatClass = 'seat-booked';
                    } else if (seat.status === 'locked') {
                      seatClass = 'seat-locked';
                    } else if (isSelected) {
                      seatClass = 'seat-selected';
                    }

                    return (
                      <div
                        key={seat.seatNumber}
                        className={`seat-box ${seatClass}`}
                        onClick={() => {
                          if (seat.status === 'available') {
                            onToggleSeat(seat.seatNumber, seat.price);
                          }
                        }}
                        title={`${seat.seatNumber} • ${tierInfo.name} • ₹${seat.price}`}
                      >
                        {seat.number}
                      </div>
                    );
                  })}
                </div>

                <span className="row-label">{rowName}</span>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default SeatMap;

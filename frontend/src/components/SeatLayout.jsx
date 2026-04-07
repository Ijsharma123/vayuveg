function buildRows(totalSeats) {
    const rows = [];

    for (let seatNumber = 1; seatNumber <= totalSeats; seatNumber += 4) {
        rows.push([seatNumber, seatNumber + 1, seatNumber + 2, seatNumber + 3].filter((seat) => seat <= totalSeats));
    }

    return rows;
}

export default function SeatLayout({ totalSeats, bookedSeats = [], pendingSeats = [], selectedSeats, onToggleSeat }) {
    const rows = buildRows(totalSeats);

    return (
        <section className="seat-layout card">
            <div className="seat-layout__header">
                <div>
                    <span className="eyebrow">Seat layout</span>
                    <h2>Select your seats</h2>
                </div>
                <div className="seat-legend">
                    <span className="seat-legend__item">
                        <span className="seat-legend__swatch seat-legend__swatch--available" />
                        Available
                    </span>
                    <span className="seat-legend__item">
                        <span className="seat-legend__swatch seat-legend__swatch--selected" />
                        Selected
                    </span>
                    <span className="seat-legend__item">
                        <span className="seat-legend__swatch seat-legend__swatch--pending" />
                        Pending
                    </span>
                    <span className="seat-legend__item">
                        <span className="seat-legend__swatch seat-legend__swatch--approved" />
                        Approved
                    </span>
                </div>
            </div>

            <div className="seat-layout__body">
                <div className="driver-cabin">Driver</div>

                {rows.map((row, rowIndex) => (
                    <div className="seat-row" key={`row-${rowIndex + 1}`}>
                        {row.slice(0, 2).map((seatNumber) => {
                            const isApproved = bookedSeats.includes(seatNumber);
                            const isPending = pendingSeats.includes(seatNumber);
                            const isSelected = selectedSeats.includes(seatNumber);
                            const seatState = isApproved ? "approved" : isPending ? "pending" : isSelected ? "selected" : "available";

                            return (
                                <button
                                    key={seatNumber}
                                    type="button"
                                    className={`seat seat--${seatState}`}
                                    onClick={() => onToggleSeat(seatNumber)}
                                    disabled={isApproved || isPending}
                                >
                                    {seatNumber}
                                </button>
                            );
                        })}

                        <div className="seat-aisle">Aisle</div>

                        {row.slice(2).map((seatNumber) => {
                            const isApproved = bookedSeats.includes(seatNumber);
                            const isPending = pendingSeats.includes(seatNumber);
                            const isSelected = selectedSeats.includes(seatNumber);
                            const seatState = isApproved ? "approved" : isPending ? "pending" : isSelected ? "selected" : "available";

                            return (
                                <button
                                    key={seatNumber}
                                    type="button"
                                    className={`seat seat--${seatState}`}
                                    onClick={() => onToggleSeat(seatNumber)}
                                    disabled={isApproved || isPending}
                                >
                                    {seatNumber}
                                </button>
                            );
                        })}
                    </div>
                ))}
            </div>
        </section>
    );
}

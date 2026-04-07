function buildRows(totalSeats) {
    const rows = [];

    for (let seatNumber = 1; seatNumber <= totalSeats; seatNumber += 4) {
        rows.push([seatNumber, seatNumber + 1, seatNumber + 2, seatNumber + 3].filter((seat) => seat <= totalSeats));
    }

    return rows;
}

export default function SeatLayout({ totalSeats, bookedSeats, selectedSeats, onToggleSeat }) {
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
                        <span className="seat-legend__swatch seat-legend__swatch--booked" />
                        Booked
                    </span>
                </div>
            </div>

            <div className="seat-layout__body">
                <div className="driver-cabin">Driver</div>

                {rows.map((row, rowIndex) => (
                    <div className="seat-row" key={`row-${rowIndex + 1}`}>
                        {row.slice(0, 2).map((seatNumber) => {
                            const isBooked = bookedSeats.includes(seatNumber);
                            const isSelected = selectedSeats.includes(seatNumber);

                            return (
                                <button
                                    key={seatNumber}
                                    type="button"
                                    className={`seat seat--${isBooked ? "booked" : isSelected ? "selected" : "available"}`}
                                    onClick={() => onToggleSeat(seatNumber)}
                                    disabled={isBooked}
                                >
                                    {seatNumber}
                                </button>
                            );
                        })}

                        <div className="seat-aisle">Aisle</div>

                        {row.slice(2).map((seatNumber) => {
                            const isBooked = bookedSeats.includes(seatNumber);
                            const isSelected = selectedSeats.includes(seatNumber);

                            return (
                                <button
                                    key={seatNumber}
                                    type="button"
                                    className={`seat seat--${isBooked ? "booked" : isSelected ? "selected" : "available"}`}
                                    onClick={() => onToggleSeat(seatNumber)}
                                    disabled={isBooked}
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

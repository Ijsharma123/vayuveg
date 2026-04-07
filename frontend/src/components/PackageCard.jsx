import { Link } from "react-router-dom";

export default function PackageCard({ travelPackage }) {
    const soldOut = travelPackage.availableSeats === 0;

    return (
        <article className="package-card card">
            <div className="package-card__media">
                <img src={travelPackage.image} alt={travelPackage.title} loading="lazy" />
                <div className="package-card__badge">{travelPackage.duration}</div>
            </div>

            <div className="package-card__content">
                <div className="package-card__meta">
                    <span>{travelPackage.destination}</span>
                    <strong>Seats Left: {travelPackage.availableSeats}</strong>
                </div>

                <h3>{travelPackage.title}</h3>
                <p>{travelPackage.description}</p>

                <div className="package-card__footer">
                    <div>
                        <small>Price per seat</small>
                        <strong>Rs. {travelPackage.pricePerSeat}</strong>
                    </div>
                    <Link className={`button button--small ${soldOut ? "button--muted" : ""}`} to={`/packages/${travelPackage.id}`}>
                        {soldOut ? "View Seats" : "Book Now"}
                    </Link>
                </div>
            </div>
        </article>
    );
}

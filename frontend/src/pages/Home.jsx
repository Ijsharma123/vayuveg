import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PackageCard from "../components/PackageCard.jsx";
import { getApiErrorMessage, getPackages } from "../services/api";

export default function Home() {
    const [featuredPackages, setFeaturedPackages] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        let ignore = false;

        async function loadPackages() {
            try {
                const packages = await getPackages();

                if (!ignore) {
                    setFeaturedPackages(packages.slice(0, 3));
                }
            } catch (error) {
                if (!ignore) {
                    setErrorMessage(getApiErrorMessage(error, "Unable to load featured travel packages right now."));
                }
            } finally {
                if (!ignore) {
                    setIsLoading(false);
                }
            }
        }

        loadPackages();

        return () => {
            ignore = true;
        };
    }, []);

    return (
        <>
            <section className="hero-section section">
                <div className="hero-section__content">
                    <span className="eyebrow">Trusted road trips across India</span>
                    <h1>Vayuveg Bus Travels</h1>
                    <p>
                        Comfortable and Affordable Bus Journeys with modern seat booking and curated travel
                        packages for every trip.
                    </p>

                    <div className="hero-actions">
                        <Link className="button" to="/packages">
                            View Packages
                        </Link>
                        <Link className="button button--ghost" to="/inquiry">
                            Make an Inquiry
                        </Link>
                    </div>

                    <div className="stats-strip">
                        <div className="stats-strip__item">
                            <strong>40</strong>
                            <span>Seats per bus</span>
                        </div>
                        <div className="stats-strip__item">
                            <strong>Live</strong>
                            <span>Seat availability</span>
                        </div>
                        <div className="stats-strip__item">
                            <strong>Fast</strong>
                            <span>Admin booking review</span>
                        </div>
                    </div>
                </div>

                <div className="hero-section__visual">
                    <div className="hero-visual-card card">
                        <img src="/hero-bus.svg" alt="Illustration of a Vayuveg tour bus" />
                    </div>
                </div>
            </section>

            <section className="section">
                <div className="section-heading">
                    <div>
                        <span className="eyebrow">Featured packages</span>
                        <h2>Popular bus journeys</h2>
                    </div>
                    <Link className="text-link" to="/packages">
                        See all packages
                    </Link>
                </div>

                {isLoading ? <div className="card helper-card">Loading packages...</div> : null}
                {errorMessage ? <div className="card helper-card helper-card--error">{errorMessage}</div> : null}

                {!isLoading && !errorMessage ? (
                    <div className="package-grid">
                        {featuredPackages.map((travelPackage) => (
                            <PackageCard key={travelPackage.id} travelPackage={travelPackage} />
                        ))}
                    </div>
                ) : null}
            </section>

            <section className="section feature-section">
                <div className="section-heading">
                    <div>
                        <span className="eyebrow">Why travelers choose us</span>
                        <h2>Designed for a smooth booking experience</h2>
                    </div>
                </div>

                <div className="info-grid">
                    <article className="card info-card">
                        <h3>Modern seat booking</h3>
                        <p>Select exact seats from a clear visual layout and instantly see what is still available.</p>
                    </article>
                    <article className="card info-card">
                        <h3>Responsive travel pages</h3>
                        <p>Browse packages, compare pricing and confirm journeys comfortably on mobile or desktop.</p>
                    </article>
                    <article className="card info-card">
                        <h3>Fast booking support</h3>
                        <p>Bookings and inquiries are processed quickly through our platform with admin review support.</p>
                    </article>
                </div>
            </section>
        </>
    );
}

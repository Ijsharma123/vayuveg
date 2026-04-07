import { useEffect, useState } from "react";
import PackageCard from "../components/PackageCard.jsx";
import { getApiErrorMessage, getPackages } from "../services/api";

export default function Packages() {
    const [packages, setPackages] = useState([]);
    const [query, setQuery] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        let ignore = false;

        async function loadPackages() {
            try {
                const packageList = await getPackages();

                if (!ignore) {
                    setPackages(packageList);
                }
            } catch (error) {
                if (!ignore) {
                    setErrorMessage(getApiErrorMessage(error, "Unable to load travel packages."));
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

    const filteredPackages = packages.filter((travelPackage) =>
        [travelPackage.title, travelPackage.destination, travelPackage.description]
            .join(" ")
            .toLowerCase()
            .includes(query.trim().toLowerCase())
    );

    return (
        <section className="section">
            <div className="page-hero card">
                <span className="eyebrow">Travel packages</span>
                <h1>Choose your next bus journey</h1>
                <p>Browse curated packages, compare seats left and book the exact seats you want.</p>

                <label className="search-box">
                    <span>Search by title, destination or vibe</span>
                    <input
                        type="text"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Search Rajasthan, Prayagraj, Haridwar..."
                    />
                </label>
            </div>

            {isLoading ? <div className="card helper-card">Loading packages...</div> : null}
            {errorMessage ? <div className="card helper-card helper-card--error">{errorMessage}</div> : null}

            {!isLoading && !errorMessage ? (
                <>
                    <div className="section-heading section-heading--compact">
                        <h2>{filteredPackages.length} packages available</h2>
                    </div>

                    <div className="package-grid">
                        {filteredPackages.map((travelPackage) => (
                            <PackageCard key={travelPackage.id} travelPackage={travelPackage} />
                        ))}
                    </div>

                    {filteredPackages.length === 0 ? (
                        <div className="empty-state">
                            <h3>No packages matched your search.</h3>
                            <p>Try a different destination or browse all trips again.</p>
                        </div>
                    ) : null}
                </>
            ) : null}
        </section>
    );
}

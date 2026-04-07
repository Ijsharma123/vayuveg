import { useEffect, useState } from "react";
import { createPackage, getApiErrorMessage, getPackages } from "../services/api";

const initialPackageForm = {
    title: "",
    destination: "",
    pricePerSeat: "",
    duration: "",
    totalSeats: "40",
    image: "/packages/default.svg",
    description: "",
};

export default function Admin() {
    const [formState, setFormState] = useState(initialPackageForm);
    const [packages, setPackages] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [statusMessage, setStatusMessage] = useState("");
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
                    setErrorMessage(getApiErrorMessage(error, "Unable to load package list."));
                }
            }
        }

        loadPackages();

        return () => {
            ignore = true;
        };
    }, []);

    function handleChange(event) {
        const { name, value } = event.target;

        setFormState((currentState) => ({
            ...currentState,
            [name]: value,
        }));
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setStatusMessage("");
        setErrorMessage("");
        setIsSubmitting(true);

        try {
            const createdPackage = await createPackage({
                ...formState,
                pricePerSeat: Number(formState.pricePerSeat),
                totalSeats: Number(formState.totalSeats),
            });

            setPackages((currentPackages) => [createdPackage, ...currentPackages]);
            setFormState(initialPackageForm);
            setStatusMessage("Travel package added successfully.");
        } catch (error) {
            setErrorMessage(getApiErrorMessage(error, "Unable to create the package."));
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <section className="section admin-page">
            <div className="split-panel">
                <form className="card stack-form" onSubmit={handleSubmit}>
                    <span className="eyebrow">Admin package creator</span>
                    <h1>Add a new travel package</h1>
                    <p>This demo admin form connects directly to the package creation API.</p>

                    <label>
                        <span>Package title</span>
                        <input type="text" name="title" value={formState.title} onChange={handleChange} required />
                    </label>

                    <label>
                        <span>Destination</span>
                        <input
                            type="text"
                            name="destination"
                            value={formState.destination}
                            onChange={handleChange}
                            required
                        />
                    </label>

                    <div className="form-grid">
                        <label>
                            <span>Price per seat</span>
                            <input
                                type="number"
                                min="1"
                                name="pricePerSeat"
                                value={formState.pricePerSeat}
                                onChange={handleChange}
                                required
                            />
                        </label>

                        <label>
                            <span>Total seats</span>
                            <input
                                type="number"
                                min="1"
                                name="totalSeats"
                                value={formState.totalSeats}
                                onChange={handleChange}
                                required
                            />
                        </label>
                    </div>

                    <label>
                        <span>Duration</span>
                        <input type="text" name="duration" value={formState.duration} onChange={handleChange} required />
                    </label>

                    <label>
                        <span>Image URL or asset path</span>
                        <input type="text" name="image" value={formState.image} onChange={handleChange} />
                    </label>

                    <label>
                        <span>Description</span>
                        <textarea
                            name="description"
                            rows="5"
                            value={formState.description}
                            onChange={handleChange}
                            required
                        />
                    </label>

                    <button className="button" type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Saving package..." : "Create Package"}
                    </button>

                    {statusMessage ? <p className="inline-success">{statusMessage}</p> : null}
                    {errorMessage ? <p className="inline-error">{errorMessage}</p> : null}
                </form>

                <div className="card admin-overview">
                    <span className="eyebrow">Current packages</span>
                    <h2>{packages.length} package entries</h2>

                    <div className="admin-overview__list">
                        {packages.map((travelPackage) => (
                            <article className="admin-package-row" key={travelPackage.id}>
                                <div>
                                    <strong>{travelPackage.title}</strong>
                                    <span>{travelPackage.destination}</span>
                                </div>
                                <div>
                                    <strong>{travelPackage.availableSeats} seats left</strong>
                                    <span>Rs. {travelPackage.pricePerSeat} / seat</span>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    clearAuthToken,
    createPackage,
    getApiErrorMessage,
    getBookings,
    getPackages,
    setAuthToken,
    updateBookingStatus,
    deleteBooking,
    getQueries,
    updateQueryStatus,
    getTermsAndConditions,
    updateTermsAndConditions,
} from "../services/api";

const initialPackageForm = {
    title: "",
    destination: "",
    pricePerSeat: "",
    duration: "",
    totalSeats: "40",
    image: "/packages/default.svg",
    description: "",
};

export default function AdminDashboard() {
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [queries, setQueries] = useState([]);
    const [packages, setPackages] = useState([]);
    const [termsAndConditions, setTermsAndConditions] = useState([]);
    const [packageForm, setPackageForm] = useState(initialPackageForm);
    const [newTermPoint, setNewTermPoint] = useState("");
    const [filter, setFilter] = useState("all");
    const [queryFilter, setQueryFilter] = useState("all");
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [statusMessage, setStatusMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("adminToken");
        if (!token) {
            navigate("/admin");
            return;
        }

        setAuthToken(token);
        loadData();
        loadTermsAndConditions();
    }, [navigate, filter, queryFilter]);

    async function loadData() {
        setIsLoading(true);
        setErrorMessage("");

        try {
            const bookingResponse = await getBookings(filter === "all" ? undefined : filter);
            const queryResponse = await getQueries(queryFilter === "all" ? undefined : queryFilter);
            const packageResponse = await getPackages();
            setBookings(bookingResponse);
            setQueries(queryResponse);
            setPackages(packageResponse);
        } catch (error) {
            setErrorMessage(getApiErrorMessage(error, "Unable to load admin data."));
        } finally {
            setIsLoading(false);
        }
    }

    async function loadTermsAndConditions() {
        try {
            const termsResponse = await getTermsAndConditions();
            console.log("Loaded terms from API:", termsResponse);
            const points = termsResponse?.points || [];
            console.log("Extracted points:", points);
            setTermsAndConditions(points);
        } catch (error) {
            console.error("Failed to load T&C:", error);
            setTermsAndConditions([]);
        }
    }

    function handlePackageChange(event) {
        const { name, value } = event.target;
        setPackageForm((current) => ({
            ...current,
            [name]: value,
        }));
    }

    async function handlePackageSubmit(event) {
        event.preventDefault();
        setStatusMessage("");
        setErrorMessage("");
        setIsSubmitting(true);

        try {
            const createdPackage = await createPackage({
                ...packageForm,
                pricePerSeat: Number(packageForm.pricePerSeat),
                totalSeats: Number(packageForm.totalSeats),
            });
            setPackages((current) => [createdPackage, ...current]);
            setPackageForm(initialPackageForm);
            setStatusMessage("Package created successfully.");
        } catch (error) {
            setErrorMessage(getApiErrorMessage(error, "Unable to create package."));
        } finally {
            setIsSubmitting(false);
        }
    }

    async function handleBookingAction(id, status) {
        setErrorMessage("");
        setStatusMessage("");

        try {
            await updateBookingStatus(id, status);
            setStatusMessage(`Booking ${status} successfully.`);
            await loadData();
        } catch (error) {
            setErrorMessage(getApiErrorMessage(error, "Unable to update booking status."));
        }
    }

    async function handleBookingDelete(id) {
        setErrorMessage("");
        setStatusMessage("");

        try {
            await deleteBooking(id);
            setStatusMessage("Booking deleted successfully.");
            await loadData();
        } catch (error) {
            setErrorMessage(getApiErrorMessage(error, "Unable to delete booking."));
        }
    }

    async function handleQueryAction(id, status) {
        setErrorMessage("");
        setStatusMessage("");

        try {
            await updateQueryStatus(id, status);
            setStatusMessage(`Query marked as ${status} successfully.`);
            await loadData();
        } catch (error) {
            setErrorMessage(getApiErrorMessage(error, "Unable to update query status."));
        }
    }

    async function handleAddTermPoint(event) {
        event.preventDefault();
        setErrorMessage("");
        setStatusMessage("");

        if (!newTermPoint.trim()) {
            setErrorMessage("Term point text is required.");
            return;
        }

        try {
            const updatedPoints = [
                ...termsAndConditions,
                { id: String(Date.now()), text: newTermPoint },
            ];
            await updateTermsAndConditions(updatedPoints);
            setTermsAndConditions(updatedPoints);
            setNewTermPoint("");
            setStatusMessage("Term point added successfully.");
        } catch (error) {
            setErrorMessage(getApiErrorMessage(error, "Unable to add term point."));
        }
    }

    async function handleDeleteTermPoint(id) {
        setErrorMessage("");
        setStatusMessage("");

        try {
            const updatedPoints = termsAndConditions.filter((point) => point.id !== id);
            await updateTermsAndConditions(updatedPoints);
            setTermsAndConditions(updatedPoints);
            setStatusMessage("Term point removed successfully.");
        } catch (error) {
            setErrorMessage(getApiErrorMessage(error, "Unable to remove term point."));
        }
    }

    function handleLogout() {
        clearAuthToken();
        localStorage.removeItem("adminToken");
        navigate("/admin");
    }

    return (
        <section className="section admin-dashboard-page">
            <div className="page-toolbar">
                <div>
                    <span className="eyebrow">Admin dashboard</span>
                    <h1>Booking and package management</h1>
                </div>
                <button className="button button--ghost" type="button" onClick={handleLogout}>
                    Logout
                </button>
            </div>

            {statusMessage ? <div className="card helper-card helper-card--success">{statusMessage}</div> : null}
            {errorMessage ? <div className="card helper-card helper-card--error">{errorMessage}</div> : null}

            <div className="admin-dashboard-grid">
                <div className="card admin-bookings">
                    <div className="admin-section-header">
                        <div>
                            <span className="eyebrow">Bookings</span>
                            <h2>Manage bookings</h2>
                        </div>
                        <div className="admin-filters">
                            {['all', 'pending', 'approved', 'rejected'].map((status) => (
                                <button
                                    key={status}
                                    type="button"
                                    className={`button button--small ${filter === status ? 'button--primary' : 'button--ghost'}`}
                                    onClick={() => setFilter(status)}
                                >
                                    {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="card helper-card">Loading bookings...</div>
                    ) : (
                        <div className="booking-list">
                            {bookings.length === 0 ? (
                                <p className="inline-note">No bookings available for this filter.</p>
                            ) : (
                                bookings.map((booking) => (
                                    <article className="booking-row card" key={booking._id}>
                                        <div>
                                            <strong>{booking.packageTitle}</strong>
                                            <span>{booking.referenceId}</span>
                                        </div>
                                        <div className="booking-meta">
                                            <span>{booking.name}</span>
                                            <span>{booking.phone}</span>
                                            <span>Seats: {booking.seatsBooked.join(", ")}</span>
                                            <span>Status: {booking.status}</span>
                                        </div>

                                        <div className="booking-actions">
                                            {booking.status === "pending" ? (
                                                <>
                                                    <button type="button" className="button button--small" onClick={() => handleBookingAction(booking._id, "approved")}>
                                                        Approve
                                                    </button>
                                                    <button type="button" className="button button--small button--danger" onClick={() => handleBookingAction(booking._id, "rejected")}>
                                                        Reject
                                                    </button>
                                                </>
                                            ) : null}
                                            <button type="button" className="button button--small button--ghost" onClick={() => handleBookingDelete(booking._id)}>
                                                Delete
                                            </button>
                                        </div>
                                    </article>
                                ))
                            )}
                        </div>
                    )}
                </div>

                <div className="card admin-packages">
                    <div className="admin-section-header">
                        <div>
                            <span className="eyebrow">Packages</span>
                            <h2>Create new package</h2>
                        </div>
                    </div>

                    <form className="stack-form" onSubmit={handlePackageSubmit}>
                        <label>
                            <span>Package title</span>
                            <input type="text" name="title" value={packageForm.title} onChange={handlePackageChange} required />
                        </label>

                        <label>
                            <span>Destination</span>
                            <input type="text" name="destination" value={packageForm.destination} onChange={handlePackageChange} required />
                        </label>

                        <label>
                            <span>Price per seat</span>
                            <input type="number" min="1" name="pricePerSeat" value={packageForm.pricePerSeat} onChange={handlePackageChange} required />
                        </label>

                        <label>
                            <span>Total seats</span>
                            <input type="number" min="1" name="totalSeats" value={packageForm.totalSeats} onChange={handlePackageChange} required />
                        </label>

                        <label>
                            <span>Duration</span>
                            <input type="text" name="duration" value={packageForm.duration} onChange={handlePackageChange} required />
                        </label>

                        <label>
                            <span>Image URL</span>
                            <input type="text" name="image" value={packageForm.image} onChange={handlePackageChange} />
                        </label>

                        <label>
                            <span>Description</span>
                            <textarea name="description" rows="4" value={packageForm.description} onChange={handlePackageChange} required />
                        </label>

                        <button className="button" type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Saving package..." : "Create Package"}
                        </button>
                    </form>

                    <div className="admin-package-list">
                        <span className="eyebrow">Current packages</span>
                        {packages.length === 0 ? (
                            <p className="inline-note">No packages found.</p>
                        ) : (
                            <ul>
                                {packages.map((travelPackage) => (
                                    <li key={travelPackage.id}>
                                        {travelPackage.title} — {travelPackage.destination} ({travelPackage.availableSeats} available)
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                <div className="card admin-queries">
                    <div className="admin-section-header">
                        <div>
                            <span className="eyebrow">Inquiries</span>
                            <h2>Manage customer inquiries</h2>
                        </div>
                        <div className="admin-filters">
                            {['all', 'pending', 'resolved'].map((status) => (
                                <button
                                    key={status}
                                    type="button"
                                    className={`button button--small ${queryFilter === status ? 'button--primary' : 'button--ghost'}`}
                                    onClick={() => setQueryFilter(status)}
                                >
                                    {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="card helper-card">Loading inquiries...</div>
                    ) : (
                        <div className="query-list">
                            {queries.length === 0 ? (
                                <p className="inline-note">No inquiries available for this filter.</p>
                            ) : (
                                queries.map((query) => (
                                    <article className="query-row card" key={query._id}>
                                        <div>
                                            <strong>{query.name}</strong>
                                            <span>{query.phone}</span>
                                        </div>
                                        <div className="query-message">
                                            <p>{query.message}</p>
                                            <span className="query-status">Status: <strong>{query.status}</strong></span>
                                        </div>

                                        <div className="query-actions">
                                            {query.status === "pending" ? (
                                                <button type="button" className="button button--small" onClick={() => handleQueryAction(query._id, "resolved")}>
                                                    Mark Resolved
                                                </button>
                                            ) : (
                                                <button type="button" className="button button--small button--ghost" onClick={() => handleQueryAction(query._id, "pending")}>
                                                    Reopen
                                                </button>
                                            )}
                                        </div>
                                    </article>
                                ))
                            )}
                        </div>
                    )}
                </div>

                <div className="card admin-terms">
                    <div className="admin-section-header">
                        <div>
                            <span className="eyebrow">Website Settings</span>
                            <h2>Manage terms and conditions</h2>
                        </div>
                    </div>

                    <form className="stack-form" onSubmit={handleAddTermPoint}>
                        <label>
                            <span>Add new term point</span>
                            <textarea
                                rows="2"
                                value={newTermPoint}
                                onChange={(e) => setNewTermPoint(e.target.value)}
                                placeholder="e.g., Cancellation: Cancellations must be made 7 days before departure"
                                required
                            />
                        </label>
                        <button className="button" type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Adding..." : "Add Term Point"}
                        </button>
                    </form>

                    <div className="terms-list-admin">
                        <span className="eyebrow">Current terms and conditions</span>
                        {termsAndConditions.length === 0 ? (
                            <p className="inline-note">No terms and conditions defined yet.</p>
                        ) : (
                            <div className="admin-terms-items">
                                {termsAndConditions.map((point) => (
                                    <article className="admin-term-item" key={point.id}>
                                        <p>{point.text}</p>
                                        <button
                                            type="button"
                                            className="button button--small button--danger"
                                            onClick={() => handleDeleteTermPoint(point.id)}
                                        >
                                            Remove
                                        </button>
                                    </article>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}

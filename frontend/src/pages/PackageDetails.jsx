import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import SeatLayout from "../components/SeatLayout.jsx";
import { createBooking, getApiErrorMessage, getPackageById, getTermsAndConditions } from "../services/api";

const initialFormState = {
    name: "",
    phone: "",
};

export default function PackageDetails() {
    const { id } = useParams();
    const [travelPackage, setTravelPackage] = useState(null);
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [formState, setFormState] = useState(initialFormState);
    const [paymentProof, setPaymentProof] = useState(null);
    const [agreeToTerms, setAgreeToTerms] = useState(false);
    const [termsAndConditions, setTermsAndConditions] = useState([]);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const fileInputRef = useRef(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [successState, setSuccessState] = useState(null);

    useEffect(() => {
        let ignore = false;

        async function loadPackage() {
            try {
                const packageDetails = await getPackageById(id);
                const termsData = await getTermsAndConditions();
                
                console.log("Loaded terms data:", termsData);

                if (!ignore) {
                    setTravelPackage(packageDetails);
                    setTermsAndConditions(termsData?.points || []);
                }
            } catch (error) {
                if (!ignore) {
                    setErrorMessage(getApiErrorMessage(error, "Unable to load the selected package."));
                }
            } finally {
                if (!ignore) {
                    setIsLoading(false);
                }
            }
        }

        loadPackage();

        return () => {
            ignore = true;
        };
    }, [id]);

    function handleSeatToggle(seatNumber) {
        if (!travelPackage) {
            return;
        }

        if (travelPackage.bookedSeats.includes(seatNumber) || travelPackage.pendingSeats.includes(seatNumber)) {
            return;
        }

        setSelectedSeats((currentSeats) => {
            if (currentSeats.includes(seatNumber)) {
                return currentSeats.filter((seat) => seat !== seatNumber);
            }

            return [...currentSeats, seatNumber].sort((firstSeat, secondSeat) => firstSeat - secondSeat);
        });
    }

    function handleInputChange(event) {
        const { name, value } = event.target;

        setFormState((currentState) => ({
            ...currentState,
            [name]: value,
        }));
    }

    function handlePaymentProofChange(event) {
        setPaymentProof(event.target.files?.[0] || null);
    }

    useEffect(() => {
        if (showPaymentModal) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }

        return () => {
            document.body.style.overflow = "";
        };
    }, [showPaymentModal]);

    async function refreshPackage() {
        const packageDetails = await getPackageById(id);
        setTravelPackage(packageDetails);
    }

    function openBookingModal(event) {
        event.preventDefault();
        setErrorMessage("");
        setSuccessState(null);

        if (selectedSeats.length === 0) {
            setErrorMessage("Please select at least one seat before booking.");
            return;
        }

        setShowPaymentModal(true);
    }

    function closePaymentModal() {
        setShowPaymentModal(false);
        setPaymentProof(null);
        setAgreeToTerms(false);
        setErrorMessage("");
    }

    async function confirmBooking(event) {
        event.preventDefault();
        setErrorMessage("");

        if (!paymentProof) {
            setErrorMessage("Please upload payment proof before submitting your booking.");
            return;
        }

        if (!agreeToTerms) {
            setErrorMessage("Please agree to the terms and conditions before booking.");
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await createBooking({
                packageId: id,
                name: formState.name,
                phone: formState.phone,
                seatsBooked: selectedSeats,
                paymentProof,
            });

            setTravelPackage(response.package);
            setSelectedSeats([]);
            setPaymentProof(null);
            setShowPaymentModal(false);
            setSuccessState(response);
        } catch (error) {
            setErrorMessage(getApiErrorMessage(error, "Booking could not be completed."));
            if (error.response?.status === 409) {
                await refreshPackage();
                setSelectedSeats([]);
            }
        } finally {
            setIsSubmitting(false);
        }
    }

    if (isLoading) {
        return (
            <section className="section">
                <div className="card helper-card">Loading package details...</div>
            </section>
        );
    }

    if (!travelPackage) {
        return (
            <section className="section">
                <div className="empty-state">
                    <h1>Package not found</h1>
                    <p>The selected travel package could not be loaded.</p>
                </div>
            </section>
        );
    }

    const estimatedTotal = selectedSeats.length * travelPackage.pricePerSeat;

    return (
        <section className="section package-details">
            <div className="details-hero card">
                <div className="details-hero__image">
                    <img src={travelPackage.image} alt={travelPackage.title} />
                </div>

                <div className="details-hero__content">
                    <span className="eyebrow">Package details</span>
                    <h1>{travelPackage.title}</h1>
                    <p>{travelPackage.description}</p>

                    <div className="details-grid">
                        <div className="detail-pill">
                            <span>Destination</span>
                            <strong>{travelPackage.destination}</strong>
                        </div>
                        <div className="detail-pill">
                            <span>Duration</span>
                            <strong>{travelPackage.duration}</strong>
                        </div>
                        <div className="detail-pill">
                            <span>Price</span>
                            <strong>Rs. {travelPackage.pricePerSeat} / seat</strong>
                        </div>
                        <div className="detail-pill">
                            <span>Seats left</span>
                            <strong>{travelPackage.availableSeats}</strong>
                        </div>
                    </div>
                </div>
            </div>

            {errorMessage ? <div className="card helper-card helper-card--error">{errorMessage}</div> : null}
            {successState ? (
                <div className="card helper-card helper-card--success">
                    Booking request submitted for seats {successState.booking.seatsBooked.join(", ")}. Your booking reference is{' '}
                    <strong>{successState.booking.referenceId}</strong>. Seats are reserved while approval is pending.
                </div>
            ) : null}

            <div className="details-layout">
                <SeatLayout
                    totalSeats={travelPackage.totalSeats}
                    bookedSeats={travelPackage.bookedSeats}
                    pendingSeats={travelPackage.pendingSeats}
                    selectedSeats={selectedSeats}
                    onToggleSeat={handleSeatToggle}
                />

                <aside className="booking-sidebar card">
                    <div className="booking-sidebar__header">
                        <span className="eyebrow">Booking form</span>
                        <h2>Reserve your seats</h2>
                    </div>

                    <div className="summary-list">
                        <div className="summary-list__item">
                            <span>Selected seats</span>
                            <strong>{selectedSeats.length ? selectedSeats.join(", ") : "None yet"}</strong>
                        </div>
                        <div className="summary-list__item">
                            <span>Seats left</span>
                            <strong>{travelPackage.availableSeats}</strong>
                        </div>
                        <div className="summary-list__item">
                            <span>Total amount</span>
                            <strong>Rs. {estimatedTotal}</strong>
                        </div>
                    </div>

                    <form className="stack-form" onSubmit={openBookingModal}>
                        <label>
                            <span>Name</span>
                            <input
                                type="text"
                                name="name"
                                value={formState.name}
                                onChange={handleInputChange}
                                placeholder="Enter traveler name"
                                required
                            />
                        </label>

                        <label>
                            <span>Phone</span>
                            <input
                                type="tel"
                                name="phone"
                                value={formState.phone}
                                onChange={handleInputChange}
                                placeholder="Enter phone number"
                                required
                            />
                        </label>

                        <button className="button" type="submit" disabled={isSubmitting || selectedSeats.length === 0}>
                            {isSubmitting ? "Booking seats..." : "Book Now"}
                        </button>
                    </form>
                </aside>
            </div>

            {showPaymentModal ? (
                <section className="modal-overlay" onClick={closePaymentModal}>
                    <div className="modal card" onClick={(event) => event.stopPropagation()}>
                        <button className="modal__close" type="button" onClick={closePaymentModal}>
                            Close
                        </button>
                        <h2>Upload payment proof</h2>
                        <p>Scan the QR code below in your payment app and upload the payment screenshot.</p>

                        <div className="qr-placeholder">
                            <div className="qr-placeholder__box">
                                <img
                                    src="/payment-qr.jpg"
                                    alt="Payment QR code"
                                    className="qr-placeholder__image"
                                />
                            </div>
                        </div>

                        <form className="stack-form" onSubmit={confirmBooking}>
                            <div className="file-upload">
                                <span className="file-upload__label">Payment proof</span>
                                <div className="file-upload__control">
                                    <button
                                        type="button"
                                        className="button button--ghost"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        Choose file
                                    </button>
                                    <span className="file-upload__name">
                                        {paymentProof ? paymentProof.name : "No file chosen"}
                                    </span>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handlePaymentProofChange}
                                        style={{ display: "none" }}
                                    />
                                </div>
                            </div>

                            <div className="terms-section">
                                <div className="terms-header">
                                    <span className="eyebrow">Terms and Conditions</span>
                                    <h3>Booking Agreement ({termsAndConditions.length} items)</h3>
                                </div>
                                
                                <div className="terms-content">
                                    {console.log("Terms rendering, length:", termsAndConditions.length, "data:", termsAndConditions)}
                                    <ul className="terms-list">
                                        {termsAndConditions.length > 0 ? (
                                            termsAndConditions.map((term) => (
                                                <li key={term.id}>{term.text}</li>
                                            ))
                                        ) : (
                                            <li>No terms and conditions available</li>
                                        )}
                                    </ul>
                                </div>

                                <label className="terms-agreement">
                                    <input
                                        type="checkbox"
                                        checked={agreeToTerms}
                                        onChange={(e) => setAgreeToTerms(e.target.checked)}
                                    />
                                    <span>I agree to the terms and conditions</span>
                                </label>
                            </div>

                            <button className="button" type="submit" disabled={isSubmitting || !paymentProof || !agreeToTerms}>
                                {isSubmitting ? "Submitting booking..." : "Confirm Payment and Book"}
                            </button>
                        </form>
                    </div>
                </section>
            ) : null}
        </section>
    );
}

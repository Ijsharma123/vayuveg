import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import SeatLayout from "../components/SeatLayout";
import { createBooking, getApiErrorMessage, getPackageById } from "../services/api";

const initialFormState = {
    name: "",
    phone: "",
};

export default function PackageDetails() {
    const { id } = useParams();
    const [travelPackage, setTravelPackage] = useState(null);
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [formState, setFormState] = useState(initialFormState);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [successState, setSuccessState] = useState(null);
    const [paymentFile, setPaymentFile] = useState(null);
    const [showQR, setShowQR] = useState(false);

    useEffect(() => {
        let ignore = false;

        async function loadPackage() {
            try {
                const packageDetails = await getPackageById(id);

                if (!ignore) {
                    setTravelPackage(packageDetails);
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
        if (!travelPackage || travelPackage.bookedSeats.includes(seatNumber)) {
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

    async function refreshPackage() {
        const packageDetails = await getPackageById(id);
        setTravelPackage(packageDetails);
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setErrorMessage("");
        setSuccessState(null);

        if (selectedSeats.length === 0) {
            setErrorMessage("Please select at least one seat before booking.");
            return;
        }

        setIsSubmitting(true);

        try {
            const formData = new FormData();
            formData.append("packageId", id);
            formData.append("name", formState.name);
            formData.append("phone", formState.phone);
            formData.append("seatsBooked", JSON.stringify(selectedSeats));

            if (paymentFile) {
                formData.append("paymentProof", paymentFile);
            }

            const response = await createInquiry(formData);
            // const response = await createBooking({
            //     packageId: id,
            //     name: formState.name,
            //     phone: formState.phone,
            //     seatsBooked: selectedSeats,
            // });

            setTravelPackage(response.package);
            setSelectedSeats([]);
            setSuccessState(response);

            // if (response.whatsappUrl) {
            //     window.open(response.whatsappUrl, "_blank", "noopener,noreferrer");
            // }
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
                    Booking successful for seats {successState.booking.seatsBooked.join(", ")}. WhatsApp has been
                    opened with your pre-filled booking message.
                </div>
            ) : null}

            <div className="details-layout">
                <SeatLayout
                    totalSeats={travelPackage.totalSeats}
                    bookedSeats={travelPackage.bookedSeats}
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

                    <form className="stack-form" onSubmit={handleSubmit}>
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
                        {!showQR ? (
                            <button
                                type="button"
                                className="button"
                                onClick={() => setShowQR(true)}
                                disabled={selectedSeats.length === 0}
                            >
                                Proceed to Payment
                            </button>
                        ) : (
                            <button
                                type="submit"
                                className="button"
                                disabled={isSubmitting || !paymentFile}
                            >
                                {isSubmitting ? "Submitting..." : "Submit Booking Request"}
                            </button>
                        )}
                        {/* <button className="button" type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Booking seats..." : "Book Now"}
                        </button> */}
                    </form>
                </aside>
            </div>
        </section>
    );
}

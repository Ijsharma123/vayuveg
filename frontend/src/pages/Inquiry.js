import { useState } from "react";
import { createQuery, getApiErrorMessage } from "../services/api";

const initialInquiry = {
    name: "",
    phone: "",
    destination: "",
    message: "",
};

export default function Inquiry() {
    const [inquiry, setInquiry] = useState(initialInquiry);
    const [statusMessage, setStatusMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    function handleChange(event) {
        const { name, value } = event.target;

        setInquiry((currentInquiry) => ({
            ...currentInquiry,
            [name]: value,
        }));
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setStatusMessage("");
        setErrorMessage("");

        try {
            await createQuery(inquiry);
            setStatusMessage("Your inquiry has been submitted. Our team will get back to you soon.");
            setInquiry(initialInquiry);
        } catch (error) {
            setErrorMessage(getApiErrorMessage(error, "Unable to submit your inquiry right now."));
        }
    }

    return (
        <section className="section">
            <div className="split-panel">
                <div className="card inquiry-copy">
                    <span className="eyebrow">Travel inquiry</span>
                    <h1>Send your travel plan request</h1>
                    <p>
                        Share your preferred destination, travel dates or any special request and our team will review
                        it promptly.
                    </p>

                    <div className="info-grid info-grid--single">
                        <article className="info-card card">
                            <h3>Quick response</h3>
                            <p>Our travel support team reviews inquiries and responds to you directly.</p>
                        </article>
                    </div>
                </div>

                <form className="card stack-form inquiry-form" onSubmit={handleSubmit}>
                    <label>
                        <span>Name</span>
                        <input type="text" name="name" value={inquiry.name} onChange={handleChange} required />
                    </label>

                    <label>
                        <span>Phone</span>
                        <input type="tel" name="phone" value={inquiry.phone} onChange={handleChange} required />
                    </label>

                    <label>
                        <span>Destination</span>
                        <input
                            type="text"
                            name="destination"
                            value={inquiry.destination}
                            onChange={handleChange}
                            placeholder="Rajasthan, Khatu Shyam, Haridwar..."
                            required
                        />
                    </label>

                    <label>
                        <span>Message</span>
                        <textarea
                            name="message"
                            rows="5"
                            value={inquiry.message}
                            onChange={handleChange}
                            placeholder="Tell us what kind of trip you want to plan."
                            required
                        />
                    </label>

                    <button className="button" type="submit">
                        Submit Inquiry
                    </button>

                    {statusMessage ? <p className="inline-success">{statusMessage}</p> : null}
                    {errorMessage ? <p className="inline-error">{errorMessage}</p> : null}
                </form>
            </div>
        </section>
    );
}

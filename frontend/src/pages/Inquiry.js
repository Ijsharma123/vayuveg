import { useState } from "react";
import { createWhatsAppUrl } from "../services/whatsapp";

const initialInquiry = {
    name: "",
    phone: "",
    destination: "",
    message: "",
};

export default function Inquiry() {
    const [inquiry, setInquiry] = useState(initialInquiry);
    const [hasSubmitted, setHasSubmitted] = useState(false);

    function handleChange(event) {
        const { name, value } = event.target;

        setInquiry((currentInquiry) => ({
            ...currentInquiry,
            [name]: value,
        }));
    }

    function handleSubmit(event) {
        event.preventDefault();

        const whatsappMessage = `Hello, I have an inquiry for ${inquiry.destination}. Name: ${inquiry.name}. Phone: ${inquiry.phone}. Message: ${inquiry.message}`;

        window.open(createWhatsAppUrl(whatsappMessage), "_blank", "noopener,noreferrer");
        setHasSubmitted(true);
    }

    return (
        <section className="section">
            <div className="split-panel">
                <div className="card inquiry-copy">
                    <span className="eyebrow">Travel inquiry</span>
                    <h1>Plan your journey over WhatsApp</h1>
                    <p>
                        Share your preferred destination, travel dates or any special request and continue the
                        conversation instantly on WhatsApp.
                    </p>

                    <div className="info-grid info-grid--single">
                        <article className="info-card card">
                            <h3>Quick support</h3>
                            <p>Useful for custom groups, family trips and package clarifications before booking.</p>
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
                        Continue on WhatsApp
                    </button>

                    {hasSubmitted ? (
                        <p className="inline-success">Your inquiry message is ready in WhatsApp.</p>
                    ) : null}
                </form>
            </div>
        </section>
    );
}

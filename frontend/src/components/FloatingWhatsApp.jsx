import { createWhatsAppUrl } from "../services/whatsapp";

export default function FloatingWhatsApp() {
    const whatsappLink = createWhatsAppUrl("Hello, I want to know more about Vayuveg Bus Travels.");

    return (
        <a
            className="floating-whatsapp"
            href={whatsappLink}
            target="_blank"
            rel="noreferrer"
            aria-label="Open WhatsApp chat"
        >
            <span className="floating-whatsapp__icon">WA</span>
            <span>WhatsApp</span>
        </a>
    );
}

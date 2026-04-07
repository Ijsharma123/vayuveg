function buildWhatsAppUrl({ phoneNumber, packageName, seats, customerName }) {
    const safePhoneNumber = String(phoneNumber || "919999999999").replace(/\D/g, "");
    const seatLabel = Array.isArray(seats) ? seats.join(", ") : "";
    const message = `Hello, I want to book seats ${seatLabel} for ${packageName}.${customerName ? ` My name is ${customerName}.` : ""}`;

    return `https://wa.me/${safePhoneNumber}?text=${encodeURIComponent(message)}`;
}

module.exports = buildWhatsAppUrl;

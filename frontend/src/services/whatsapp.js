export const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || "919999999999";

export function createWhatsAppUrl(message, phoneNumber = whatsappNumber) {
    const safePhoneNumber = String(phoneNumber).replace(/\D/g, "");
    return `https://wa.me/${safePhoneNumber}?text=${encodeURIComponent(message)}`;
}

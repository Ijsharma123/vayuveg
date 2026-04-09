import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "/api",
});

export function setAuthToken(token) {
    if (token) {
        api.defaults.headers.common.Authorization = `Bearer ${token}`;
    }
}

export function clearAuthToken() {
    delete api.defaults.headers.common.Authorization;
}

export function getApiErrorMessage(error, fallbackMessage = "Something went wrong.") {
    return error?.response?.data?.message || fallbackMessage;
}

export async function getPackages() {
    const response = await api.get("/packages");
    return response.data.data;
}

export async function getPackageById(id) {
    const response = await api.get(`/packages/${id}`);
    return response.data.data;
}

export async function createPackage(payload) {
    const response = await api.post("/packages", payload);
    return response.data.data;
}

export async function adminLogin(credentials) {
    const response = await api.post("/admin/login", credentials);
    return response.data.data;
}

export async function getBookings(status) {
    const queryString = status ? `?status=${encodeURIComponent(status)}` : "";
    const response = await api.get(`/bookings${queryString}`);
    return response.data.data;
}

export async function updateBookingStatus(id, status) {
    const response = await api.put(`/bookings/${id}/status`, { status });
    return response.data.data;
}

export async function updateBooking(id, updates) {
    const response = await api.put(`/bookings/${id}`, updates);
    return response.data.data;
}

export async function deleteBooking(id) {
    const response = await api.delete(`/bookings/${id}`);
    return response.data;
}

export async function createBooking({ packageId, name, phone, seatsBooked, paymentProof }) {
    const formData = new FormData();
    formData.append("packageId", packageId);
    formData.append("name", name);
    formData.append("phone", phone);
    formData.append("seatsBooked", JSON.stringify(seatsBooked));

    if (paymentProof) {
        formData.append("paymentProof", paymentProof);
    }

    const response = await api.post("/bookings", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });

    return response.data.data;
}

export async function getQueries(status) {
    const queryString = status ? `?status=${encodeURIComponent(status)}` : "";
    const response = await api.get(`/query${queryString}`);
    return response.data.data;
}

export async function updateQueryStatus(id, status) {
    const response = await api.put(`/query/${id}`, { status });
    return response.data.data;
}

export async function getTermsAndConditions() {
    try {
        const response = await api.get("/terms");
        console.log("Raw T&C response:", response);
        // Response structure: { success: true, data: { _id, points: [...], ... } }
        const termsDoc = response.data.data;
        return termsDoc || { points: [] };
    } catch (error) {
        console.error("Failed to load T&C:", error);
        return { points: [] };
    }
}

export async function updateTermsAndConditions(points) {
    const response = await api.put("/terms", { points });
    return response.data.data;
}

export async function getSeatStatus(packageId) {
    const response = await api.get(`/bookings/seats/${packageId}`);
    return response.data.data;
}

export async function createQuery(payload) {
    const response = await api.post("/query", payload);
    return response.data.data;
}

export default api;

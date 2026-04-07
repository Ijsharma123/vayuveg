import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "/api",
});

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
    const response = await api.post("/packages/add", payload);
    return response.data.data;
}

export async function createBooking(payload) {
    const response = await api.post("/book", payload);
    return response.data.data;
}

export default api;

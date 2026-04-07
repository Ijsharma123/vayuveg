import { useEffect } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import FloatingWhatsApp from "./components/FloatingWhatsApp";
import Home from "./pages/Home";
import Packages from "./pages/Packages";
import PackageDetails from "./pages/PackageDetails";
import Inquiry from "./pages/Inquiry";
import Admin from "./pages/Admin";

function ScrollToTop() {
    const location = useLocation();

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, [location.pathname]);

    return null;
}

function NotFound() {
    return (
        <section className="section">
            <div className="empty-state">
                <span className="eyebrow">Page not found</span>
                <h1>That route does not exist.</h1>
                <p>Use the navigation above to return to the travel packages and booking flow.</p>
            </div>
        </section>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <ScrollToTop />
            <div className="app-shell">
                <Navbar />
                <main className="app-main">
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/packages" element={<Packages />} />
                        <Route path="/packages/:id" element={<PackageDetails />} />
                        <Route path="/inquiry" element={<Inquiry />} />
                        <Route path="/admin" element={<Admin />} />
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </main>
                <FloatingWhatsApp />
            </div>
        </BrowserRouter>
    );
}

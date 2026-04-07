import { useState } from "react";
import { Link, NavLink } from "react-router-dom";

const navItems = [
    { to: "/", label: "Home" },
    { to: "/packages", label: "Packages" },
    { to: "/inquiry", label: "Inquiry" },
];

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <header className="site-header">
            <div className="site-header__inner">
                <Link className="brand" to="/" onClick={() => setIsMenuOpen(false)}>
                    <span className="brand__mark">VV</span>
                    <span>
                        <strong>Vayuveg Bus Travels</strong>
                        <small>Comfortable and Affordable Bus Journeys</small>
                    </span>
                </Link>

                <button
                    className="menu-toggle"
                    type="button"
                    onClick={() => setIsMenuOpen((current) => !current)}
                    aria-label="Toggle navigation"
                >
                    <span />
                    <span />
                    <span />
                </button>

                <nav className={`site-nav ${isMenuOpen ? "site-nav--open" : ""}`}>
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) => (isActive ? "nav-link nav-link--active" : "nav-link")}
                            onClick={() => setIsMenuOpen(false)}
                        >
                            {item.label}
                        </NavLink>
                    ))}
                    <Link className="button button--small" to="/packages" onClick={() => setIsMenuOpen(false)}>
                        Book Seats
                    </Link>
                </nav>
            </div>
        </header>
    );
}

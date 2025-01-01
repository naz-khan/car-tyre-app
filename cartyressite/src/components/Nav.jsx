import React, { useState, useEffect } from 'react';

const Nav = () => {
    const [isActive, setIsActive] = useState(false);

    const handleBurgerClick = () => {
        setIsActive(!isActive);
    };
    useEffect(() => {
        const navbarMenu = document.getElementById("menu");
        const burgerMenu = document.getElementById("burger");
        const headerMenu = document.getElementById("header");

        // Open Close Navbar Menu on Click Burger
        if (burgerMenu && navbarMenu) {
            burgerMenu.addEventListener("click", () => {
                console.log('Burger clicked');
                burgerMenu.classList.toggle("is-active");
                navbarMenu.classList.toggle("is-active");
                console.log('burgerMenu classes:', burgerMenu.classList);
                console.log('navbarMenu classes:', navbarMenu.classList);
            });
        }

        // Close Navbar Menu on Click Menu Links
        document.querySelectorAll(".menu-link").forEach((link) => {
            link.addEventListener("click", () => {
                burgerMenu.classList.remove("is-active");
                navbarMenu.classList.remove("is-active");
            });
        });

        // Change Header Background on Scrolling
        const handleScroll = () => {
            if (window.scrollY >= 85) {
                headerMenu.classList.add("on-scroll");
            } else {
                headerMenu.classList.remove("on-scroll");
            }
        };
        window.addEventListener("scroll", handleScroll);

        // Fixed Navbar Menu on Window Resize
        const handleResize = () => {
            if (window.innerWidth > 768) {
                if (navbarMenu.classList.contains("is-active")) {
                    navbarMenu.classList.remove("is-active");
                }
            }
        };
        window.addEventListener("resize", handleResize);

        // Cleanup event listeners on component unmount
        return () => {
            if (burgerMenu && navbarMenu) {
                burgerMenu.removeEventListener("click", () => {
                    burgerMenu.classList.toggle("is-active");
                    navbarMenu.classList.toggle("is-active");
                });
            }
            document.querySelectorAll(".menu-link").forEach((link) => {
                link.removeEventListener("click", () => {
                    burgerMenu.classList.remove("is-active");
                    navbarMenu.classList.remove("is-active");
                });
            });
            window.removeEventListener("scroll", handleScroll);
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    return (
        <div>
            <header className="header" id="header">
                <nav className="navbar container">
                    <a href="#" className="brand">Brand</a>
                    <div className={`burger ${isActive ? 'is-active' : ''}`} id="burger" onClick={handleBurgerClick}>
                        <span className="burger-line"></span>
                        <span className="burger-line"></span>
                        <span className="burger-line"></span>
                    </div>
                    <div className={`menu ${isActive ? 'is-active' : ''}`} id="menu">
                        <ul className="menu-inner">
                            <li className="menu-item"><a href="#" className="menu-link">Home</a></li>
                            <li className="menu-item"><a href="#" className="menu-link">Tyres</a></li>
                            <li className="menu-item"><a href="#" className="menu-link">Battery</a></li>
                            <li className="menu-item"><a href="#" className="menu-link">Services</a></li>
                        </ul>
                    </div>
                    <a href="#" className="menu-block">Login</a>
                {/*    <a href="#" className="menu-block">My Account</a>*/}
                </nav>
            </header>
        </div>
    );
}

export default Nav;

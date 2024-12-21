import React from 'react';

const Home = () => {
    return (
        <div>
            <header>
                <h1>Welcome to My Website</h1>
            </header>
            <main>
                <p>This is a minimal homepage template built with React.</p>
                <button onClick={() => alert('Button Clicked!')}>
                    Click Me
                </button>
            </main>
            <footer>
                <p>&copy; {new Date().getFullYear()} My Website</p>
            </footer>
        </div>
    );
};

export default Home;

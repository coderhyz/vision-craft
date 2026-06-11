export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {
            colors: {
                brand: {
                    50: "#eef2ff",
                    100: "#e0e7ff",
                    200: "#c7d2fe",
                    300: "#a5b4fc",
                    400: "#818cf8",
                    500: "#6366f1",
                    600: "#4f46e5",
                    700: "#4338ca",
                    800: "#3730a3",
                    900: "#312e81",
                },
                accent: {
                    emerald: "#34d399",
                    cyan: "#06b6d4",
                    pink: "#ec4899",
                    amber: "#f59e0b",
                },
            },
            boxShadow: {
                "soft": "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
                "soft-md": "0 4px 12px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)",
                "soft-lg": "0 10px 30px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)",
                "brand-soft": "0 4px 14px rgba(99,102,241,0.15)",
                "brand-glow": "0 8px 25px rgba(99,102,241,0.2)",
            },
            gridTemplateColumns: {
                13: "repeat(13, minmax(0, 1fr))",
                14: "repeat(14, minmax(0, 1fr))",
                16: "repeat(16, minmax(0, 1fr))",
                custom: "400px 1fr 350px",
                sidebar: "250px 1fr",
            },
            gridTemplateRows: {
                20: "repeat(20, minmax(0, 1fr))",
                custom: "auto 1fr auto",
                component: "repeat(auto-fill, 115px)",
                header: "56px 1fr",
            },
            gridGap: {
                18: "4.5rem",
                88: "22rem",
            },
            gridTemplateAreas: {
                layout: '"header header" "sidebar main" "footer footer"',
                dashboard:
                    '"nav nav nav" "sidebar main stats" "sidebar main stats"',
            },
            animation: {
                "fade-in": "fadeIn 0.5s ease-out",
                "slide-up": "slideUp 0.4s ease-out",
            },
            keyframes: {
                fadeIn: {
                    "0%": { opacity: "0" },
                    "100%": { opacity: "1" },
                },
                slideUp: {
                    "0%": { opacity: "0", transform: "translateY(16px)" },
                    "100%": { opacity: "1", transform: "translateY(0)" },
                },
            },
        },
    },
};

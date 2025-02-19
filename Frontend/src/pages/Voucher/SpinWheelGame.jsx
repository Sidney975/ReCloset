import React, { useState, useContext, useEffect } from "react";
import { Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import { Wheel } from "react-custom-roulette";
import Confetti from "react-confetti";
import UserContext from "../../contexts/UserContext";
import http from "../../http";

function SpinWheelGame({ onClose }) {
    const { user, setUser } = useContext(UserContext);
    const [isSpinning, setIsSpinning] = useState(false);
    const [prizeIndex, setPrizeIndex] = useState(0);
    const [showConfetti, setShowConfetti] = useState(false);
    const [showResult, setShowResult] = useState(false);
    const [canSpin, setCanSpin] = useState(true);

    // Define the prizes
    const prizes = [
        { option: "10 Points", value: 10 },
        { option: "Try Again", value: 0 },
        { option: "50 Points", value: 50 },
        { option: "Try Again", value: 0 },
        { option: "100 Points", value: 100 },
    ];

    useEffect(() => {
        const lastSpin = localStorage.getItem("lastSpinDate");
        const today = new Date().toISOString().split("T")[0]; // Get YYYY-MM-DD format

        if (!lastSpin || lastSpin !== today) {
            setCanSpin(true); // Allow spin if it's a new day
        }
    }, []);


    const handleSpin = () => {
        if (!canSpin) {
            alert("You can only spin once per day. Come back tomorrow!");
            return;
        }

        setIsSpinning(true);
        setShowResult(false); // Hide previous result
        setPrizeIndex(null);

        // Randomly select a prize
        const randomIndex = Math.floor(Math.random() * prizes.length);
        setPrizeIndex(randomIndex);

        setTimeout(() => {
            setIsSpinning(false);
            setShowResult(true);

            if (prizes[randomIndex].value > 0) {
                setShowConfetti(true);
                addLoyaltyPoints(prizes[randomIndex].value);
                setTimeout(() => setShowConfetti(false), 2500);
            }

            // Hide confetti after a short delay
            const today = new Date().toISOString().split("T")[0];
            localStorage.setItem("lastSpinDate", today);
            setCanSpin(false); // Prevent further spins

        }, 4000); // Ensure spin lasts 4 seconds
    };

    const addLoyaltyPoints = (points) => {
        http.put(`/user/update/${user.id}/${points}`, {})
            .then(() => {
                setUser({ ...user, loyaltyPoints: user.loyaltyPoints + points });
            })
            .catch(() => console.error("Error updating points"));
    };

    return (
        <Dialog open={true} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle sx={{ textAlign: "center", fontWeight: 700 }}>
                🎡 Spin the Wheel to Win Points!
            </DialogTitle>
            <DialogContent sx={{ display: "flex", flexDirection: "column", alignItems: "center", minHeight: "450px" }}>
                {showConfetti && <Confetti />}

                <Box sx={{ width: "300px", height: "600px", display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <Wheel
                        mustStartSpinning={isSpinning}
                        prizeNumber={prizeIndex}
                        data={prizes}
                        backgroundColors={["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF"]}
                        textColors={["#ffffff"]}
                        outerBorderColor={"#ffffff"}
                        innerBorderColor={"#ffffff"}
                        radiusLineColor={"#ffffff"}
                        spinDuration={0.5} // Ensures smooth spinning
                        onStopSpinning={() => setIsSpinning(false)}
                    />
                </Box>

                {!isSpinning && (
                    <Button variant="contained" onClick={handleSpin} sx={{ mt: 2 }}>
                        Spin
                    </Button>
                )}

                {showResult && (
                    <Typography variant="h6" sx={{ mt: 2, fontWeight: "bold", color: "#333" }}>
                        🎉 {prizes[prizeIndex].option}
                    </Typography>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
}

export default SpinWheelGame;

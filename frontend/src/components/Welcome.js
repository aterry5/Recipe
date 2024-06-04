import React from "react";
import PlateAnimation from "../animations/PlateAnimation";

function Welcome() {
	return (
		<div className="welcome-container">
			<div className="left-section">
				<h1 className="welcome-title">PlateFull</h1>
				<p className="welcome-description">
					Share and discover delicious recipes with your friends.
				</p>
				<PlateAnimation />
			</div>
			<div className="right-section">
				<h2 className="welcome-grabber">Join PlateFull Today</h2>
				<button
					className="login-button"
					onClick={() => (window.location.href = "/login")}
				>
					Login
				</button>
				<button
					className="register-button"
					onClick={() => (window.location.href = "/login")}
				>
					Sign Up
				</button>
			</div>
		</div>
	);
}

export default Welcome;

import React, { useState, useEffect } from "react";

const PlateAnimation = () => {
	const [rotation, setRotation] = useState(0);

	useEffect(() => {
		const interval = setInterval(() => {
			setRotation((rotation) => rotation + 360);
		}, 2000);

		return () => clearInterval(interval);
	}, []);

	return (
		<div className="welcome-circle">
			<div style={{ transform: `rotateY(${rotation}deg)` }}></div>
		</div>
	);
};

export default PlateAnimation;

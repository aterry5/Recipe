import { useCookies } from "react-cookie";

function SaveCookie(firstName, lastName, userId) {
	const cookieData = {
		firstName: firstName,
		lastName: lastName,
		userId: userId,
	};

	const [cookies, setCookie] = useCookies(["userData"]);
	setCookie("userData", cookieData);
}

function ReadCookie() {
	const [cookies] = useCookies(["userData"]);

	if (cookies.userData) {
		return cookies.userData;
	} else {
		return null;
	}
}

export { SaveCookie, ReadCookie };

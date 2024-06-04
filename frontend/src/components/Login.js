import React, { useState } from "react";
import axios from "axios";
import { SaveCookie, ReadCookie } from "../components/Cookies";

function Login() {
	let loginName;
	let loginPassword;

	const [message, setMessage] = useState("");

	let bp = require("./Path.js");
	let storage = require("../tokenStorage.js");

	//const response = await fetch(bp.buildPath('api/login'), {method:'POST',body:js,headers:{'Content-Type': 'application/json'}});

	const doLogin = async (event) => {
		event.preventDefault();

		var obj = { login: loginName.value, password: loginPassword.value };
		var js = JSON.stringify(obj);

		var config = {
			method: "post",
			url: bp.buildPath("api/login"),
			headers: {
				"Content-Type": "application/json",
			},
			data: js,
		};

		axios(config)
			.then(function (response) {
				var res = response.data;
				if (res.error) {
					setMessage("User/Password combination incorrect");
				} else {
					storage.storeToken(res);

					var userId = res.id;
					var firstName = res.fn;
					var lastName = res.ln;

					var user = { firstName: firstName, lastName: lastName, id: userId };
					// SaveCookie(firstName, lastName, userId);
					localStorage.setItem("user_data", JSON.stringify(user));
					window.location.href = "/cards";
				}
			})
			.catch(function (error) {
				console.log(error);
			});
	};

	//     try
	//     {
	//         const response = await fetch(bp.buildPath('api/login'), {method:'POST',body:js,headers:{'Content-Type': 'application/json'}});

	//         var res = JSON.parse(await response.text());

	//         if( res.id <= 0 )
	//         {
	//             setMessage('User/Password combination incorrect');
	//         }
	//         else
	//         {
	//             storage.storeToken(res);

	//             let userId = res.id
	//             let firstName = res.fn;
	//             let lastName = res.ln;

	//             let user = {firstName:res.firstName,lastName:res.lastName,id:res.id}
	//             localStorage.setItem('user_data', JSON.stringify(user));

	//             setMessage('');
	//             window.location.href = '/cards';
	//         }
	//     }
	//     catch(e)
	//     {
	//         alert(e.toString());
	//         return;
	//     }
	// };

	return (
		<div id="loginDiv">
			<form onSubmit={doLogin}>
				<span id="inner-title">PLEASE LOG IN</span>
				<br />
				<input
					type="text"
					id="loginName"
					placeholder="Username"
					ref={(c) => (loginName = c)}
				/>
				<br />
				<input
					type="password"
					id="loginPassword"
					placeholder="Password"
					ref={(c) => (loginPassword = c)}
				/>
				<br />
				<input
					type="submit"
					id="loginButton"
					className="buttons"
					value="Do It"
					onClick={doLogin}
				/>
			</form>
			<span id="loginResult">{message}</span>
		</div>
	);
}
export default Login;

import React, { useState } from 'react';
import axios from 'axios';

export default function Register()
{
   var bp = require('./Path.js');

   var firstName = 'placeholder';
   var lastName = 'placeholder';
   var email = 'placeholder';
   var login = 'placeholder';
   var password = 'placeholder';

   const [message, setMessage] = useState('');
   
   // function that registers new user
   const doRegister = async event =>
   {
      event.preventDefault();

      var obj = {firstName:firstName.value,lastName:lastName.value,email:email.value,login:login.value,password:password.value}
      var js = JSON.stringify(obj);


      // defining the data to be input to the register api
      try
      {
         const response = await fetch(
            bp.buildPath('api/register'), 
            {
               method:'POST',
               body:js,
               headers:
               {'Content-Type': 'application/json'}
            }
         );

         var txt = await response.text();
         var res = JSON.parse(txt);

         if (res.error.length > 0)
         {
            setMessage( "Register API Error:" + res.error);
         }
         else
         {
            setMessage('New User Registered');
            }
         }
         catch(e)
         {
            setMessage(e.toString());
         }

      };

      
   return(
      <div id="registerDiv">
         <form onSubmit={doRegister}>
            <span id="register-title">Register</span>
            <br/>
            <input type="text" id="firstName" placeholder="First Name" ref={(c) => firstName = c} /><br />
            <input type="text" id="lastName" placeholder="Last Name" ref={(c) => lastName = c} /><br />
            <input type="text" id="email" placeholder="Email" ref={(c) => email = c} /><br />
            <input type="text" id="loginName" placeholder="Username" ref={(c) => login = c} /><br />
            <input type="password" id="loginPassword" placeholder="Password" ref={(c) => password = c} /><br />
            
            <input type="submit" id="loginButton" className="buttons" value = "Register" onClick={doRegister} />
        </form>
        <span id="registerResult">{message}</span>

      </div>
   )
}
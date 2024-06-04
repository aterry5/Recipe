require('express');
require('mongodb');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const uuid = require('uuid');
const jwt = require('jsonwebtoken');
require("dotenv").config();
const mongoose = require('mongoose');

exports.setApp = function(app,client)
{
    //load user model
    const User = require("./models/user.js");
    //load card model
    const Card = require("./models/card.js");

    const Recipe = require("./models/recipe.js");

    const SavedRecipe = require("./models/savedRecipe.js");

    app.post('/api/addcard', async (req, res, next) => 
    {     
    let token = require('./createJWT.js');
    const { userId, card, jwtToken } = req.body;
    
    try
    {
      if( token.isExpired(jwtToken))
      {
        var r = {error:'The JWT is no longer valid', jwtToken: ''};
        res.status(200).json(r);
        return;
      }
    }
    catch(e)
    {
      console.log(e.message);
    }
    const newCard = new Card({ Card: card, UserId: userId });
    var error = '';
    try 
    {
        newCard.save();
    }
      catch (e) 
    {
        error = e.toString();
    }


    var refreshedToken = null;
      try
      {
        refreshedToken = token.refresh(jwtToken);
      }
      catch(e)
      {
        console.log(e.message);
      }
    
      var ret = { error: error, jwtToken: refreshedToken };
      res.status(200).json(ret);

    });

    app.post('/api/register', async (req, res, next) => {
      const { firstName, lastName, email, login, password } = req.body;
      let error = '';
    
      const emptyFields = [];
      if (!firstName) {
        emptyFields.push('First Name');
      }
      if (!lastName) {
        emptyFields.push('Last Name');
      }
      if (!email) {
        emptyFields.push('Email');
      }
      if (!login) {
        emptyFields.push('Login');
      }
      if (!password) {
        emptyFields.push('Password');
      }
    
      if (emptyFields.length > 0) {
        error = ` Missing: ${emptyFields.join(', ')}; Please input all fields.`;
        return res.status(400).json({ error: error });
      }
    
      const results = await User.find({ Login: login });
      if (results.length > 0) {
        error = 'Login Taken';
        return res.status(409).json({ error: error });
      }
    
      try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationToken = uuid.v4(); // generate a unique verification token
    
        const newUser = new User({
          FirstName: firstName,
          LastName: lastName,
          Email: email,
          Login: login,
          Password: hashedPassword,
          verificationToken: verificationToken, // store the verification token in the database
        });
    
        await newUser.save();
    
        // send email with verification link to the user
        const transporter = nodemailer.createTransport({
          host: 'smtp.office365.com',
          port: 587,
          auth: {
            user: 'PlateFull111@outlook.com',
            pass: 'Wsad@12345',
          },
          tls: {
            ciphers: 'SSLv3',
          },
        });
    
        const verificationLink = `http://large-project-poos.herokuapp.com/verify?token=${verificationToken}`;
        const mailOptions = {
          from: 'PlateFull111@outlook.com',
          to: email,
          subject: 'PlateFull: Verify your account',
          html: `Thanks you for creating an account with PlateFull! Click <a href="${verificationLink}">here</a> to verify your account.`,
        };
    
        await transporter.sendMail(mailOptions);
    
        return res.status(200).json({ message: 'Registration successful. Please check your email to verify your account.' });
      } catch (error) {
        console.error(error);
        error = error.toString();
        return res.status(500).json({ error: error });
      }
    });

app.get('/verify', async (req, res) => {
  const { token } = req.query;
  try {
    // Find user by verification token
    const user = await User.findOne({ verificationToken: token });
    if (!user) {
      return res.status(400).json({ message: 'Invalid verification token' });
    }
    // Verify user and save to database
    user.isVerified = true;
    user.verificationToken = null;
    await user.save();
    // Send response indicating successful verification
    return res.status(200).json({ message: 'Verification successful' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}); 

app.post('/api/login', async (req, res, next) => {
  const { login, password } = req.body;
  let error = '';

  // check for empty input fields
  if (!login) {
    error = 'Login field is empty';
  } else if (!password) {
    error = 'Password field is empty';
  }

  if (error) {
    return res.status(400).json({ error });
  }

  let token = null;
  let user = null;
  let ret;
  let fn;
  let ln;

  try {
    const foundUser = await User.findOne({ Login: login });
    if (!foundUser) {
      error = 'User not found';
    } else if (!foundUser.isVerified) {
      error = 'User not verified';
    } else {
      const isMatch = await bcrypt.compare(password, foundUser.Password);
      if (!isMatch) {
        error = 'Incorrect password';
      } else 
      {
        // generate JWT token
       // token = jwt.sign({ userId: foundUser._id }, process.env.ACCESS_TOKEN_SECRET, {
       //   expiresIn: '1h'
       // });
        // extract user info

        id = foundUser._id;
        fn = foundUser.FirstName;
        ln = foundUser.LastName;

        const token = require("./createJWT.js");
        ret = token.createToken( fn, ln, id );

        user = {
          id: foundUser._id,
          firstName: foundUser.FirstName,
          lastName: foundUser.LastName
        };
      }
    }
  } catch (e) {
    error = e.toString();
  }

  if (error) {
    return res.status(401).json({ error });
  }

  res.status(200).json(ret);
  //res.json({ jwtToken:token, user });
});

// Send forgot password email
app.post('/api/forgotPassword', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ Email: email });

    if (!user) {
      return res.status(400).json({ message: 'No user with that email address exists' });
    }

    const resetToken = uuid.v4();
    user.resetToken = resetToken;
    user.resetTokenExpiration = Date.now() + 36000000; // 1 hour

    await user.save();

    const transporter = nodemailer.createTransport({
      host: 'smtp.office365.com',
      port: 587,
      auth: {
        user: 'PlateFull111@outlook.com',
        pass: 'Wsad@12345',
      },
      tls: {
        ciphers: 'SSLv3',
      },
    });

    const resetLink = `http://large-project-poos.herokuapp.com/api/reset-password/${resetToken}`;
    const mailOptions = {
      from: 'PlateFull111@outlook.com',
      to: email,
      subject: 'PlateFull: Password Reset',
      html: `You are receiving this email because you (or someone else) have requested to reset the password for your account.<br /><br />
      Please click the following link, or paste it into your browser to reset your password:<br />
      <a href="${resetLink}">${resetLink}</a><br /><br />
      If you did not request this, please ignore this email and your password will remain unchanged.`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'Email sent with password reset instructions' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Render reset password page
app.get('/api/reset-password/:token', (req, res) => {
  const { token } = req.params;
  res.send(`
    <html>
      <head>
        <title>Reset Password</title>
        <link rel="stylesheet" type="text/css" href="/path/to/reset-password.css">
      </head>
      <body>
        <h1>Reset Password</h1>
        <form id="resetPasswordForm" data-token="${token}">
          <label for="password">New Password</label>
          <div style="display: flex;">
            <input type="password" id="password" name="password" required style="flex-grow: 1;">
            <label style="margin-left: 10px;">
              <input type="checkbox" id="showPasswordCheckbox"> Show password
            </label>
          </div>
          <button type="submit">Reset Password</button>
          <div id="error"></div>
        </form>
        <div id="success" style="display:none">
          <h2>Password has been reset!</h2>
          <p>You can now <a href="/login">log in</a> with your new password.</p>
        </div>
        <script src="/path/to/reset-password.js"></script>
        <script>
          const resetPasswordForm = document.querySelector('#resetPasswordForm');
          const passwordInput = document.querySelector('#password');
          const showPasswordCheckbox = document.querySelector('#showPasswordCheckbox');

          resetPasswordForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const password = passwordInput.value.trim();
            const token = resetPasswordForm.dataset.token;

            console.log(password);

            if (!password) {
              document.querySelector('#error').textContent = 'Password is required';
              return;
            }

            try {
              const response = await fetch(\`/api/reset-password/\${token}\`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({ password: password })
              });

              if (response.ok) {
                document.querySelector('#success').style.display = 'block';
                resetPasswordForm.style.display = 'none';
              } else {
                const { message } = await response.json();
                document.querySelector('#error').textContent = message;
              }
            } catch (error) {
              console.error(error);
              document.querySelector('#error').textContent = 'Internal server error';
            }
          });

          showPasswordCheckbox.addEventListener('change', () => {
            if (showPasswordCheckbox.checked) {
              passwordInput.type = 'text';
            } else {
              passwordInput.type = 'password';
            }
          });
        </script>
      </body>
    </html>
  `);
});

// Reset password
app.post('/api/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const user = await User.findOne({ resetToken: token });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.Password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpiration = undefined;

    await user.save();

    res.status(200).json({ message: 'Password has been reset' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


app.post('/api/searchcards', async (req, res, next) => 
    {
      let  error = '';
      let token = require('./createJWT.js');
      const { userId, card, jwtToken } = req.body;

      try
      {
          if( token.isExpired(jwtToken))
          {
              var r = {error:'The JWT is no longer valid', jwtToken: ''};
              res.status(200).json(r);
              return;
          }
      }
      catch(e)
      {
          console.log(e.message);
      }

      var _search = search.trim();
      const results = await Card.find({ "Card": { $regex: _search + '.*', $options: 'r' } });
    
      
      var _ret = [];
      for( var i=0; i<results.length; i++ )
      {
          _ret.push( results[i].Card );
      }
      
      var refreshedToken = null;
      try
      {
          refreshedToken = token.refresh(jwtToken);
      }
      catch(e)
      {
          console.log(e.message);
      }

      var ret = { results:_ret, error: error, jwtToken: refreshedToken };
      
      res.status(200).json(ret);

    });



    app.post('/api/addrecipe', async (req, res, next) =>
    {
      let token = require('./createJWT.js');
      const { userId, recipeName, time, difficulty, description, ingredients, equipment, instructions, image, jwtToken } = req.body;
      
      try
      {
        if( token.isExpired(jwtToken))
        {
          var r = {error:'The JWT is no longer valid', jwtToken: ''};
          res.status(200).json(r);
          return;
        }
      }
      catch(e)
      {
        console.log(e.message);
      }

      
      var error = '';
      try 
      {
        const newRecipe = new Recipe({UserId: userId, RecipeName: recipeName, Time: time, Difficulty: difficulty, 
          Description: description, Ingredients: ingredients, Equipment: equipment, 
          Instructions: instructions, Image: image, Rating: 0, NumOfRatings: 0, SumOfRatings: 0});

        newRecipe.save();
      }
        catch (e) 
      {
          error = e.toString();
      }

        var refreshedToken = null;
        try
        {
        refreshedToken = token.refresh(jwtToken);
        }
        catch(e)
        {
        console.log(e.message);
        }

      var ret = { error: error, jwtToken: refreshedToken };
      res.status(200).json(ret);

    });

    app.post('/api/saverecipe', async (req, res, next) =>
    {

      let token = require('./createJWT.js');
      const { userId, recipeId, recipeName, time, difficulty, description, ingredients, equipment, instructions, image, rating, numOfRatings, sumOfRatings, jwtToken} = req.body;
      
      try
      {
        if( token.isExpired(jwtToken))
        {
          var r = {error:'The JWT is no longer valid', jwtToken: ''};
          res.status(200).json(r);
          return;
        }
      }
      catch(e)
      {
        console.log(e.message);
      }
    

      
      var error = '';
      try 
      {
        const newSave = new SavedRecipe({UserId: userId, RecipeId: recipeId,RecipeName: recipeName, Time: time, Difficulty: difficulty, 
          Description: description, Ingredients: ingredients, Equipment: equipment, 
          Instructions: instructions, Image: image, Rating: rating, NumOfRatings:numOfRatings, SumOfRatings: sumOfRatings});
        newSave.save();
      }
        catch (e) 
      {
          error = e.toString();
      }

  
      var refreshedToken = null;
      try
      {
      refreshedToken = token.refresh(jwtToken);
      }
      catch(e)
      {
      console.log(e.message);
      }
    

      var ret = { error: error, jwtToken: refreshedToken };
      res.status(200).json(ret);

    }); 


    app.post('/api/searchrecipes', async (req, res, next) => 
    {
      let  error = '';
	  
      let token = require('./createJWT.js');
      const { userId, search, jwtToken} = req.body;

      try
      {
          if( token.isExpired(jwtToken))
          {
              var r = {error:'The JWT is no longer valid', jwtToken: ''};
              res.status(200).json(r);
              return;
          }
      }
      catch(e)
      {
          console.log(e.message);
      }
		
		
      var _search = search.trim();
	    var _userId = userId.trim();

      const results = await Recipe.find({ "UserId":{ $regex: _userId + '.*'},"RecipeName": { $regex: _search + '.*',$options: 'i'} });

      
      var refreshedToken = null;
      try
      {
          refreshedToken = token.refresh(jwtToken);
      }
      catch(e)
      {
          console.log(e.message);
      }
		
      var ret = { results:results, error: error, jwtToken: refreshedToken };
      res.status(200).json(ret);

    });

    app.post('/api/searchsavedrecipes', async (req, res, next) => 
    {

      let  error = '';
	  
	  
	  
      let token = require('./createJWT.js');
      const { userId, search, jwtToken } = req.body;

      try
      {
          if( token.isExpired(jwtToken))
          {
              var r = {error:'The JWT is no longer valid', jwtToken: ''};
              res.status(200).json(r);
              return;
          }
      }
      catch(e)
      {
          console.log(e.message);
      }
		
		
      var _search = search.trim();
	    var _userId = userId.trim();
      const results = await SavedRecipe.find({ "UserId":{ $regex: _userId + '.*'},"RecipeName": { $regex: _search + '.*',$options: 'i'} });

      
      var refreshedToken = null;
      try
      {
          refreshedToken = token.refresh(jwtToken);
      }
      catch(e)
      {
          console.log(e.message);
      }
		
      var ret = { results:results, error: error, jwtToken: refreshedToken };      
      res.status(200).json(ret);

    });

    app.post('/api/editrecipe', async (req, res, next) =>
    {

      let token = require('./createJWT.js');
      const { recipeId, recipeName, time, difficulty, description, ingredients, equipment, instructions, image, rating, numOfRatings, sumOfRatings, jwtToken} = req.body;
     
        
      try
      {
        if( token.isExpired(jwtToken))
        {
          var r = {error:'The JWT is no longer valid', jwtToken: ''};
          res.status(200).json(r);
          return;
        }
      }
      catch(e)
      {
        console.log(e.message);
      }
    
    

      var error = '';

      try 
      {
        
        await Recipe.updateOne({_id: recipeId},{RecipeName:recipeName,Time:time,Difficulty:difficulty,
          Description:description,Ingredients:ingredients, Equipment:equipment, Instructions:instructions, Image:image,
          Rating:rating, NumOfRatings:numOfRatings, SumOfRatings:sumOfRatings});

      }
        catch (e) 
      {
          error += "Recipe:"+e.toString()+" ";
      }

      try 
      {
        
        await SavedRecipe.updateOne({RecipeId: recipeId},{RecipeName:recipeName,Time:time,Difficulty:difficulty,
          Description:description,Ingredients:ingredients, Equipment:equipment, Instructions:instructions, Image:image,
          Rating:rating, NumOfRatings:numOfRatings, SumOfRatings:sumOfRatings});

      }
        catch (e) 
      {
          error += "SavedRecipe:"+e.toString();
      }

      

  
      var refreshedToken = null;
      try
      {
      refreshedToken = token.refresh(jwtToken);
      }
      catch(e)
      {
      console.log(e.message);
      }
  

      var ret = { error: error, jwtToken: refreshedToken };
      res.status(200).json(ret);

    });

   
    
    app.post('/api/deleterecipe', async (req, res, next) =>
    {

      let token = require('./createJWT.js');
      const { recipeId, jwtToken } = req.body;
    
      
      try
      {
        if( token.isExpired(jwtToken))
        {
          var r = {error:'The JWT is no longer valid', jwtToken: ''};
          res.status(200).json(r);
          return;
        }
      }
      catch(e)
      {
        console.log(e.message);
      }
      
      

      var error = '';
      try 
      {

        await Recipe.deleteOne({_id: recipeId});
      }
        catch (e) 
      {
          error = e.toString();
      }

  
      var refreshedToken = null;
      try
      {
      refreshedToken = token.refresh(jwtToken);
      }
      catch(e)
      {
      console.log(e.message);
      }
  

      var ret = { error: error, jwtToken: refreshedToken };
      res.status(200).json(ret);

    });

    app.post('/api/removesave', async (req, res, next) =>
    {

      let token = require('./createJWT.js');
      const { userId, recipeId, jwtToken } = req.body;
      
      
      try
      {
        if( token.isExpired(jwtToken))
        {
          var r = {error:'The JWT is no longer valid', jwtToken: ''};
          res.status(200).json(r);
          return;
        }
      }
      catch(e)
      {
        console.log(e.message);
      }
    


      var error = '';
      try 
      {

        await SavedRecipe.deleteOne({UserId: userId, RecipeId: recipeId});
      }
        catch (e) 
      {
          error = e.toString();
      }

    
      var refreshedToken = null;
      try
      {
      refreshedToken = token.refresh(jwtToken);
      }
      catch(e)
      {
      console.log(e.message);
      }
    

      var ret = { error: error, jwtToken: refreshedToken };
      res.status(200).json(ret);

    });

    app.post('/api/raterecipe', async (req, res, next) =>
    {

      let token = require('./createJWT.js');
      const { recipeId, rating, numOfRatings, sumOfRatings, submitRating, jwtToken} = req.body;
	  
      let sum = sumOfRatings+submitRating;
      let num = numOfRatings+1;
      let newRating = sum/num;
      
        
      try
      {
        if( token.isExpired(jwtToken))
        {
          var r = {error:'The JWT is no longer valid', jwtToken: ''};
          res.status(200).json(r);
          return;
        }
      }
      catch(e)
      {
        console.log(e.message);
      }
      
      

      var error = '';

      try 
      {
        
        await Recipe.updateOne({_id: recipeId},{Rating:newRating, NumOfRatings:num, SumOfRatings:sum});

      }
        catch (e) 
      {
          error += "Recipe:"+e.toString()+" ";
      }

      try 
      {
        
        await SavedRecipe.updateOne({RecipeId: recipeId},{Rating:newRating, NumOfRatings:num, SumOfRatings:sum});

      }
        catch (e) 
      {
          error += "SavedRecipe:"+e.toString();
      }

        

    
      var refreshedToken = null;
      try
      {
      refreshedToken = token.refresh(jwtToken);
      }
      catch(e)
      {
      console.log(e.message);
      }
  

      var ret = { error: error, jwtToken: refreshedToken };
      res.status(200).json(ret);

    });

}

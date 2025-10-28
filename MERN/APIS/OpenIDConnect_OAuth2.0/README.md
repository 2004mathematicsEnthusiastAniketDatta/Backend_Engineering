## OpednID Connect 
Identity Authentication Protocol built on top of OAuth2.0,enabling applications to verify user identity and obtain basic profile information , supporting , single sign-on accross applications.
- Auth Service issuing tokens and public key google.com/public-key
<!-- Read -->
<img src='/workspaces/Backend_Engineering/MERN/APIS/OpenIDConnect_OAuth2.0/dotwelldashknownslashopeniddashconnect.png'/>
app.get('/login/oauth/.well-known/openid-configuration',(req,res)=>{
    res.json({jwks_uri:'https://github.com/login/oauth/.well-known/jwks'})
})
app.get('/login/oauth/.well-known/jwks.json',(req,res)=>{
res.json({<!-- public key  -->})
});
JWT.sign({"sub":"1234567890","name":"example","admin":true,"aud":"audience","iss":"https://github.com",<!--Claims-->},secret);
<!-- see -->
<img src='/workspaces/Backend_Engineering/MERN/APIS/OpenIDConnect_OAuth2.0/openid_connect.png'/> </br>
https://github.com/login/oauth/.well-known/openid-configuration-> openid-Configuration for github.com/login
BASE_URI=https://github.com



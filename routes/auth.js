const express = require('express');
const app = express.Router();

app.get('/', (req,res) => {
	dbx.auth.getAuthenticationUrl(redirectUri, null, 'code', 'offline', null, 'none', false)
	.then((authUrl) =>
	{
		res.writeHead(302, {Location : authUrl});
		res.end();
	});
});

app.get('/auth', function(req, res) {
	const {code} = req.query;
	console.log('code:${code}');
	
	dbx.auth.getAccessTokenFromCode(redirectUri, code)
		.then((token) => {
			console.log(`Token Result:$(JSON.stringify(token)}`);
			dbx.auth.setRefreshToken(token.result.refresh_token);
			dbx.usersGetCurrentAccount()
				.then((response) =>
				{
					console.log('response', response);					
				})
				.catch((error) =>
				{
					console.log(error);
				});
		})
		.catch((error) =>
		{
			console.log(error);
		});
});
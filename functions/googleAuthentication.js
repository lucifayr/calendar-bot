"use strict";

const readline = require('readline');
const { google } = require('googleapis');
const axios = require("axios");
const TOKEN_PATH = 'token.json';
const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];

const authorize = (credentials, callback) => {
	const { client_secret, client_id, redirect_uris } = credentials.installed;
	const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

	fs.readFile(TOKEN_PATH, (err, token) => {
		if (err) return getAccessToken(oAuth2Client, callback);
		oAuth2Client.setCredentials(JSON.parse(token));
		callback(oAuth2Client);
	});
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */

const getAccessToken = (oAuth2Client, callback) => {
	const authUrl = oAuth2Client.generateAuthUrl({
		access_type: 'offline',
		scope: SCOPES,
	});
	console.log('Authorize this app by visiting this url:', authUrl);
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
	});
	rl.question('Enter the code from that page here: ', (code) => {
		rl.close();
		oAuth2Client.getToken(code, (err, token) => {
			if (err) return console.error('Error retrieving access token', err);
			oAuth2Client.setCredentials(token);
			// Store the token to disk for later program executions
			fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
				if (err) return console.error(err);
				console.log('Token stored to', TOKEN_PATH);
			});
			callback(oAuth2Client);
		});
	});
}

const refreshAccessToken = async (refreshToken, clientID, clientSecret) => {

    const response = await axios.post('https://oauth2.googleapis.com/token', {
        refresh_token: refreshToken,
        client_id: clientID,
        client_secret: clientSecret,
        grant_type: 'refresh_token'
    })
 
    const accessToken = response.data.access_token;
    const expiryDate = response.data.expiry_date; 

    let content = JSON.parse(fs.readFileSync(TOKEN_PATH));
    content.access_token = accessToken;
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(content));

    content = JSON.parse(fs.readFileSync(TOKEN_PATH));
    content.expiry_date = expiryDate;
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(content));
}

const getNewAccessToken = () => {
    fs.readFile(CREDETIALS_PATH, (err, content) => {
        if(err) return console.log(err);
        const {client_id, client_secret} = JSON.parse(content).installed
        fs.readFile(TOKEN_PATH, (err, content) => {
            if (err) return console.log(err);
            const token = JSON.parse(content).refresh_token;
            return refreshAccessToken(token, client_id, client_secret);            
        })
    })
}

module.exports.authorize = authorize;
module.exports.getNewAccessToken = getNewAccessToken;
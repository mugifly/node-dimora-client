# node-dimora-client

Unofficial client module for DiMORA.
It works on Node.js v8+.

[![npm](https://img.shields.io/npm/v/dimora-client.svg?maxAge=2592000)](https://www.npmjs.com/package/dimora-client)
[![Build Status](https://travis-ci.org/mugifly/node-dimora-client.svg?branch=master)](https://travis-ci.org/mugifly/node-dimora-client)


----


## Notice

* This software is published under testing phase.
* This is unofficial software for the convenience of owners (and also Node.js engineers) of the TV-recorders connected with DiMORA.
* I don't any guarantee about this software.
* I don't have any relationship with the company of DiMORA or the vendors of the TV-recorders.


----


## Get Started

### 1. Installation

Install this module and additional module for an example code.

``$ npm install --save dimora-client readline-sync``

### 2. Logging-in (Getting Session JSON)

This step is required when you perform operations requiring membership on DiMORA (such as recording reservation).

```js
const LoginChallenger = require('dimora-client/libs/login-challenger');
const readlineSync = require('readline-sync');

// TODO: Put your Login ID and Login Password of DiMORA to here
const YOUR_LOGIN_ID = '';
const YOUR_LOGIN_PW = '';
// ------------------------------

// Start a challenge for login
let loginChallenger = new LoginChallenger((error, captcha_img_buffer) => {

	if (error) {
		console.error(error);
		process.exit(1);
	}

	// Save the CAPTCHA image
	console.log(`CAPTCHA image was saved to ${__dirname}/tmp-captcha.jpg`);
	require('fs').writeFileSync(`${__dirname}/tmp-captcha.jpg`, captcha_img_buffer);

	// You need to enter the answer the CAPTCHA image while at this challenge
	const captcha_answer = readlineSync.question('Input an answer of CAPTCHA: ');
	console.log(captcha_answer);

	// Finish the challenge with your login ID, password and an answer of CAPTCHA
	loginChallenger.finish(YOUR_LOGIN_ID, YOUR_LOGIN_PW, captcha_answer, (error, session_json) => {

		if (error) {
			console.error(error);
			process.exit(1);
		}

		// NOTE: You can skip challenge from next time by use this Session JSON
		console.log(`Your challenge was successful.\n Here is Session JSON: \n---------------\n${session_json}\n`);

	});

});
```

### 3. Searching for TV Program and Recording Reservation

```js
const DimoraClient = require('dimora-client');
const readlineSync = require('readline-sync');

// TODO  Put your Session JSON acquired in step 2 to here
const YOUR_SESSION_JSON = null;
// ------------------------------

// Initialize the Client with the Session JSON
const client = new DimoraClient(YOUR_SESSION_JSON);

// Now, you can searching for TV program on DiMORA
console.log('Let\'s searching TV schedules.');
const search_keyword = readlineSync.question('Input a keyword: ');

client.tvSchedules.fetch({
	channelTypes: ['TE', 'BS', 'CS'], // 'TE' (地デジ), 'BS' (BSデジ), 'CS' (CSデジ)
	keyword: search_keyword
}, (error, tv_schedules) => {

	if (error) {
		console.error('error: ', error);
		process.exit(1);
	}

	// Display the search results
	tv_schedules.forEach((tv_schedule, i) => {
		console.log(`[${i}] ${tv_schedule.getStartDate()} - ${tv_schedule.getTitle()} (${tv_schedule.getBroadcasterName()})`);
	});

	// Of course, you can also make a Reservation Recording on your recorder
	console.log('Which programs do you record?');
	const record_index = readlineSync.question('Input an ID: ');

	if (record_index.match(/^[0-9]+$/) && tv_schedules[parseInt(record_index)]) {

		const tv_schedule = tv_schedules[parseInt(record_index)];

		console.log(`Making reservation... ${tv_schedule.getTitle()}`);
		tv_schedule.recordOnce((error) => {

			if (error) {
				console.error('error: ', error);
				process.exit(1);
			}

			console.log(`OK! ${tv_schedule.getTitle()} will be recorderd`);

		});

	}

});
```


----


## API Documents

https://mugifly.github.io/node-dimora-client/DimoraClient.html


----

## Trademarks of Third Party

* "DiMORA" is a trademark of Panasonic Coporation.


----


## License

```
The MIT License (MIT)
Copyright (c) 2017 Masanori Ohgita
```

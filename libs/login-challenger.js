'use strict';


const Nightmare = require('nightmare');


/**
 * <p>
 * A method to initialize an instance and start challenging the login.<br>
 * This method will be return a CAPTCHA image via the callback.<br>
 * Then, you need to provide the login ID, password, and the answer of CAPTCHA to {@link LoginChallenger#finish} method.
 * </p>
 * <p>
 * インスタンスを初期化し、ログインのためのチャレンジを開始するメソッド。<br>
 * 本メソッドを呼び出すと、コールバックにより、CAPTCHA画像が得られますので、<br>
 * 続けて、ログインID、パスワード、CAPTCHAの回答を揃えて、{@link LoginChallenger#finish} メソッドを呼び出してください。
 * </p>
 *
 * @class This module will be makes challenge to login to DiMORA.<br>
 * 	このモジュールは、 DiMORA へログインするためのチャレンジを行います。
 * @constructor
 * @param {LoginChallenger~startCallback} callback  An callback function
 */
const LoginChallenger = function (callback) {

	this.BASE_URL = 'https://dimora.jp/';

	this.nightmareOptions = {
		height: 1600
	};
	this.nightmare = null;

	this._start(callback);

};


/**
 * <p>
 *  A method to finish the login challenge.<br>
 *  This method returns the session data that after logged-in, via the callback.<br>
 *  You can use this session data on {@link DimoraClient}.
 * </p>
 * <p>
 *  ログインのチャレンジを完了するためのメソッド。<br>
 *  このメソッドは、コールバックを介し、ログイン後のセッションデータを返します。<br>
 *  このセッションデータは {@link DimoraClient} で使用することができます。
 * </p>
 * @param  {String}   login_id       An login ID of DiMORA
 * @param  {String}   login_pw       An login password
 * @param  {String}   captcha_answer An answer of CAPTCHA image
 * @param  {LoginChallenger~finishCallback} callback    An callback function
 */
LoginChallenger.prototype.finish = function (login_id, login_pw, captcha_answer, callback) {

	const self = this;

	if (!self.nightmare) return callback(new Error('nightmare is not initialized'). null);

	self.nightmare
		// Send the login form
		.evaluate((login_id, login_pw, captcha_answer) => {

			// Input the field - Login ID
			document.getElementById('loginId').value = login_id;

			// Input the field - Login Password
			document.getElementById('loginPass').value = login_pw;

			// Input the field - Answer of CAPTCHA
			document.getElementById('loginImgNm').value = captcha_answer;

			// Turn on the checkbox - Auto Login
			document.getElementById('autologin').checked = true;

			// Submit the login form
			window.setTimeout(function () {

				document.getElementById('loginBtn').click();

			});

		}, login_id, login_pw, captcha_answer)
		// Wait
		.wait(10000)
		// Take a screen shot
		.screenshot('tmp.png')
		// TODO: We need to verify that the login was successful
		// Get a session data
		.cookies.get()
		.end()
		.then((session_data) => {

			// Call the callback
			return callback(null, JSON.stringify(session_data));

		})
		.catch((error) => {

			return callback(error, null);

		});

};


/**
 * Start the login challenge
 * @private
 * @param  {LoginChallenger~startCallback} callback    An callback function
 */
LoginChallenger.prototype._start = function (callback) {

	const self = this;

	this.nightmare = Nightmare(this.nightmareOptions);

	this.nightmare
		// Load the login page
		.goto(self.BASE_URL + 'login/')
		// Take a screen shot
		.screenshot('tmp.png')
		// Fetch an CAPTCHA image as BASE64 string
		.evaluate(() => {

			// Find an element of the CAPTCHA image
			var captcha_img_elem = null;
			var images = document.getElementsByTagName('img');
			for (var i = 0; i < images.length; i++) {
				if (images[i].src && images[i].src.match(/captcha\.jpg/)) {
					captcha_img_elem = images[i];
					break;
				}
			}

			if (!captcha_img_elem) {
				return null;
			}

			// Draw an image to an canvas
			var canvas = document.createElement('canvas');
			canvas.width  = captcha_img_elem.width;
			canvas.height = captcha_img_elem.height;
			var ctx = canvas.getContext('2d');
			ctx.drawImage(captcha_img_elem, 0, 0);

			// Get a drawed image as BASE64 string
			return canvas.toDataURL('image/jpeg');

		})
		.then((captcha_base64_str) => {

			// Call the error callback
			if (!captcha_base64_str) {
				return callback(new Error('Could not find an CAPTCHA image.'), null);
			}

			// Convert the BASE64 string to the buffer
			const captcha_img_buffer = Buffer.from(captcha_base64_str.split(',')[1], 'base64');

			// Call the callback
			return callback(null, captcha_img_buffer);

		})
		.catch((error) => {

			return callback(error, null);

		});

};


module.exports = LoginChallenger;


// ----

/**
 * An callback of LoginChallenger.start(...) method.
 * It has the captcha image.
 * @callback LoginChallenger~startCallback
 * @param {Error} error                 An error object (If something happened)
 * @param {Buffer} captcha_img_buffer   An buffer of the CAPTCHA image
 */

/**
 * An callback of LoginChallenger.finish(...) method.
 * It has the result of login challenge.
 * @callback LoginChallenger~finishCallback
 * @param {Error} error           An error object (If something happened)
 * @param {String} session_data   A session data<br>
 *  You can skip challenge from next time by use this session data (serialized string).
 */

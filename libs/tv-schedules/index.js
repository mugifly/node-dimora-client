'use strict';


const Nightmare = require('nightmare');


/**
 * <p>
 *   A constructor to initialize TvSchedules instance.<br>
 *   NOTICE: This module is a part of DimoraClient module. You should not to call this constructor as directly.
 * </p>
 * <p>
 *   TvSchedules の インスタンスを初期化するためのコンストラクタ。<br>
 *   お知らせ: このモジュールは {@link DimoraClient} モジュールの一部です。このコンストラクタは直接呼び出さないでください。
 * </p>
 * @class
 *  This sub module provides an information about scheduled TV programs.<br>
 *  このサブモジュールは、放送予定のテレビ番組についての情報を提供します。
 * @hideconstructor
 * @param {DimoraClient} client  An instance of DimoraClient module
 */
const TvSchedules = function (client) {

	this.client = client;

	this.nightmare = Nightmare({});

};


/**
 * A method to fetch a list of the scheduled Tv programs<br>
 * 放送が予定されているテレビ番組のリストを取得するメソッド<br>
 * @param  {TvSchedules~fetchFilter} filter      A filter conditions
 * @param  {TvSchedules~fetchCalback} callback  An callback function
 */
TvSchedules.prototype.fetch = function (filter = {}, callback) {

	const self = this;

	if (!filter.keyword) return callback(new Error('filter.keyword is required'), null);

	// Set the session data
	self.client.sessionData.forEach((session_data, index) => {

		session_data.url = self.client.BASE_URL;
		self.nightmare.cookies.set(session_data);

	});

	// Execute searching
	self.nightmare
		// Load the top page
		.goto(self.client.BASE_URL)
		// Input the form
		.evaluate((filter) => {

			// Input the field - Keyword
			document.getElementById('frwSwhInp').value = filter.keyword;

			// Submit the form
			document.getElementById('frwSwhBtn').click();

		}, filter)
		// Wait
		.wait(1000)
		// Take a screen shot
		.screenshot('tmp.png')
		// Fetch the result items
		.evaluate(() => {

			let items = [];

			const item_elems = document.querySelectorAll('.fwSearchMain .pgmInnArea');
			item_elems.forEach((item_elem, index) => {

				// Get a program title
				const program_title = item_elem.querySelector('.pgmLinkTtl').innerText;
				if (program_title == '') {
					// To next item
					return;
				}

				// Get a program date (e.g. "12/23（土）22:00～22:54")
				const program_date_str = item_elem.querySelector('.pgmTimeTxt').innerText;

				// Get a broadcaster name
				const program_broadcaster = item_elem.querySelector('.pgmBcsTxt').innerText;

				// Parse the program date
				let today = new Date();
				let program_start_date = null;
				let program_end_date = null;
				if (program_date_str.match(/(\d{2,2})\/(\d{2,2})[\S\s]*(\d{2,2}):(\d{2,2})\S(\d{2,2}):(\d{2,2})/)) {
					let program_start_month = RegExp.$1 - 1;
					let program_start_day = RegExp.$2;
					program_start_date = new Date(today.getFullYear(), program_start_month, program_start_day, RegExp.$3, RegExp.$4, 0);
					program_end_date = new Date(today.getFullYear(), program_start_month, program_start_day, RegExp.$5, RegExp.$6, 0);
				} else {
					// To next item
					return;
				}

				// Insert to array
				items.push({
					title: program_title,
					startDate: program_start_date,
					endDate: program_end_date,
					broadcasterName: program_broadcaster
				});

			});

			return items;

		})
		.end()
		.then((items) => {

			return callback(null, items);

		})
		.catch((error) => {

			return callback(error, null);

		});

};


module.exports = TvSchedules;


// ----

/**
 * Filter conditions for fetch(...) method
 * @typedef {Object} TvSchedules~fetchFilter
 * @property {String} keyword  A keyword
 */

/**
 * Callback of fetch(...) method
 * @callback TvSchedules~fetchCallback
 * @param {Error} error      An error object (If something happened)
 * @param {Object[]} items   An array of TV program schedules
 * @param {String} items[].title         A name of the program
 * @param {Date} items[].startDate       A scheduled start date of the program
 * @param {Date} items[].endDate         A scheduled end date of the program
 * @param {String} items[].description   A description text of the program
 * @param {Function} items[].record      A function for reserving recording
 */

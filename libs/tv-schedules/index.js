'use strict';


const TvScheduleItem = require('./tv-schedule-item');


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

};


/**
 * A method to fetch a list of the scheduled Tv programs<br>
 * 放送が予定されているテレビ番組のリストを取得するメソッド<br>
 * @param  {TvSchedules~fetchFilter} filter      A filter conditions
 * @param  {TvSchedules~fetchCallback} callback  An callback function
 */
TvSchedules.prototype.fetch = function (filter = {}, callback) {

	const self = this;

	if (!filter.keyword) return callback(new Error('filter.keyword is required'), null);

	if (filter.channelTypes && filter.channelTypes.length == 0) return callback(new Error('filter.channelTypes is empty'));

	// Execute searching
	self.client._getNightmare()
		// Load the top page
		.goto(self.client.BASE_URL)
		// Wait until the search form is loaded
		.wait('#frwSwhDtlBtn')
		// Take a screen shot
		.screenshot('tmp.png')
		// Expand the search form
		.evaluate(() => {

			// Click a button
			document.querySelector('#frwSwhDtlBtn').click();

		})
		// Wait until the search form is expanded
		.wait('#frwSwhInitBtn')
		// Take a screen shot
		.screenshot('tmp.png')
		// Input the search form
		.evaluate((filter) => {

			// Input the field - Keyword
			document.getElementById('frwSwhInp').value = filter.keyword;

			// Check a checkbox - Channel Type
			if (filter.channelTypes) {
				document.querySelectorAll('.frwSetChInpArea').forEach((elem, index) => {

					const checkbox_elem = elem.querySelector('input');

					// Unfortunately, We could not set a conditions,
					//  even if we change a state of checkbox with using checked property.
					// Instead, we will unchecked it with using click event.
					if (elem.innerText == '地デジ') {
						if (checkbox_elem.checked && filter.channelTypes.indexOf('TE') == -1) {
							checkbox_elem.click(); // Unchecked
						}
					} else if (elem.innerText == 'BSデジ') {
						if (checkbox_elem.checked && filter.channelTypes.indexOf('BS') == -1) {
							checkbox_elem.click(); // Unchecked
						}
					} else if (elem.innerText == 'CSデジ') {
						if (checkbox_elem.checked && filter.channelTypes.indexOf('CS') == -1) {
							checkbox_elem.click(); // Unchecked
						}
					} else {
						if (checkbox_elem.checked && filter.channelTypes.indexOf(elem.innerText) == -1) {
							checkbox_elem.click(); // Unchecked
						}
					}

				});
			}

			// Submit the form
			window.setTimeout(() => {
				document.getElementById('frwSwhBtn').click();
			}, 500);

		}, filter)
		// Take a screen shot
		.screenshot('tmp.png')
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

				// Get a program url
				const program_url = item_elem.querySelector('.pgmLinkTtl').href;
				if (program_url == '') {
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
					url: program_url,
					startDate: program_start_date,
					endDate: program_end_date,
					broadcasterName: program_broadcaster
				});

			});

			return items;

		})
		.then((fetched_items) => {

			// Initialize an instance of TvScheduleItem from fetched item
			var instances = [];
			fetched_items.forEach((item) => {

				instances.push(new TvScheduleItem(self.client, item));

			});

			// Call the callback
			return callback(null, instances);

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
 * @property {String} keyword           A keyword
 * @property {String[]} [channelTypes]  A channel type (multiple values are supported)<br>
 *   Available values: 'TE' (地上デジタル), 'BS' (BSデジタル), 'CS' (CSデジタル)
 */

/**
 * Callback of fetch(...) method
 * @callback TvSchedules~fetchCallback
 * @param {Error} error      An error object (If something happened)
 * @param {TvScheduleItem[]} items   An array of TV program schedules
 */

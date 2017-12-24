'use strict';


const Nightmare = require('nightmare');


/**
 * <p>
 *   A constructor to initialize TvScheduleItem instance.<br>
 *   NOTICE: This module is a part of DimoraClient module. You should not to call this constructor as directly.
 * </p>
 * <p>
 *   TvScheduleItem の インスタンスを初期化するためのコンストラクタ。<br>
 *   お知らせ: このモジュールは {@link DimoraClient} モジュールの一部です。このコンストラクタは直接呼び出さないでください。
 * </p>
 * @class
 *  This sub module provides a features about a scheduled TV program.<br>
 *  このサブモジュールは、放送予定のテレビ番組についての機能を提供します。
 * @hideconstructor
 * @param {DimoraClient} client  An instance of DimoraClient module
 */
const TvScheduleItem = function (client, item_data) {

	this.client = client;

	this.data = item_data;

	// Fix an url of the item data
	if (this.data.url) {
		if (!this.data.url.match(/^(http|https):/)) {
			this.data.url = this.client.BASE_URL + this.data.url;
		}
	}

};


/**
 * A method to get a title of the program<br>
 * テレビ番組のタイトルを取得するメソッド
 * @return {String} A title of the program
 */
TvScheduleItem.prototype.getTitle = function () {

	return this.data.title;

};


/**
 * A method to get an url of the program<br>
 * テレビ番組のページURLを取得するメソッド
 * @return {String} An url of the program
 */
TvScheduleItem.prototype.getUrl = function () {

	return this.data.url;

};


/**
 * A method to get a scheduled start date of the program<br>
 * テレビ番組の放送開始日時を取得するメソッド
 * @return {Date} A scheduled start date of the program
 */
TvScheduleItem.prototype.getStartDate = function () {

	return this.data.startDate;

};


/**
 * A method to get a scheduled end date of the program<br>
 * テレビ番組の放送終了日時を取得するメソッド
 * @return {Date} A scheduled end date of the program
 */
TvScheduleItem.prototype.getEndDate = function () {

	return this.data.endDate;

};


/**
 * A method to get a name of the broadcaster<br>
 * テレビ番組の放送局名を取得するメソッド
 * @return {String} A name of the broadcaster
 */
TvScheduleItem.prototype.getBroadcasterName = function () {

	return this.data.broadcasterName;

};


/**
 * A method to make a recording reservation only once<br>
 * 一度限りの録画予約を行うためのメソッド<br>
 * @param  {TvSchedule~recordOptions} [options]   An options
 * @param  {TvSchedule~recordCallback} callback   An callback function
 */
TvScheduleItem.prototype.recordOnce = function (options = null, callback) {

	const self = this;

	// Replace arguments
	if (callback == null) {
		callback = options;
	}

	// Execute reservation
	self.client._getNightmare()
		// Load the top page
		.goto(self.getUrl())
		// Take a screen shot
		.screenshot('tmp.png')
		// Input the form
		.evaluate((options) => {

			// Click a button - 録画予約 (It opens the detail panel)
			document.getElementById('detailReserveBtn').click();

			// Click a button - 予約
			window.setTimeout(() => {

				document.querySelector('.reserveSec').querySelector('.reserveBtn').click();

			}, 1000);

		}, options)
		// Wait until the result is displayed
		.wait('#reservedEtcText')
		// Take a screen shot
		.screenshot('tmp.png')
		// Fetch the result
		.evaluate(() => {

			const result_elem = document.querySelector('#reservedEtcText');
			if (result_elem == null || result_elem.innerText == null) {
				throw new Error('Unknown result');
			}

			const result_text = result_elem.innerText;
			if (result_text.match(!/.*予約済みです/)) {
				throw new Error('Failed: ' + result_text);
			}

			// Successful
			return result_text;

		})
		.end()
		.then((result_text) => {

			return callback(null);

		})
		.catch((error) => {

			return callback(error);

		});

};


module.exports = TvScheduleItem;


// ----

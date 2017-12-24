/**
 * node-dimora-client -  Unofficial client library for DiMORA
 * https://github.com/mugifly/node-dimora-client
 * (C) 2017 - mugifly; Released under MIT License.
 */

'use strict';


const Nightmare = require('nightmare');


/**
 * A constructor to initialize DimoraClient instance.<br>
 * DimoraClient のインスタンスを初期化するためのコンストラクタ。
 * @constructor
 * @param {Object} session_json           A session json.
 *   It's required when you perform operations requiring membership (such as recording reservation).<br>
 *   You can get a session data with using {@link LoginChallenger}.<br>
 *   セッションJSON。録画予約など、ログインした状態で操作を行う際に必要となります。<br>
 *   セッションJSONの取得は、 {@link LoginChallenger} モジュールにて行なえます。
 * @param {Object} [options]              An option parameters
 *
 * @class Node.js module for DiMORA<br>
 * DiMORA のための Node.js モジュール
 */
const DimoraClient = function (session_json, options = {}) {

	this.BASE_URL = 'https://dimora.jp/';

	// Initialize nightmare
	this.nightmare = Nightmare({
		height: 2000
	});

	// Set the session data to nightmare
	this.sessionDatas = (session_json) ? JSON.parse(session_json) : [];
	this.sessionDatas.forEach((session_data, index) => {

		session_data.url = this.BASE_URL;
		this.nightmare.cookies.set(session_data);

	});

	// Initialize models
	const TvSchedules = require('./libs/tv-schedules/index');

	/**
	 * An instance of {@link TvSchedules}.
	 * It provides methods about the scheduled TV programs.<br>
	 * {@link TvSchedules} のインスタンス。放送予定のテレビ番組について、情報の取得や録画機能を提供します。
	 * @type {TvSchedules}
	 */
	this.tvSchedules = new TvSchedules(this);

};


/**
 * Get an instance of Nightmare
 * @private
 * @return {Nightmare} An instance of the nightmare
 */
DimoraClient.prototype._getNightmare = function () {

	return this.nightmare;

};


module.exports = DimoraClient;

/**
 * node-dimora-client -  Unofficial client library for DiMORA
 * https://github.com/mugifly/node-dimora-client
 * (C) 2017 - mugifly; Released under MIT License.
 */

'use strict';


/**
 * A constructor to initialize DimoraClient instance.<br>
 * DimoraClient のインスタンスを初期化するためのコンストラクタ。
 * @constructor
 * @param {Object} session_data           A session data.<br>
 *   You can get a session data with using {@link LoginChallenger}.<br>
 *   セッションデータ。録画予約など、ログインした状態で操作を行う際に必要となります。<br>
 *   セッションデータは {@link LoginChallenger} モジュールにより取得できます。
 * @param {Object} [options]              An option parameters
 *
 * @class The client module for DiMORA<br>
 * DiMORAのためのクライアントモジュール
 */
const DimoraClient = function (session_data, options = {}) {

	this.BASE_URL = 'https://dimora.jp/';

	// Set the session data
	this.sessionData = (session_data) ? JSON.parse(session_data) : null;

	// Initialize models
	const TvSchedules = require('./libs/tv-schedules/index');

	/**
	 * An instance of {@link TvSchedules}.
	 * It provides methods about the scheduled TV programs.<br>
	 * {@link TvSchedules} のインスタンス。放送予定のテレビ番組についてのメソッドを提供します。
	 * @type {TvSchedules}
	 */
	this.tvSchedules = new TvSchedules(this);

};


module.exports = DimoraClient;

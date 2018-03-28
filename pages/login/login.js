var service = require( '../../service/service' ),
	utils = require( '../../common/utils/utils' ),
	ajax = require( '../../common/ajax/ajax' ),
	App = getApp(),
	param,	defaultParam, timmer,
	clickNum = 0,
	clickTimmer,
	_fn;

defaultParam = {
	method : 'back', // replace, forward,
	url : ''
}

Page({
	data : {
		showPop : false,
		time : 0
	},
	onShareAppMessage : App.shareFunc,
	onLoad : function( options ) {
		param = options || {};
		param = utils.mix( param, options );
	},
	login : function( e ) {
		var type = e.detail.target.dataset.type;

		if ( type == 'getCode' ) {
			_fn.getCode( { phone : e.detail.value.phone  }, this );
		} else if ( type == 'login' ) {
			_fn.loginByPhone( { phone : e.detail.value.phone, smsCode : e.detail.value.code }, this );
		}
	},

	hackLogin : function( e ) {
		var caller = this;
		clickNum += 1;
		if ( clickNum == 3 ) {
			if ( clickNum >= 3 ) {
				caller.setData( {
					showPop : true
				} );
			}
			clickNum = 0;
			clearTimeout( clickTimmer );
			clickTimmer = null;
		}
		if ( clickTimmer ) {
			return;
		}
		clickTimmer = setTimeout( function() {
			if ( clickNum >= 3 ) {
				caller.setData( {
					showPop : true
				} );
			}
			clickNum = 0;
			clearTimeout( clickTimmer );
			clickTimmer = null;
		}, 1000 );
	},
	/*loginOld : function() {
		// 1.获取用户信息
		utils.showLoading( 300 );
		service.user.login( function( res ) {
			if ( res.code == -1001 || res.code == -1002 ) {
				utils.hideLoading();
				_fn.showAuthPop(); // 用户进来再从新登录
				return;
			}

			if ( res.code != '0000' || res.success == false ) {
				utils.hideLoading();
				wx.showToast( { title : res.msg || '登录失败' } );
				return;
			}

			// 2.合并购物车
			service.cart.merge( function( isMerge ) {
				utils.hideLoading();
				// 合并失败则返回上级页面
				if ( !isMerge ) {
					wx.navigateBack();
					return;
				}
				_fn.next();
			} );
			// TODO：这里逻辑要根据传入参数来，根据传入参数跳转到对应页面
			//wx.navigateBack();
		} );
	},*/

	getPhoneNumber : function( e ){
		var caller = this;

		// 用户没授权
		if ( !e.detail || !e.detail.iv || !e.detail.encryptedData ) {
			// 没有信息
			return;
		}
		utils.showLoading( 300 );
		service.user.desPhone( {
			ivPhone : e.detail.iv,
			encryptedDataPhone : e.detail.encryptedData
		}, function( res ) {
			utils.hideLoading();
			if ( res.code == 4011 ) {
				caller.setData( { showPop : true } );
				return;
			}
			if ( res.code == -1001 || res.code == -1002 ) {
				utils.hideLoading();
				_fn.showAuthPop(); // 用户进来再从新登录
				return;
			}

			if ( res.code != '0000' || res.success == false ) {
				utils.hideLoading();
				wx.showModal( { title : '提示', content : res.msg || '登录失败', showCancel : false } );
				return;
			}

			// 2.合并购物车
			service.cart.merge( function( isMerge ) {
				utils.hideLoading();
				// 合并失败则返回上级页面
				if ( !isMerge ) {
					wx.navigateBack();
					return;
				}
				_fn.next();
			} );
		} );
		//console.log( e );		
		//this.login();
	},


	showPop : function() {
		this.setData( {
			showPop : true
		} );
	},

	hidePop : function() {
		this.setData( {
			showPop : false
		} );
	},

	cancel : function() {
		wx.navigateBack();
	},
	empty : function() {

	}
});

_fn = {
	loginByPhone : function( param, caller ) {
		param.phone = ( param.phone + '' ).trim()
		param.smsCode = ( param.smsCode + '' ).trim();
		if ( !param.phone || !(/^1[34578]\d{9}$/.test( param.phone ) ) ) {
			wx.showModal( { title : '提示', content : '请填写正确的手机号', showCancel : false } );
			return;
		}	
		if ( !param.smsCode ) {
			wx.showModal( { title : '提示', content : '请填写验证码', showCancel : false } );
			return;			
		}
		param.source = 5;
		param.deviceId = '1';
		utils.showLoading( 300 );
		// 1.登陆
		service.user.loginByPhone( param, function( res ) {
			utils.hideLoading();

			if ( res.code == -1001 || res.code == -1002 ) {
				utils.hideLoading();
				_fn.showAuthPop(); // 用户进来再从新登录
				return;
			}

			if ( res.code != '0000' || res.success == false ) {
				utils.hideLoading();
				wx.showModal( { title : '提示', content : res.msg || '登录失败', showCancel : false } );
				return;
			}

			// 2.合并购物车
			service.cart.merge( function( isMerge ) {
				utils.hideLoading();
				// 合并失败则返回上级页面
				if ( !isMerge ) {
					wx.navigateBack();
					return;
				}
				_fn.next();
			} );
			caller.setData( {
				showPop : false
			} );
		} );
	},

	getCode : function( param, caller ) {
		if ( !param.phone || !(/^1[34578]\d{9}$/.test( param.phone ) ) ) {
			wx.showModal( { title : '提示', content : '请填写正确的手机号', showCancel : false } );
			return;
		}
		utils.showLoading( 300 );
		service.user.getCode( { phone : param.phone }, function( res ) {
			utils.hideLoading();
			if ( res.code != '0000' || !res.success ) {
				wx.showModal( { title : '提示', content : res.msg || '系统错误', showCancel : false } );
				return;
			}
			_fn.startCount( caller, res.data );
		} );

	},

	startCount : function( caller, startTime ) {
		timmer = setTimeout( function() {
			var time = startTime || caller.data.time;
			caller.setData( {
				time : --time
			} );
			if ( time > 0 ) {
				_fn.startCount( caller, caller.data.time );
			}
		}, 1000 );
	},

	next : function() {
		console.log( 'next' );
		var method = param.method,	
			url = param.url ? decodeURIComponent( param.url ) : null;

		switch ( true ) {
			case !!url : 
				wx.redirectTo( { url : url } );
				break;
			default : 
				wx.navigateBack();
		}
	},
	showAuthPop : function() {
		var canUseOpenSetting = wx.canIUse("openSetting");	//1.1.0

		if ( !canUseOpenSetting ) {
			// 默认低版本弹提示信息
			wx.showModal({
				title : '提示',
				showCancel : false,
				content : '亲,如果想重新授权,请删除并重新搜索下载app'
			});
			return;
		}

		wx.showModal( {
			title : '提示',
			content : '请打开用户信息设置',
			showCancel : false,
			complete : function() {
				wx.openSetting( {} );
			}
		} );
	}
}





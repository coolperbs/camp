var ajax = require('../../common/ajax/ajax');
var config = require('../../config');
var utils = require('../../common/utils/utils');
var modules = require( '../../widgets/modules/modules.js' );
var app = getApp();
var host = config.host;
var pageParam, hasMore, 
currentPage = 0,
isGetMore = false,
hasMore = true;

/*
1.已开团、已参团
2.未参团
3.团结束
*/

Page({
    onLoad : function( param ) {
		pageParam = param || {};
	},
    onShow:function(){
        var self = this;
        _fn.getPageData(self);

    },
    onShareAppMessage:function(){
		var pageData = this.data.pageData;
        var title = '【即将结束】'+pageData.skuTitle+pageData.skuDesc;
        var url = '/pages/gp-detail/gp-detail?grouponId='+pageData.id;
		return {
            title:title,
            url:url
		}
    },
    join:function(){
        var pageData = this.data.pageData;
        var productId = pageData.productId;
        var grouponId = pageData.id;
        if(!grouponId){
            wx.showModal({
                title:'提示',
                content:'没有获得团信息',
                showCancel:false
            })
            return;
        }
        var url = '/pages/gp-waredetail/gp-waredetail?id='+productId+'&grouponId='+grouponId;
        wx.navigateTo({
            url:url
        });
    },
    share:function(){
        wx.showShareMenu({
            withShareTicket: true
          })          
    },
    toGrouponIndex:function(){
        wx.reLaunch({
            url:'../index/index'
        });
    },
    toGrouponOrders:function(){
        wx.redirectTo({
            url:'../../pages/orderlist/orderlist?status=1&bizType=groupon'
        })

    },
    toIndex:function(){
        wx.reLaunch({
			url:'../index/index'
		});
    },
    onUnload:function(e){
		var self =this;
		clearInterval(self.timeCounterId);

    },
    getMore : function() {
    	var data = this.data;
    	if ( !hasMore || isGetMore ) {
    		return;
    	}
    	isGetMore = true;
    	_fn.getLike( this, {
    		currentPage : currentPage + 1
    	} );
	},
    
});


var _fn = {
    getPageData :function(caller){
        // var url = host + '/app/address/add';
        var grouponId = pageParam.grouponId;
        var url = host + '/groupon/detail/'+grouponId;
		// var param = page.formData;
		ajax.query({
			url:url
		},function(res){
            // var res = testData;
			if(res.code === '0000'){
                var pageData = res.data;
                pageData.sortedUserList = _fn.sortGroupUser(pageData);
                pageData.showUserList = [];
                for(var i=0 ; i < pageData.quantity ; i++){
                    pageData.showUserList.push(pageData.sortedUserList[i]);
                }
                var isUserinGroup = _fn.isCurUserInGroup(pageData);
                var grpStatus = pageData.status;//-1过期，1进行中，2完成
                var pageType//页面状态 1,邀请参团。2,参团。3,拼团成功。4,拼团失败
                if(grpStatus/1 === -1){
                    pageType = 4;
                }else if(grpStatus/1 === 2){
                    pageType = 3;
                }else if(grpStatus/1){
                    if(isUserinGroup){
                        pageType = 1;
                    }else{
                        pageType = 2;
                    }
                }
                caller.setData({
                    pageData:pageData,
                    isUserInGroup:isUserinGroup,
                    pageType:pageType
                });	
                _fn.startTimeCounter(caller);
                _fn.getLike(caller);
			}else{
				wx.showModal({
					showCancel:false,
					title:'提示',
					content:'获取拼团信息失败'
				})
			}
		});

    },
    isCurUserInGroup:function(grouponInfo){//判断当前用户是否在团里边
        var userInfo = wx.getStorageSync('userinfo');
        if(userInfo){
            var userId = userInfo.user.id;
            var userList = grouponInfo.userList;
            var user = userList.filter((v,k)=>{
                return v.id === userId;
            })[0];
            debugger;
            return user;
        }
    },
    sortGroupUser:function(grouponInfo){
        var userList = grouponInfo.userList;
        var master = userList.filter((v,k)=>{
            return v.master === 1;
        })[0];
        var newUserList = [];
        if(master){
            newUserList.push(master);
        }
        userList.forEach((v,k)=>{
            if(v.master!==1){
                newUserList.push(v);
            }
        });
        return newUserList;
    },
    startTimeCounter:function(caller){
        var pageData = caller.data.pageData;
		caller.timeCounterId = setInterval(function(){
			var curTime = new Date().getTime();
                var leftTime = pageData.overdueTime-curTime;
				if(leftTime>0){
					var leftTimeStr = "剩余 "
					var timeObj =  {
                        day :   Math.floor(leftTime/1000/60/60/24),
                        hoursStr:   ((Math.floor(leftTime/1000/60/60%24))/100).toFixed(2).split('.')[1],
                        minutesStr: ((Math.floor(leftTime/1000/60%60))/100).toFixed(2).split('.')[1],
                        secondsStr: ((Math.floor(leftTime/1000%60))/100).toFixed(2).split('.')[1],
                    };
					if(timeObj.day/1>0){
						leftTimeStr = leftTimeStr +timeObj.day+'天'	
					}
					leftTimeStr = leftTimeStr + timeObj.hoursStr + ":"+timeObj.minutesStr+":"+timeObj.secondsStr;
					pageData.leftTimeStr = leftTimeStr;
				}else{
					pageData.leftTimeStr = '已结束';
                }
			caller.setData({pageData:pageData});
		},1000);
    },
    getLike : function( caller, param ) {
		var data = caller.data;

		param = param || {};
		param.currentPage = param.currentPage || 1;
		param.citycode = wx.getStorageSync('city').code||'010';
		// param.shopId = data.pageData.shopId;

		utils.showLoading( 300 );
		ajax.query( {
			// url : app.host+'/app/ware/like',
			url:app.host+'/groupon/product/recommend',
			param : param
		}, function( res ) {
			utils.hideLoading();
			isGetMore = false;
			var wareSkus, newData;
			if ( utils.isErrorRes( res ) ) {
				return;
			}

			currentPage = res.data.currentPage;
			//hasMore = true;
			hasMore = res.data.hasMore;
			if ( param.currentPage != 1 ) {
				wareSkus = caller.data || {};
				//wareSkus = wareSkus.pageData || {};
				wareSkus = wareSkus.moduleList || [];
				wareSkus = wareSkus[0] || {};
				wareSkus = wareSkus.data || {};
				wareSkus = wareSkus.wareSkus || [];
			} else {
				wareSkus = [];
			}
			res.data = res.data || {};
			res.data.wareSkus = res.data.productList || [];
			wareSkus = wareSkus.concat( res.data.productList );
			newData = [{
				modulePrototypeId : 1,
				templatePrototypeId : 2,
				data : {
					wareSkus : wareSkus
				}					
			}];
			
			if ( param.currentPage == 1 ) {
				newData.scrollTop = 0;
			}
			caller.setData( {
				moduleList : newData
			} );
		} );
	}
}




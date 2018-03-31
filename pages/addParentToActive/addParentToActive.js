

Page({
    onShow:function(){
        var self = this;
        self.activeId = self.param.activeId;
        _fn.getChildList(self,function(res){

        });
        _fn.getActiveDetail(self,function(res){

        });
    },
    onLoad:function(){

    },
    onHide:function(){

    },
    onUnload:function(){

    },
    editChild:function(e){
        var id = e.currentTarget.dataset.id;
        wx.navigateTo('../editChild/editChild?id='+id);
    },
    addChild:function(){
        wx.navigateTo('../editChild/editChild');
    },
    choseChild:function(e){
        var self = this;
        var id = e.currentTarget.dataset.id;
        var childList = self.data.childList.map(function(v,k){
            if(v.id === id){
                v.selected = !v.selected;
            }
            return v
        });
        self.setData({childList:childList});
    },
    next:function(){
        var selectedChild = [];
        self.data.childList.forEach(function(v,k){
            if(v.selected){
                selectedChild.push(v)
            }
        });
        if(childList.length<=0){
            wx.showModal({
                title:'提示',
                content:'请选择参加活动的孩子',
                showCancel:false
            })
            return;
        }
        activeService.addChild({
            activeId:self.activeId,
            childList:selectedChild
        });
        wx.navigateTo({
            url:'../checkout/checkout'
        })
    }
});

_fn = {
    getChildList:function(self,callback){//获取孩子列表

    },
    reset:function(self){//重置页面
        

    },
    addChildToActiv:function(self){//添加孩子到活动

    },
    getActiveDetail:function(self,callback){//获取活动详情

    }
}
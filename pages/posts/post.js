
var postsData = require('../../data/posts-data.js')
Page({
    data: {
    },
    onLoad: function (options) {
        //页面初始化 options为页面跳转所带来的参数
        this.setData({
            posts_key: postsData.postList
        })
    },
    onPostTap: function (event) {//event是框架给的事件对象;currentTarget是当前鼠标点击的事件
        var postId = event.currentTarget.dataset.postid;//得到当前点击文章的id
        console.log("on post id is" + postId);
        wx.navigateTo({
            url: "post-detail/post-detail?id=" + postId
        })
    },
    onSwiperTap: function (event) {//实现轮播图的跳转
        var postId = event.target.dataset.postid;//得到当前点击文章的id
        wx.navigateTo({
            url: "post-detail/post-detail?id=" + postId
        })
    }
})
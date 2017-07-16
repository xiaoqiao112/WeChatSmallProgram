var postsData = require('../../../data/posts-data.js');//引用posts-data.js中的数据
var app = getApp();
Page({
    data: {
        isPlayingMusic: false
    },
    //接受从postjs中传递过来id
    onLoad: function (option) {
        //var globalData=app.globalData;
        //consoel.log(globalData);
        var postId = option.id;
        var postData = postsData.postList[postId];//可以正确的拿到数组中的东西
        this.data.currentPostId = postId;
        //console.log(postsData);
        //console.log(postData);
        //由下面此句可知前端绑定数据前需要加postData
        //this.data.postData=postData;//数据绑定(在后续的版本中已失效)
        this.setData({//适合异步（常用）
            postData: postData
        })
        //缓存实现模拟取消与收藏功能

        //假设缓存是这样的
        //var postsCollected={
        //1:"true",
        //2:"false",
        //3:"true"
        //....
        //}

        //从缓存中读取收藏与否状态,此处代码是初始化图片代码
        var postsCollected = wx.getStorageSync('posts_Collected');//读取的是所有文章的缓存状态
        if (postsCollected) {//此处代码可以正确运行，基于两种情况 ，一种是缓存存在，但是为false,另一种是缓存不存在
            var postCollected = postsCollected[postId];
            this.setData({//数据绑定
                collected: postCollected
            })
        } else {
            var postsCollected = {};//不存在让存在
            postsCollected[postId] = false;
            wx.setStorageSync('posts_Collected', postsCollected);
        }
        if(app.globalData.g_isPlayingMusic&&app.globalData.g_currentMusicPostId===postId){//g_isPlayingMusic是一个全局变量，保存音乐播放状态
            //this.data.isPlayingMusic=true;//isPlayingMusic用来在页面里面控制数据绑定
            this.setData({
                isPlayingMusic:true
            })
        }
        this.setMusicMonitor();
    },
    setMusicMonitor: function () {//监听音乐播放部分
        var that = this;
        wx.onBackgroundAudioPlay(function () {//监听音乐播放
            that.setData({
                isPlayingMusic: true
            })
            app.globalData.g_isPlayingMusic=true;
            app.globalData.g_currentMusicPostId=that.data.currentPostId;
        });
        wx.onBackgroundAudioPause(function () {
            that.setData({
                isPlayingMusic: false
            })
            app.globalData.g_isPlayingMusic=false;//在监听函数中改变全局变量（音乐的播放状态）
            app.globalData.g_currentMusicPostId=null;//在音乐暂停的时候将其清空
        });
        wx.onBackgroundAudioStop(function () {//修复音乐播放完后图标状态没有复位
            that.setData({
                isPlayingMusic: false
            })
            app.globalData.g_isPlayingMusic=false;
            app.globalData.g_currentMusicPostId=null;
        });
    },
    onCollectionTap: function (event) {//当用户点击收藏按钮和取消按钮时
        //this.getPostsCollectedSyc();
        this.getPostsCollectedAsy();
    },
    getPostsCollectedAsy: function () {//将异步(缓存写在一个方法中)
        var that = this;
        wx.getStorage({
            key: "posts_Collected",
            success: function (res) {
                var postsCollected = res.data;
                var postCollected = postsCollected[that.data.currentPostId];
                //收藏变成为未收藏，未收藏变成收藏
                postCollected = !postCollected;
                postsCollected[that.data.currentPostId] = postCollected;
                that.showToast(postsCollected, postCollected);
            }
        })
    },
    getPostsCollectedSyc: function () {//将同步(缓存)的写在一个方法里
        var postsCollected = wx.getStorageSync('posts_Collected');
        var postCollected = postsCollected[this.data.currentPostId];
        //收藏变成为未收藏，未收藏变成收藏
        postCollected = !postCollected;
        postsCollected[this.data.currentPostId] = postCollected;
        this.showToast(postsCollected, postCollected);
    },
    showModal: function (postsCollected, postCollected) {//因为用到了这两个参数，所以将参数传进来
        var that = this;
        wx.showModal({
            title: "收藏",
            content: postCollected ? "收藏该文章？" : "取消收藏该文章?",
            showCancel: "true",
            cancelText: "取消",
            cancelColor: "#333",
            confirmText: "确认",
            confirmColor: "#405f80",
            success: function (res) {
                if (res.confirm) {
                    //更新文章是否收藏的缓存值
                    wx.setStorageSync('posts_Collected', postsCollected);
                    //更新数据绑定变量，从而实现切换图片
                    that.setData({
                        collected: postCollected
                    })
                }
            }
        })
    },
    showToast: function (postsCollected, postCollected) {
        //更新文章是否收藏的缓存值
        wx.setStorageSync('posts_Collected', postsCollected);
        //更新数据绑定变量，从而实现切换图片
        this.setData({
            collected: postCollected
        })
        wx.showToast({//界面交互（给用户提供方便）
            title: postCollected ? "收藏成功" : "取消成功",
            duration: 1000,
            icon: "success"
        })
    },
    onShareTap: function (event) {//分享的处理
        var itemList = [
            "分享给微信好友",
            "分享到朋友圈",
            "分享到QQ",
            "分享到微博"
        ]
        wx.showActionSheet({
            itemList: itemList,
            itemColor: "#405f80",
            success: function (res) {
                //res.cancel
                //res.tapIndex
                wx.showModal({
                    title: "用户" + itemList[res.tapIndex],
                    content: "用户是否取消" + res.cancel + "现在无法实现分享功能，什么时候能实现呢？"
                })
            }
        })
    },
    onMusicTap: function (event) {//音乐播放实现功能
        var currentPostId = this.data.currentPostId;//获取当前每个文章的的id
        var postData = postsData.postList[currentPostId];
        var isPlayingMusic = this.data.isPlayingMusic;//定义一个变量切换音乐播放与暂停
        if (isPlayingMusic) {//如果音乐播放的话，让其暂停
            wx.pauseBackgroundAudio();//暂停音乐
            this.setData({//改变状态
                isPlayingMusic: false
            })
            //this.data.isPlayingMusic=false;
        } else {
            wx.playBackgroundAudio({//如果暂停的话话，让其播放
                dataUrl: postData.music.url,
                title: postData.music.title,
                coverImgUrl: postData.music.coverImg
            })
            this.setData({
                isPlayingMusic: true
            })
            //this.data.isPlayingMusic=true;//改变状态
        }
    }
})
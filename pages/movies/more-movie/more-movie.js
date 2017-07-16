// pages/movies/more-movie/more-movie.js
var app = getApp()//是引用全局变量的一个方法
var util = require('../../../utils/util.js')
Page({
  data: {
    movies: {},
    navigateTitle: "",
    requestUrl: "",
    totalCount: 0,
    isEmpty: true//指代当前数据movies里面的数据是否为空
  },
  onLoad: function (options) {
    //如何知道页面加载的是三种类型中的哪一个(涉及到页面传参数的问题)
    var category = options.category;
    this.data.navigateTitle = category;
    //console.log(category);//成功获取了点击的是哪一种类型的电影
    var dataUrl = "";
    switch (category) {//switch结构
      case "正在热映":
        dataUrl = app.globalData.doubanBase + "/v2/movie/in_theaters";
        break;
      case "即将上映":
        dataUrl = app.globalData.doubanBase + "/v2/movie/coming_soon";
        break;
      case "豆瓣Top250":
        dataUrl = app.globalData.doubanBase + "/v2/movie/top250";
        break;
    }
    this.data.requestUrl = dataUrl;
    util.http(dataUrl, this.processDoubanData)//将将callback换为processDoubanData
  },
  //onScrollLower: function (event) {//实现上滑刷新
    //var nextUrl = this.data.requestUrl + "?start=" + this.data.totalCount + "&//count=20";
    //util.http(nextUrl, this.processDoubanData)//加载数据
    //wx.showNavigationBarLoading();
  //},
  onReachBottom: function (event) {//实现上滑刷新
    var nextUrl = this.data.requestUrl + "?start=" + this.data.totalCount + "&count=20";
    util.http(nextUrl, this.processDoubanData)//加载数据
    wx.showNavigationBarLoading();
  },
  onPullDownRefresh: function (event) {//实现下拉刷新加载函数
    var refreshUrl = this.data.requestUrl + "?star=0&count=20";
    this.data.movies = {};
    this.data.isEmpty = true;
    this.data.totalCount = 0;
    util.http(refreshUrl, this.processDoubanData);
    wx.showNavigationBarLoading();
  },
  processDoubanData: function (moviesDouban) {//处理数据
    //console.log(data);
    var movies = [];//记录处理完数据的容器
    for (var idx in moviesDouban.subjects) {
      var subject = moviesDouban.subjects[idx];
      var title = subject.title;
      if (title.length >= 6) {
        title = title.substring(0, 6) + "...";
      }
      //[1,1,1,1,1]  [1,1,1,0,0]
      var temp = {
        stars: util.convertToStarsArray(subject.rating.stars),
        title: title,
        average: subject.rating.average,
        coverageUrl: subject.images.large,
        movieId: subject.id
      }
      movies.push(temp);
    }
    var totalMovies = {};

    //如果要绑定新加载的数据，那么需要同旧有的数据合并在一起
    if (!this.data.isEmpty) {//如果数据不是空，将之前的和新加载的放到totalMovies
      totalMovies = this.data.movies.concat(movies);
    } else {//如果是空的话，就将刚加载的放进去
      totalMovies = movies;
      this.data.isEmpty = false;
    }
    this.setData({
      movies: totalMovies//电影数组
    });
    this.data.totalCount += 20;//数据累加(在它成功绑定了之后加20)
    wx.hideNavigationBarLoading();
    wx.stopPullDownRefresh();
  },
  onReady: function (event) {
    wx.setNavigationBarTitle({
      title: this.data.navigateTitle,
    })
  },
  onMovieTap: function (event) {//实现页面跳转
    var movieId = event.currentTarget.dataset.movieid;
    wx.navigateTo({
      url: '../movie-detail/movie-detail?id=' + movieId
    })
  },
})
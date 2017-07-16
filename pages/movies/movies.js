var util = require('../../utils/util.js')
var app = getApp();
Page({
  //RESTFUL API  JSON
  //SOAP XML
  //粒度 不是力度
  data: {//结构体变量(给它一个初始值，如果是对象，给它一个空对象)
    inTheaters: {},
    comingSoon: {},
    top250: {},
    searchResult: {},
    containerShow: true,
    searchPanelShow: false,
  },
  onLoad: function (event) {
    var inTheatersUrl = app.globalData.doubanBase + "/v2/movie/in_theaters" + "?start=0&count=3";
    var comingSoonUrl = app.globalData.doubanBase + "/v2/movie/coming_soon" + "?start=0&count=3";
    var top250Url = app.globalData.doubanBase + "/v2/movie/top250" + "?start=0&count=3";
    this.getMovieListData(inTheatersUrl, "inTheaters", "正在热映");//此处都是异步的
    this.getMovieListData(comingSoonUrl, "comingSoon", "即将上映");
    this.getMovieListData(top250Url, "top250", "豆瓣Top250");

  },
  onMoreTap: function (event) {//实现页面跳转，跳转到more-movie页面
    var category = event.currentTarget.dataset.category;

    wx.navigateTo({//将参数填在跳转的的url里
      url: "more-movie/more-movie?category=" + category,
    })
  },
  onMovieTap: function (event) {//实现跳转到电影详情页面
    var movieId = event.currentTarget.dataset.movieid;
    wx.navigateTo({
      url: "movie-detail/movie-detail?id=" + movieId
    })
  },
  getMovieListData: function (url, settedKey, categoryTitle) {//访问豆瓣API的一个公共方法
    var that = this;
    wx.request({
      //'https://api.douban.com/v2/movie/top250'
      url: url,
      method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
      header: {// 设置请求的 header
        "Content-Type": "json"
      },
      success: function (res) {
        //console.log(res);
        that.processDoubanData(res.data, settedKey, categoryTitle);
      },
      fail: function (error) {
        // fail
        console.log(error);
      },
    })
  },
  onCancelImgTap: function (event) {//当点击x时
    this.setData({
      containerShow: true,
      searchPanelShow: false,
      //searchResult:{}//将结果置为空(清空上一次的搜索记录)
    })
  },
  onBindFocus: function (event) {//当获取焦点时
    this.setData({
      containerShow: false,
      searchPanelShow: true
    })
  },
  onBindBlur: function (event) {//触发搜索的事件
    var text = event.detail.value;//获取输入框的变量值
    var searchUrl = app.globalData.doubanBase + "/v2/movie/search?q=" + text;
    this.getMovieListData(searchUrl, "searchResult", "");//发送请求
  },
  processDoubanData: function (moviesDouban, settedKey, categoryTitle) {//接收从豆瓣取回来的数据(res.data)  //此处做数据处理的目的是做数据绑定
    var movies = [];//记录处理完数据的容器
    for (var idx in moviesDouban.subjects) {
      var subject = moviesDouban.subjects[idx];
      var title = subject.title;
      if (title.length >= 6) {
        title = title.substring(0, 6) + "...";
      }
      //[1,1,1,1,1]  [1,1,1,0,0]
      var temp = {//将所有的元素装到temp里面，最后在push到movies里面,让他成为数据绑定的变量
        stars: util.convertToStarsArray(subject.rating.stars),
        title: title,
        average: subject.rating.average,
        coverageUrl: subject.images.large,
        movieId: subject.id//方便跳转到电影详情页面
      }
      movies.push(temp);
    }
    var readyData = {};
    readyData[settedKey] = {//对js对象的属性做动态赋值
      categoryTitle: categoryTitle,
      movies: movies
    }
    this.setData(readyData);//此处代码特别考考js基本功
  }
})
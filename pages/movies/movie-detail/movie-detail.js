import { Movie } from 'class/Movie.js';
var app = getApp();
Page({
  data: {
    movie: {}
  },
  onLoad: function (options) {
    var movieId = options.id;
    //console.log(movieId);
    var url = app.globalData.doubanBase + "/v2/movie/subject/" + movieId;//得到电影详情url
    var movie = new Movie(url);
    //var movieData=movie.getMovieData();//同步的方法

    //var that=this;
    //movie.getMovieData(function (movie) {//异步(回调函数),http异步请求,movie是处理完的对象
      //that.setData({//数据绑定
        //movie: movie
      //})
    //})

    movie.getMovieData((movie)=> {//异步(回调函数),http异步请求,movie是处理完的对象
      this.setData({//数据绑定
        movie: movie
      })
    })
  },
  /*查看图片*/
  viewMoviePostImg: function (e) {
    var src = e.currentTarget.dataset.src;
    wx.previewImage({
      current: src, // 当前显示图片的http链接
      urls: [src] // 需要预览的图片http链接列表
    })
  },
})
var util = require('../../../../utils/util.js')
class Movie {
    constructor(url) {//接收的是豆瓣的地址
        this.url = url;//this代表Movie的实例
    }
    getMovieData(cb) {//cb就是callback
        this.cb = cb;
        util.http(this.url, this.processDoubanData.bind(this));
    }
    processDoubanData(data) {
        if (!data) {
            return;
        }
        //console.log(data);
        var director = {
            avatar: "",
            name: "",
            id: ""
        }
        if (data.directors[0] != null) {
            if (data.directors[0].avatars != null) {
                director.avatar = data.directors[0].avatars.large;
            }
            director.name = data.directors[0].name;
            director.id = data.directors[0].id;
        }
        var movie = {
            movieImg: data.images ? data.images.large : "",
            country: data.countries[0],
            title: data.title,
            originalTitle: data.original_title,
            wishCount: data.wish_count,
            commentCount: data.comments_count,
            year: data.year,
            generes: data.genres.join("、"),
            stars: util.convertToStarsArray(data.rating.stars),
            score: data.rating.average,
            director: director,
            casts: util.convertToCastString(data.casts),
            castsInfo: util.convertToCastInfos(data.casts),
            summary: data.summary
        }
        this.cb(movie);
    }
}

export { Movie }
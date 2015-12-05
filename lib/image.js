/**
 * @file 打印分时图或k线图
 * @author hades
 */

var http = require('http');
var q = require('q');
var drawInIterm = require('iterm2-image');

function show(code, period) {
    period = period || 'min';

    var map = {
        'm': 'min',
        'd': 'daily',
        'w': 'weekly',
        'mon': 'monthly'
    };

    period = map[period] ? map[period] : period;

    if (['min', 'daily', 'weekly', 'monthly'].indexOf(period) === -1) {
        console.error('周期输入错误');

        return ;
    }

    getImage(code, period).done(
        function (image) {
            drawInIterm(image, function () {
            });
        }
    );
}

function getImage(code, period) {
    return q.Promise(function (resolve, reject) {
        http.get(
            'http://image.sinajs.cn/newchart/' + period + '/n/' + code + '.gif',
            function (res) {
                resolve(res);
            }
        );
    });
}

exports.show = show;

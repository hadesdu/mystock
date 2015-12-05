/**
 * @file 涨跌幅排行榜
 * @author hades
 */

var hq = require('./hq');
var q = require('q');
var request = require('request');

var URL = 'http://qt.gtimg.cn/q=ashzdf';

function show(order, num) {
    num = num || 20;

    getData(order).done(function (data) {
        data = data.slice(0, 20);
        hq.list(data);
    });
}

function getData(order) {
    return q.Promise(function (resolve, reject) {
        request(URL + order + '50', function (err, response, body) {
            eval(body);

            var str = '';

            if (order === 'top') {
                str = v_ashzdftop50;
            }
            else if (order === 'end') {
                str = v_ashzdfend50;
            }

            resolve(str.split(','));
        });
    });
}

exports.show = show;

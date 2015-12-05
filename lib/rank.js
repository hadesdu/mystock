/**
 * @file 涨跌幅排行榜
 * @author hades
 */

var hq = require('./hq');
var q = require('q');
var request = require('request');

var URL = 'http://vip.stock.finance.sina.com.cn/quotes_service/api/json_v2.php/Market_Center.getHQNodeData?page=1&sort=changepercent&node=hs_a&symbol=&_s_r_a=sort';

function show(order, num) {
    if (!num || num === true) {
        num = 30;
    }

    getData(order, num).done(function (data) {
        data = data.slice(0, num);
        hq.list(data);
    });
}

function getData(order, num) {
    return q.Promise(function (resolve, reject) {
        var url;

        if (order === 'top') {
            url = URL + '&num=' + num + '&asc=0';
        }
        else {
            url = URL + '&num=' + num + '&asc=1';
        }

        request(url, function (err, response, body) {
            if (err) {
                reject([]);
            }

            var data = eval(body) || [];
            var res = [];

            data.forEach(function (item) {
                item = item || {};

                if (item.symbol) {
                    res.push(item.symbol);
                }
            });

            resolve(res);
        });
    });
}

exports.show = show;

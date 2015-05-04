#! /usr/bin/env node

var minimist = require('minimist');
var iconv = require('iconv-lite');
var http = require('http');
var q = require('q');
var chalk = require('chalk');
var Table = require('cli-table-zh');

/**
 * 如请求 sh600109 的数据，则url为 http://hq.sinajs.cn/list=sh600109
 */
var HQ_URL = 'http://hq.sinajs.cn/list';

main();

/**
 * 入口函数
 */
function main() {
    var argv = minimist(process.argv.slice(2));
    var promise = getData(argv['_']);

    promise.then(function (data) {
        echo(data);
    });
}


/**
 * 从sina 的股票api中获取数据
 *
 * @param {Array} stocks 股票代码，如['sh600109']
 * @return {Promise}
 */
function getData(stocks) {
    var stocks = stocks || [];
    var deferred = q.defer();

    // 由于sina的股票数据接口返回的数据的编码格式是GBK，此处需要重新编码成utf8
    http.get(HQ_URL + '=' + stocks.join(','), function (res) {
        var chunks = [];

        res.on('data', function (chunk) {
            chunks.push(chunk);
        });

        res.on('end', function () {
            var decodedBody = iconv.decode(Buffer.concat(chunks), 'GBK');
            var match = decodedBody.match(/\"(.*)\";/g);

            if (!match || !match.length) {
                deferred.reject();
                
                return ;
            }
            
            var data = [];

            match.forEach(function (item, idx) {
                var str = item.match(/\"(.*)\";/)[1];

                if (!str) {
                    deferred.reject();
                }

                var arr = str.split(',');
                var obj = {
                    gid: stocks[idx]
                };

                [
                    'name', 'todayStartPri', 'yestodEndPri', 'nowPri',
                    'todayMax', 'todayMin', 'competitivePri', 'reservePri', 
                    'traNumber', 'traAmount', 'buyOne', 'buyOnePri',
                    'buyTwo', 'buyTwoPri', 'buyThree', 'buyThreePri',
                    'buyFour', 'buyFourPri', 'buyFive', 'buyFivePri',
                    'sellOne', 'sellOnePri', 'sellTwo', 'sellTwoPri',
                    'sellThree', 'sellThreePri', 'sellFour', 'sellFourPri',
                    'sellFive', 'sellFivePri', 'date', 'time'
                ].forEach(function (item, idx) {
                    obj[item] = arr[idx];
                });

                obj['rise'] = ((obj['nowPri'] - obj['yestodEndPri']) * 100 / obj['yestodEndPri']).toFixed(2);

                data.push(obj);
            });

            deferred.resolve(data);
        });
    });

    return deferred.promise;
}

/**
 * 在终端上打印数据
 *
 * @param {Object} data 股票数据
 */
function echo(data) {
    var data = data || [];
    var fields = [
        'name', 'nowPri', 'rise', 'todayMax',
        'todayMin', 'todayStartPri', 'yestodEndPri',
        'buyTwo', 'buyOne', 'sellOne', 'sellTwo'
    ];

    var table = new Table({
        head: fields
    });

    data.forEach(function (item, idx) {
        var arr = [];
        fields.forEach(function (field) {

            if (field === 'nowPri') {
                arr.push(chalk.cyan(item['nowPri']));
            }
            else if (field === 'rise') {
                var rise = item['rise'];

                if (rise > 0) {
                    arr.push(chalk.red(rise));
                }
                else if (rise == 0) {
                    arr.push(chalk.gray(rise));
                }
                else {
                    arr.push(chalk.green(rise));
                }
            }
            else if (/^(buy|sell)/.test(field)) {
                arr.push(chalk.magenta(item[field + 'Pri']) + ' :  ' + Math.round(item[field] / 100));
            }
            else {
                arr.push(item[field]);
            }
        });

        table.push(arr);
    });

    console.log(table.toString());
}


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

function main() {
    var argv = minimist(process.argv.slice(2));

    suggest(argv['_']).done(
        function (data) {
            console.log(data);
        }
    );

    return ;

    var promise = getData(argv['_']);

    promise.then(function (data) {
        echo(data);
    });
}

/**
 * 显示股票行情列表
 */
function list(stocks) {
    getData(stocks).done(
        function (data) {
            data = data || [];
            var fields = [
                'symbol', 'name', 'nowPri', 'rise', 'todayMax',
                'todayMin', 'todayStartPri', 'yestodEndPri'
            ];

            var table = new Table({
                head: fields,
                style: {
                    compact: true
                }
            });

            data.forEach(function (item, idx) {
                var arr = [];
                fields.forEach(function (field) {
                    item.yestodEndPri = item.yestodEndPri - 0;

                    if (field === 'symbol') {
                        arr.push(stocks[idx]);
                    }
                    else if (field === 'name') {
                        arr.push(item[field]);
                    }
                    else {
                        item[field] = item[field] - 0;

                        if ((field === 'rise' && item.rise > 0) || (field !== 'rise' && item[field] > item.yestodEndPri)) {
                            arr.push(chalk.red(item[field]));
                        }
                        else if ((field === 'rise' && item.rise == 0) || (field !== 'rise' && item[field] == item.yestodEndPri)) {
                            arr.push(chalk.gray(item[field]));
                        }
                        else {
                            arr.push(chalk.green(item[field]));
                        }
                    }
                });

                table.push(arr);
            });

            console.log(table.toString());
        }
    );
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

function pankou() {
}

exports.list = list;
exports.pankou = pankou;

#! /usr/bin/env node

var minimist = require('minimist');

var suggest = require('./lib/suggest');
var hq = require('./lib/hq');
var image = require('./lib/image');
var rank = require('./lib/rank');

/**
 * 如请求 sh600109 的数据，则url为 http://hq.sinajs.cn/list=sh600109
 */
var HQ_URL = 'http://hq.sinajs.cn/list';

/**
 * 入口函数
 */
function main() {
    var argv = minimist(process.argv.slice(2));

    suggest(argv['_']).done(
        function (data) {
            if (argv['i']) {

                var period = argv['i'];

                if (argv['i'] === true) {
                    period = 'min';
                }

                image.show(data[0], period);
            }
            else if (argv['top']) {
                rank.show('top', argv['top']);
            }
            else if (argv['end']) {
                rank.show('end', argv['end']);
            }
            else {
                hq.list(data);
            }
        }
    );
}

main();

var dgram = require("dgram");

var config = {
    listen_port: 2005,
    send_port: 2010,
};

var rules = [
    //### Hostname Cleanup
    { replace: "squiz_uk.$1", regex: /^(.*)_int_squiz_co_uk/},
    { replace: "squiz_uk.$1", regex: /^(.*)_squiz_co_uk/},
    { replace: "squiz_net.$1", regex: /^(.*)_squiz_net/},
    { replace: "squiz_edge.$2.$1 ", regex: /^(.*)_(.*)_squizedge_net/},
    //### Collectd Cleanup
    // apache
    { replace: ".apache.", regex: /\.apache\.apache_/},
    { replace: ".apache.scoreboard.", regex: /\.apache\.mod_status\.apache_scoreboard\./},
    { replace: ".apache.", regex: /\.apache\.mod_status\./},
    // cpu
    { replace: ".$1", regex: /\.cpu\.([a-z]+)/},
    // df
    { replace: ".df", regex: /\.df\.df/},
    { replace: ".", regex: /\.df_complex\./},
    // disk
    { replace: ".$1.", regex: /\.disk_([a-z]+)\./},
    // entropy
    { replace: "entropy", regex: /entropy\.entropy\.value/},
    // interface
    { replace: ".$1.", regex: /\.if_(errors|octets|packets)\./},
    { replace: ".interface.$2.$1.", regex: /\.interface\.(.*)\.(errors|octets|packets)\./},
    // load
    { replace: ".load.", regex: /\.load\.load\./},
    // memcached
    { replace: ".memcached.connections", regex: /\.memcached\.memcached_connections\.current\.value/},
    { replace: ".memcached.cache.$1", regex: /\.memcached\.df\.cache\.(free|used)/},
    { replace: ".memcached.items", regex: /\.memcached\.memcached_items\.current\.value/},
    { replace: ".memcached.", regex: /\.memcached\.memcached_/},
    { replace: ".memcached.hitratio", regex: /\.memcached\.percent\.hitratio\.value/},
    // memory
    { replace: ".memory.", regex: /\.memory\.memory\./},
    // nfs
    { replace: "trash", regex: /^.*\.nfs\.v2.*/},
    { replace: ".nfs.client.", regex: /\.nfs\.v3client\.nfs_procedure\./},
    { replace: ".nfs.server.", regex: /\.nfs\.v3server\.nfs_procedure\./},
    // swap
    { replace: ".swap.", regex: /\.swap\.swap\./},
    { replace: ".io", regex: /\.swap_io/},
    // tail: apache access all
    { replace: ".tail.access_log_all.status.", regex: /\.tail\.access_log_all\.counter\.status_/},
    { replace: ".tail.access_log_all.first_byte.", regex: /\.tail\.access_log_all\.response_time.first_byte_/},
    { replace: ".tail.access_log_all.response.", regex: /\.tail\.access_log_all\.response_time.response_/},
    // tail: postfix
    { replace: ".tail.postfix.conn-in.", regex: /\.tail\.postfix\.counter\.conn-in-/},
    { replace: ".tail.postfix.conn-out.", regex: /\.tail\.postfix\.counter\.conn-out-/},
    { replace: ".tail.postfix.rejected.", regex: /\.tail\.postfix\.counter\.rejected-/},
    { replace: ".tail.postfix.status.", regex: /\.tail\.postfix\.counter\.status-/},
    { replace: ".tail.postfix.delay.", regex: /\.tail\.postfix\.gauge\.delay-/},
    { replace: ".tail.postfix.", regex: /\.tail\.postfix\.ipt_bytes./},
    // tcpconns
    { replace: ".", regex: /\.tcp_connections\./},
    // uptime
    { replace: "uptime", regex: /uptime\.uptime\.value/},
    // users
    { replace: "users", regex: /users\.users\.value/},
    // misc
    //\.value =
    // Redis
    { replace: ".redis.$1.keys", regex: /\.redis\.(.*)\.memcached_items/},
    { replace: ".redis.$1.connections", regex: /\.redis\.(.*)\.memcached_connections/},
    { replace: ".redis.$1.commands", regex: /\.redis\.(.*)\.memcached_command\.total/},
    { replace: ".redis.$1.memory_used", regex: /\.redis\.(.*)\.df\.memory\.used/},
    { replace: ".redis.$1.unsaved_changes", regex: /\.redis\.(.*)\.files\.unsaved_changes/},
    // Nginx
    { replace: ".nginx.connections", regex: /\.nginx\.nginx_connections/},
    { replace: ".nginx.status.", regex: /\.tail\.nginx\.derive\./},
    { replace: ".nginx.response_bytes.", regex: /\.tail\.nginx\.ipt_bytes\./},
    { replace: ".nginx.response_time.", regex: /\.tail\.nginx\.response_time\./},
];

var recv = dgram.createSocket('udp4');
var send = dgram.createSocket("udp4");

recv.on("message", function (msgBuffer, rinfo) {
    var msgs = msgBuffer.toString().split('\n');
    var new_msgs = Array();

    for (var i = 0; i < msgs.length; i++) {
        var msg = msgs[i];
        var new_msg = msg;
        for (var j = 0; j < rules.length; j++) {
            var r = rules[j];
            new_msg = new_msg.replace(r.regex, r.replace);
        }
        new_msgs.push(new_msg);
    }

    var outBuffer = new Buffer(new_msgs.join('\n'));
    send.send(outBuffer, 0, outBuffer.length, config.send_port, "127.0.0.1");
});
recv.bind(config.listen_port);

var nodeIP = require('ip'),
    net = require('net'),
    DnspodApi = require('dnspod-api')
    ;

var ddnspod = function(config){
    
    var dnsApiConfig = {
        server : config.server, // dnspod.com (default) | dnspod.cn
        token : config.token // your login token, you can find how to get token in then bottom.
    }

    // domain
    if(!config.domain){
        console.log('param missing. you should set domain.');
        return;
    }

    // subDomain
    if(!config.subDomain){
        config.subDomain = '@';
    }
    
    // recordType
    config.type = config.type ? config.type : 'A';
    
    // recordTTL
    config.ttl = config.ttl ? config.ttl : '0';
    
    // recordLine
    if(!config.line) {
        config.line = 'default';
        if (config.server == 'dnspod.cn') {
            config.line = '默认';
        }
    }

    // new dnspodApi instance
    var dnspodApi =  new DnspodApi(dnsApiConfig);
    
    // add or modify
    var recordOperateType;
    
    // do actions function
    var doActions = function(){
        dnspodApi.do({
                action : 'Record.List',
                params : {
                    domain : config.domain,
                    sub_domain : config.subDomain
                }
        })
        .then(
            // success
            function(recordListData){
        
                //console.log('Record.List: ', recordListData);
    
                var statusCode = recordListData.status.code;
                // no record found.
                if(statusCode == '10'){
                    
                    recordOperateType = 'Add';
    
                    return dnspodApi.do({
                        action : 'Record.Create',
                        params : {
                            domain : config.domain,
                            sub_domain : config.subDomain,
                            value : config.ip,
                            record_type : config.type,
                            record_line : config.line,
                            ttl : config.ttl
                        }
                    });
    
                }else if(statusCode == '1'){
                // if the record existed.
                    recordOperateType = 'Modify';
    
                    var recordId = recordListData.records[0].id;
                    
                    return dnspodApi.do({
                        action : 'Record.Modify',
                        params : {
                            record_id : recordId,
                            domain : config.domain,
                            sub_domain : config.subDomain,
                            value : config.ip,
                            record_type : config.type,
                            record_line : config.line,
                            ttl : config.ttl
                        }
                    });
    
                }else{
                    
                    console.log('api error: ', recordListData.status.message);
                    
                }
        
            }
        )
        .then(
            function(callback){
                if(callback.status.code == '1') {
                    console.log(recordOperateType, 'A record:', config.subDomain + '.' + config.domain, '»', config.ip);
                }else{
                    console.log(callback.status.message);
                }
            },
            // error
            function(error) {
                console.log('error: ', error);
            }
        )
    } // end doActions
    
    
    if(config.ip){
        doActions();
    }else{
        
        if(config.localIp){
            
            // Get local IP.
            config.ip = nodeIP.address();
            doActions();
            
        }else{
            
            // Get internet host ip.
            client = net.connect({
                host: 'ns1.dnspod.net',
                port: 6666
            }, function () {
            }).on('data', function (data) {
                config.ip = data.toString();
                client.end();
            }).on('end', function () {
                doActions();
            }).on('error', function (error) {
                console.log(error);
            });
            
        }
        
    }
    
}

module.exports = ddnspod;
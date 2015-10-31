var nodeIP = require('ip'),
    net = require('net'),
    Q = require('q'),
    request = require('request'),
    DnspodApi = require('dnspod-api')
    ;

var ddnspod = function(config){ 

    // prepare promise callback
    var deferred = Q.defer();
    
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
                    console.log('Dnspod API Error: ', recordListData.status.message);
                    deferred.reject(recordListData);
                }
        
            }
        )
        .then(
            function(setRecordData){
                if(setRecordData.status.code == '1') {
                    console.log(recordOperateType, 'A record:', config.subDomain + '.' + config.domain, '»', config.ip);
                    deferred.resolve(setRecordData);
                }else{
                    console.log(setRecordData.status.message);
                    deferred.reject(setRecordData);
                }
            },
            // error
            function(error) {
                console.log('error: ', error);
                deferred.reject(error);
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
            
            // use ipinfo.io
            request({url:'http://ipinfo.io',json:true}, function (error, response, body) {
                
                if (!error && response.statusCode == 200) {
                    config.ip = body.ip;
                    doActions();
                }else{
                    deferred.reject(error);
                }
                
            });
            
        }
        
    }
    
    return deferred.promise;
    
}

module.exports = ddnspod;
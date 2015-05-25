#!/usr/bin/env node
'use strict';
var argv = require('commander'),    
    ddnspod = require('./index.js'),
    packageJson = require('./package.json')
    ;

argv
  .version(packageJson.version)
  .option('-s, --server [server]', 'which server you are using . (dnspod.com/dnspod.cn)')
  .option('-t, --token [token]', 'dnspod login token. (xxxxx,xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx)')
  .option('-d, --domainName [domain]', 'your domain')
  .option('-b, --subDomain [domain]', 'your subdomain, default : @')
  .option('-l, --localIp [localIp]', 'use local IP instead of internet IP. (true/false)')
  .option('-i, --ip [ip]', 'if you want specific the IP.')
  .parse(process.argv);


// Start.
ddnspod({
    server : argv.server, // which server you are using . dnspod.com (default) | dnspod.cn
    token : argv.token,  // your login token, you can find how to get this in Readme.md.
    domain : argv.domainName, // your domain
    subDomain : argv.subDomain, // your subdomain, default : @
    localIp : argv.localIp, // use local IP instead of internet IP.
    ip : argv.ip // specific the IP
});
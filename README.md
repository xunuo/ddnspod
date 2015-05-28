# ddnspod

ddnspod is a ddns updating tool of [DNSPod.cn](http://www.dnspod.cn) or [DNSPod.com](http://www.dnspod.com).
It was originally designed for use with [node.js](http://nodejs.org).

## How to get token

First of all, you should get the login token.  

> Dnspod.cn : https://support.dnspod.cn/Kb/showarticle/tsid/227  
> Dnspod.com : https://www.dnspod.com/docs/info.html#get-the-user-token


## Install

You can install using Node Package Manager (npm):

```sh
npm install ddnspod -g
```

## Usage

### BIN Example

Run ddnspod as a command line tool. It will update your dns record after you execute the following.

```
ddnspod --server 'dnspod.cn' --token 'xxxxx,xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' --domainName 'your-domain.com' --subDomain 'test' [--localIp true] [--ip '127.0.0.1'] [--ttl 600]
```

> You can add it to crontab for continuously updating.

### API Example

```js
// Require
var ddnspod = require('ddnspod');

// Update the DNS.
var dnsUpdate = function(){
    ddnspod({
        server : 'dnspod.com', // which server you are using . dnspod.com (default) | dnspod.cn
        token : 'xxxxx,xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',  // your login token, you can find how to get this at the top.
        domain : 'your-domain.com', // your domain
        subDomain : 'test' // which subdomain do you want to set. default : @
        // localIp : true, // use local IP instead of internet IP.
        // ip : '127.0.0.1', // specific the IP
        // ttl : '600' // specific ttl time
        
    // callback with promise
    }).then(function(res){
        console.log(res);
    },function(error){
        console.log(error);
    });
};

// Start Update
dnsUpdate();

// Loop(5s)
setInterval(dnsUpdate ,5 * 1000)
```

> You can use PM2 for continuously updating.  

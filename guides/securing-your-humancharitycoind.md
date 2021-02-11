# Securing humancharitycoind RPC

**Note: Accessing JSON-RPC across the internet is not security best practice. If possible try and make all connections via loopback to localhost.**

By default humancharitycoind JSON-RPC calls are unencrypted HTTP requests; your RPC credentials are broadcast in plaintext across the network! This is generally ok if you are connecting to localhost, but there may be situations where you want to access a humancharitycoind on a remote host. Although you can lock down access based on IP address, anybody on an intervening router can inspect your traffic!

For example if you dump all traffic in and out of humancharitycoind

    $ sudo tcpdump -i lo -A port 9335

you will see you authorization details flying across the network:

```
POST / HTTP/1.1
User-Agent: humancharitycoin-json-rpc/v1.1.0-unk-beta
Host: 127.0.0.1
Content-Type: application/json
Content-Length: 43
Connection: close
Accept: application/json
Authorization: Basic dGVzdG5ldDp0ZXN0bmV0

{"method":"getbalance","params":[],"id":1}

HTTP/1.1 200 OK
Date: Fri, 31 Jan 2014 12:04:21 +0000
Connection: close
Content-Length: 42
Content-Type: application/json
Server: humancharitycoin-json-rpc/v1.1.0-unk-beta

{"result":0.00000000,"error":null,"id":1}
```

Fortunately humancharitycoind lets you enable HTTPS, so that all your humancharitycoind RPC calls are nice and encrypted, safe from wandering eyes. A secure HTTPS requires two things: an RSA private key and a self-signed CA cert.

## Generating a Private Key and CA Cert
Make sure you have OpenSSL installed: `which openssl`. Most Linux distributions and OSX have OpenSSL installed by default.

OpenSSL won't generate a RSA private key without encrypting it with a passphrase. humancharitycoind, however, requires a private key *without* a passphrase. So first generate a private key with a passphrase 

    openssl genrsa -des3 -passout pass:x -out humancharitycoind.pass.key 2048

then strip the passphrase

    openssl rsa -passin pass:x -in humancharitycoind.pass.key -out humancharitycoind.key
    rm humancharitycoind.pass.key

and create a certificate signing request 

    openssl req -new -key humancharitycoind.key -out humancharitycoind.csr

Fill in the values where required and set the Common Name (CN) to the domain name of the humancharitycoind rpc server you wish to secure. (eg. if your server is hosted at the IP pointed to by rpc.humancharitycoin.com then set your common name to this domain). Finally sign your certificate signing request

    openssl x509 -req -days 365 -in humancharitycoind.csr -signkey humancharitycoind.key -out humancharitycoind.crt

Now store `humancharitycoind.crt` and `humancharitycoind.key` in a secure location on your server, we'll assume `/etc/ssl/certs/humancharitycoind.crt` and `/etc/ssl/private/humancharitycoind.key` respectively. Copy `humancharitycoind.crt` to the client you will be using to access your remote humancharitycoind server.

## Configuring humancharitycoind

On your server edit `humancharitycoin.conf` and add the following entries:

    rpcssl=1
    rpcsslcertificatechainfile=/etc/ssl/certs/humancharitycoind.crt
    rpcsslprivatekeyfile=/etc/ssl/private/humancharitycoind.key

On your client edit `humancharitycoin.conf` and add:

    rpcsslcertificatechainfile=/etc/ssl/certs/humancharitycoind.crt

Run humancharitycoind. Your JSON-RPC interface is now secure!

## Using node-humancharitycoin

The latest version of [node-humancharitycoin](https://github.com/Human-Charity-Coin/node-humancharitycoin) now supports accessing a HTTPS humancharitycoind server. Simply store `humancharitycoind.crt` in an accessible directory, load it, and pass it to `node-humancharitycoin` as the `ca` option

```js
var fs = require('fs')

var ca = fs.readFileSync('humancharitycoind.crt')

var humancharitycoin = require('node-humancharitycoin')({
  user: 'rpcusername',
  pass: 'rpcpassword',
  https: true,
  ca: ca
})
```

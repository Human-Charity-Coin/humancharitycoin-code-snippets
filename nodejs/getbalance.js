/* A "Hello World" example of using node-humancharitycoin to access
 * humancharitycoind via JSON-RPC. Retreives the current wallet balance.
 *
 * Either run humancharitycoind directly or run humancharitycoin-qt with the -server
 * command line option. Make sure you have a ~/.humancharitycoin/humancharitycoin.conf
 * with rpcuser and rpcpassword config values filled out. Note that
 * newer versions of humancharitycoin (1.5 and above) don't allow identical
 * your rpc username and password to be identical.
 *
 */

/* Copy config.json.template to config.json and fill in your
 * rpc username and password. */
var config = require('config');

var humancharitycoin = require('node-humancharitycoin')({
      host: config.rpchost,
      port: config.rpcport,
      user: config.rpcuser,
      pass: config.rpcpassword
    });

humancharitycoin.getBalance(function(err, balance) {
  if (err) {
    return console.error('Failed to fetch balance', err.message);
  }
  console.log('humancharity balance is', balance);
});

const chalk = require('chalk');
const clear = require('clear');
const figlet = require('figlet');



clear();

console.log(
  chalk.green(
    figlet.textSync('Diamond Hands', { horizontalLayout: 'full' })
  )
);
const path = require('path');
const fs = require('fs-extra');
const solc = require('solc');

const buildPath = path.resolve(__dirname,'build');
fs.removeSync(buildPath);

const libraryPath = path.resolve(__dirname, 'contracts', 'Library.sol');
const source = fs.readFileSync(libraryPath, 'utf-8');

const input = {
    language: 'Solidity',
    sources: {
      'Library.sol': {
        content: source,
      },
    },
    settings: {
      outputSelection: {
        '*': {
          '*': ['*']
        },
      },
    },
  };

const output = JSON.parse(solc.compile(JSON.stringify(input))).contracts['Library.sol'];

// console.log(output.Library);
fs.ensureDirSync(buildPath);

for(let contract in output){
    fs.outputJsonSync(
        path.resolve(buildPath, contract+'.json'),
        output[contract]
    );
}
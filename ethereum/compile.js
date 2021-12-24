const path = require('path');
const fs = require('fs-extra');
const solc = require('solc');

const buildPath = path.resolve(__dirname,'build');
fs.removeSync(buildPath);

const libraryPath = path.resolve(__dirname, 'contracts', 'Library.sol');
const BookManagerPath = path.resolve(__dirname, 'contracts', 'devs', 'BookManager.sol');
const UserManagerPath = path.resolve(__dirname, 'contracts', 'devs', 'UserManager.sol');
const TokenManagerPath = path.resolve(__dirname, 'contracts', 'devs', 'TokenManager.sol');

const source = fs.readFileSync(libraryPath, 'utf-8');
const BookManagerSource = fs.readFileSync(BookManagerPath, 'utf-8');
const UserManagerSource = fs.readFileSync(UserManagerPath, 'utf-8');
const TokenManagerSource = fs.readFileSync(TokenManagerPath, 'utf-8');

const openzepplinSource = fs.readFileSync(TokenManagerPath, 'utf-8');


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

function findImports(path) {
  let importSource;
  if(path == 'devs/BookManager.sol') importSource = BookManagerSource;
  if(path == 'devs/UserManager.sol') importSource = UserManagerSource;
  if(path == 'devs/TokenManager.sol') importSource = TokenManagerSource;
  if(path == 'Interfaces.sol') importSource = InterfacesManagerSource;

  return {
    contents: importSource,
  }
}
const output = JSON.parse(
  solc.compile(JSON.stringify(input), { import: findImports })
).contracts;
  
fs.ensureDirSync(buildPath);


for(let contractSource in output){
  for(let contract in output[contractSource] )
    fs.outputJsonSync(
        path.resolve(buildPath, contract+'.json'),
        output[contractSource][contract]
    );
}
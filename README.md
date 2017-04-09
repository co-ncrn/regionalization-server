# ACS Regionalization API

### Installation

Requires: node, npm, etc.
```sh
$ git clone git@github.com:co-ncrn/regionalization-server.git
$ cd regionalization-server
$ npm install
```

Import database
```sh
$ mysql -u username -p regionalization_full < dump.sql
```

Use [Forever](https://github.com/foreverjs/forever) to run the node server
```sh
forever start index.js
```


#### Usage
Get all data for an MSA + scenario + data type
```
http://localhost:3000/api/{msa}/{scenario}/{data}
```
For example:
http://localhost:3000/api/10180/hous/pctown
http://localhost:3000/api/16740/gen/married

Get all metadata
```
http://localhost:3000/api/_metadata
```
Get metadata for a single MSA
```
http://localhost:3000/api/_metadata/{msa}
```

For example:
http://localhost:3000/api/_metadata/10180


### License

MIT



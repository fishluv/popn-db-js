# popn-db-js

Javascript client for [popn-dbs](https://github.com/fishluv/popn-dbs).

Supported datecodes:

- 2023041100 (Unilab)
- 2023121800 (Unilab + extras)

## Development

```sh
nvm use
yarn tsc --watch

# In another shell
node
```

```js
// In node repl:
var PopnDb = require(".")
// See Usage
```

```sh
yarn publish
```

## Usage

```js
// import
import { Unilab1218 } from "popn-db-js"
Unilab1218.sampleQueriedCharts({ count: 5, query: "ver=27,lv=45" })

// require
var PopnDb = require("popn-db-js")
PopnDb.Unilab1218.sampleQueriedCharts({ count: 5, query: "ver=27,lv=45" })

// output
[
  Chart {
    id: '2120ex',
    songId: '2120',
    songDebut: '27',
    songFolder: '27',
    difficulty: 'ex',
    level: 45,
    hasHolds: false,
    title: 'Caldwell 99',
    genre: 'Caldwell 99',
    titleSortChar: 'C',
    genreSortChar: 'C',
    bpm: '142',
    duration: null,
    notes: 1147,
    rating: -0.063,
    sranLevel: '01a',
    songLabels: [],
    remywikiPath: 'Caldwell_99',
    songSlug: 'caldwell-99',
    jkwikiPath: 'caldwell_99_ex'
  },
  ...
]
```

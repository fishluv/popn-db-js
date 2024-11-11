# popn-db-js

Javascript client for [popn-dbs](https://github.com/fishluv/popn-dbs).

Supported datecodes:

- 2024073100 (Unilab)
- 2024092500 (Jam&Fizz + extras)

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
import { JamFizz0925 } from "popn-db-js"
JamFizz0925.sampleQueriedCharts({ count: 5, query: "folder=27,lv=45" })

// require
var PopnDb = require("popn-db-js")
PopnDb.JamFizz0925.sampleQueriedCharts({ count: 5, query: "folder=27,lv=45" })

// output
[
  Chart {
    id: '2042ex',
    songId: 2042,
    difficulty: 'ex',
    level: 45,
    bpm: '143',
    mainBpm: 143,
    bpmType: 'constant',
    bpmSteps: [ 143 ],
    duration: 98,
    notes: 1030,
    holdNotes: 35,
    timing: 'standard',
    timingSteps: [ [Array] ],
    jkwikiPath: 'only_my_railgun_upper_ex',
    rating: '0.0',
    sranLevel: '04',
    title: 'only my railgun',
    fwTitle: 'ＯＮＬＹ　ＭＹ　ＲＡＩＬＧＵＮ',
    rTitle: 'Only my railgun',
    genre: 'only my railgun',
    fwGenre: 'ＯＮＬＹ　ＭＹ　ＲＡＩＬＧＵＮ（アッパー）',
    rGenre: 'Only my railgun',
    artist: '♪♪♪♪♪',
    rChara: 'SUMIRE',
    debut: '27',
    folders: [ '27', 'ddr', 'jubeat' ],
    slug: 'only-my-railgun-upper',
    remywikiPath: 'Only_my_railgun',
    songLabels: [ 'upper' ]
  },
  ...
]
```

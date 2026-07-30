# popn-db-js

Javascript client for [popn-dbs](https://github.com/fishluv/popn-dbs).

Supported datecodes:

- Unilab 2024073100
- Jam&Fizz 2025092400 + extras
- High Cheers 202607\_\_\_\_

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
import { HighCheers2607 } from "popn-db-js"
HighCheers2607.sampleQueriedCharts({ count: 5, query: "folder=28,lv=45" })

// require
var PopnDb = require("popn-db-js")
PopnDb.HighCheers2607.sampleQueriedCharts({ count: 5, query: "folder=28,lv=45" })

// output
[
  Chart {
    id: '2221ex',
    songId: 2221,
    difficulty: 'ex',
    level: 45,
    hardest: true,
    bpm: '185',
    mainBpm: 185,
    bpmType: 'constant',
    bpmSteps: [ 185 ],
    duration: 125,
    notes: 1190,
    holdNotes: 32,
    timing: 'standard',
    timingSteps: [ [Array] ],
    jkwikiPath: '%E3%83%A1%E3%82%BA%E3%83%9E%E3%83%A9%E3%82%A4%E3%82%B6%E3%83%BC_ex',
    rating: '-0.441',
    sranLevel: null,
    title: 'メズマライザー',
    fwTitle: 'メズマライザー',
    rTitle: 'Mesmerizer',
    genre: 'メズマライザー',
    fwGenre: 'メズマライザー',
    rGenre: 'Mesmerizer',
    artist: 'サツキ feat.初音ミク・重音テト',
    rChara: '*うさぬこ*',
    debut: '28',
    folders: [ '28', 'iidx', 'ddr', 'jubeat', 'sdvx' ],
    slug: 'mesmerizer',
    remywikiPath: 'Mesmerizer',
    songLabels: [ 'na_removal' ]
  },
  ...
]
```

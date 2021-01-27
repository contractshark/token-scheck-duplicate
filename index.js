const axios = require('axios')
const cheerio = require('cheerio')
const rp = require('request-promise')
const fs = require('fs')

// https://gist.github.com/cloudonshore/877ba8704bc7fff324daada9d7a454ed
// https://gist.github.com/cloudonshore/261e1036d102de9f4e1302b42caee2ee
const tokens = require('./tokens')

const storeData = (data, path) => {
  try {
    fs.writeFileSync(path, JSON.stringify(data))
  } catch (err) {
    console.error(err)
  }
}

const delay = ms =>
  new Promise(resolve =>
    setTimeout(() => {
      resolve()
    }, ms),
  )

async function main() {
  const newTokens = []
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]
    await delay(1000)
    console.log(`processing ${token.address}`)

    let txCount = 0
    let $
    try {
      res = await rp({
        uri: `https://etherscan.io/address/${token.address}`,
        timeout: 10000,
      })

      $ = cheerio.load(res)
      const parsed = $('p.mb-2.mt-1.mb-lg-0')[0].children[3].children[0].data
      if (parsed) {
        txCount = parsed
      }
    } catch (e) {
      try {
        debugger
        const parsed = $('p.mb-2.mt-1.mb-lg-0')[0].children[2].data.split(' ')[1]
        txCount = parsed
      } catch (error) {
        console.log('inner exception', error)
      }
    }
    console.log(parseFloat(txCount.replace(/,/g, '')))
    newTokens.push({ ...token, txCount: parseFloat(txCount.replace(/,/g, '')) })
  }

  console.log(newTokens.length, 'total tokens in array, compared to ', tokens.length)
  storeData(newTokens, './out/out.json')
}

main()

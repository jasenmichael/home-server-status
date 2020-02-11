/* eslint-disable eqeqeq */
/* eslint-disable space-before-function-paren */
/* eslint-disable no-console */
const axios = require('axios')
const moment = require('moment-timezone')
// require('dotenv').config()

const {
  JANDA_DB_URL,
  HOME_STATUS_ID,
  HOME_STATUS_KEY
} = process.env

exports.handler = function (event, context, cb) {
  console.log(context)
  const URL = `${JANDA_DB_URL}/${HOME_STATUS_ID}`
  const options = {
    headers: {
      'Content-Type': 'application/json',
      'cache-control': 'no-cache',
      'x-apikey': HOME_STATUS_KEY
    }
  }
  const checkConnection = (status) => {
    axios.get(URL, options)
      .then(async (res) => {
        // const online = false
        if ((res.data.online && await checkIfUpdated(res.data.next_check)) || status === true) {
          const result = {
            'online': res.data.online,
            'next_check': res.data.next_check,
            'last_check': res.data.last_check
          }
          send(result, 200)
        } else {
          const result = {
            'online': false,
            'next_check': res.data.next_check,
            'last_check': res.data.last_check
          }
          send(result, 404)
        }
      })
      .catch((err) => {
        console.error(err)
      })
  }

  const send = (body, statusCode) => {
    cb(null, {
      statusCode,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept'
      },
      body: JSON.stringify(body)
    })
  }

  function checkIfUpdated(nextCheck) {
    console.log('checking if updated in last 15 minutes')
    const startTime = moment().tz('America/Chicago').format()
    const date = startTime.split('T')[0]
    const nowHr = startTime.split('T')[1].split(':')[0]
    let nCheckDate = date
    const nCheck = nextCheck.replace(' am', '').replace(' pm', '').split(':')
    let nCheckHr = Number(nCheck[0]) <= 9 ? `${0}${Number(nCheck[0])}` : Number(nCheck[0])
    if (nextCheck.includes('pm')) {
      nCheckHr = Number(nCheck[0]) + 12
    }
    const nCheckMin = Number(nCheck[1]) <= 9 ? `${0}${Number(nCheck[1])}` : Number(nCheck[1])
    const nCheckSec = Number(nCheck[2]) <= 9 ? `${0}${Number(nCheck[2])}` : Number(nCheck[2])

    if (nowHr == 23 && nCheckHr == 12) {
      nCheckHr = '00'
      nCheckDate = moment(nCheckDate, 'YYYY-MM-DD').add('days', '1').format().split('T')[0]
    }
    const nextCheckTime = `${nCheckDate}T${nCheckHr}:${nCheckMin}:${nCheckSec}-06:00`
    console.log(nextCheckTime)
    console.log(startTime)
    const minutesTillNextUpdate = moment.utc(moment(nextCheckTime).diff(moment(startTime))).format('mm')

    console.log('minutesTillNextUpdate', minutesTillNextUpdate)
    if (minutesTillNextUpdate >= 16) {
      postOffline()
      return false
    } else {
      return true
    }
    // return true
  }

  function postOffline() {
    axios.put(URL, {
      online: false
    }, {
      headers: {
        'Content-Type': 'application/json',
        'cache-control': 'no-cache',
        'x-apikey': HOME_STATUS_KEY
      }
    }).catch(err => console.error(err))
  }

  if (event.httpMethod === 'GET') {
    if (event.queryStringParameters.resource === HOME_STATUS_ID) {
      checkConnection(false)
    } else {
      checkConnection(true)
    }
  } else {
    cb(null, {
      statusCode: 400,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept'
      }
    })
  }
}

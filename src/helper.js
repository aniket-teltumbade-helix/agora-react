var axios = require('axios')
const Authorization = `Basic ${Buffer.from(
  `e58fdcdefc1c4ee7a58fa8fcd316f02f:3c8dd107334349ce877417c488b191ce`
).toString('base64')}`
exports.recordAcquire = async RecordingUID => {
  var data = JSON.stringify({
    cname: 'HPANDGOF',
    uid: `${RecordingUID}`,
    clientRequest: {
      resourceExpiredHour: 72
    }
  })

  var config = {
    method: 'post',
    url: `https://api.agora.io/v1/apps/${process.env.REACT_APP_AGORA_APP_ID}/cloud_recording/acquire`,
    headers: {
      'Content-Type': 'application/json',
      Authorization
    },
    data: data
  }

  return await axios(config)
}
exports.recordStart = async (RecordingUID, resourceId) => {
  var data = {
    cname: 'HPANDGOF',
    uid: `${RecordingUID}`,
    clientRequest: {
      token:
        '006b99b87affd9948e19aa9e4a01e86ac66IACQJR9PzS/T8EtJLIa/Cc9odtPZs12QS8jXucnxey9fKCcztRYAAAAAEACtOxo0jPWpYQEAAQCM9alh',
      recordingConfig: {
        maxIdleTime: 120,
        streamTypes: 3,
        channelType: 0,
        subscribeUidGroup: 2
      },
      storageConfig: {
        vendor: 1,
        region: 14,
        bucket: 'audioone-helix-agora1',
        accessKey: 'AKIAVEK5CCCXB247FFC7',
        secretKey: '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',
        fileNamePrefix: [`${RecordingUID}`]
      }
    }
  }
  var config = {
    method: 'post',
    url: `https://api.agora.io/v1/apps/${process.env.REACT_APP_AGORA_APP_ID}/cloud_recording/resourceid/${resourceId}/mode/individual/start`,
    headers: {
      'Content-Type': 'application/json',
      Authorization
    },
    data: data
  }
  let f = await axios(config)
  return f.data
}

exports.recordStop = async (body, uid) => {
  var config = {
    method: 'post',
    url: `http://api.agora.io/v1/apps/${process.env.REACT_APP_AGORA_APP_ID}/cloud_recording/resourceid/${body.resourceId}/sid/${body.sid}/mode/individual/stop`,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      Authorization
    },
    data: {
      cname: 'HPANDGOF',
      uid: `${uid}`,
      clientRequest: {
        async_stop: true
      }
    }
  }
  let f = await axios(config)
  return f.data
}
exports.recordQuery = async body => {
  var config = {
    method: 'get',
    url: `https://api.agora.io/v1/apps/${process.env.REACT_APP_AGORA_APP_ID}/cloud_recording/resourceid/${body.resourceId}/sid/${body.sid}/mode/individual/query`,
    headers: {
      'Content-Type': 'application/json',
      Authorization
    }
  }

  return await axios(config)
}

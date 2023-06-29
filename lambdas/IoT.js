const AWS = require('aws-sdk');
AWS.conﬁg.update({ region: 'us-east-2' });
const docClient = new AWS.DynamoDB.DocumentClient();
const iotData = new AWS.IotData({
  endpoint:
    "a2l8sui96z922q-ats.iot.us-east-2.amazonaws.com"
});
const ses = new AWS.SES();
exports.handler = async (event) => {
  const shift = await getShifts(event)
  const user = await getUser(event)
  if (shift === undeﬁned || shift.clock_out != null) {
    if (user?.work_shift) {
      const entrance = user.work_shift[0]
      const entranceHour = entrance.split(':')[0]
      const entranceMinutes = entrance.split(':')[1]
      const currentDate = new Date()
      currentDate.setHours(currentDate.getHours() - 6)
      const entranceTime = getMiliseconds(entranceHour, entranceMinutes)
      // const entranceTime = getMiliseconds(20, 50)
      const currentTime = getMiliseconds(currentDate.getHours(),
        currentDate.getMinutes())
      // console.log("Current: " + currentDate.getHours())
      // console.log("Entrance: " + entranceTime)
      if (currentTime >= entranceTime) {
        await createShift(event)
        await iotData.publish({
          topic: 'nfc/response',
          payload: JSON.stringify({ door: "open" })
        }).promise()
        await sendMail(`El usuario ${user.ﬁrst_name} comenzó su
jornada`, 'Notiﬁcación de comienzo')
      }
    } else {
      await createShift(event)
      await iotData.publish({
        topic: 'nfc/response',
        payload: JSON.stringify({ door: "open" })
      }).promise()
      await sendMail(`El usuario ${user.ﬁrst_name} comenzó su jornada`,
        'Notiﬁcación de comienzo')
    }
  } else if (shift !== undeﬁned) {
    if (user?.work_shift) {
      const exit = user.work_shift[1]
      const exitHour = exit.split(':')[0]
      const exitMinutes = exit.split(':')[1]
      const currentDate = new Date()
      currentDate.setHours(currentDate.getHours() - 6)
      // const exitTime = getMiliseconds(exitHour, exitMinutes)
      const exitTime = getMiliseconds(exitHour, exitMinutes)
      const currentTime = getMiliseconds(currentDate.getHours(),
        currentDate.getMinutes())
      if (currentTime >= exitTime) {
        await updateShift(event, shift.isLast)
        await iotData.publish({
          topic: 'nfc/response',
          payload: JSON.stringify({ door: "open" })
        }).promise()
        await sendMail(`El usuario ${user.ﬁrst_name} terminó su jornada`,
          'Notiﬁcación de termino')
      }
    } else {
      await updateShift(event, shift.isLast)
      await iotData.publish({
        topic: 'nfc/response',
        payload: JSON.stringify({ door: "open" })
      }).promise()
      await sendMail(`El usuario ${user.ﬁrst_name} terminó su jornada`,
        'Notiﬁcación de termino')
    }
  }
};
function getMiliseconds (hours = new Date().getHours(), minutes = new
  Date().getMinutes()) {
  const hoursInMs = hours * 60 * 60 * 1000
  const minutesInMs = minutes * 60 * 1000
  return hoursInMs + minutesInMs
}
async function sendMail (message, subject) {
  const params = {
    Destination: { ToAddresses: ['morokeidovah@gmail.com'] },
    Message: {
      Body: {
        Text: { Data: message },
      },
      Subject: { Data: subject },
    },
    Source: 'morokeidovah@gmail.com'
  }
  await ses.sendEmail(params).promise()
}
async function getUser (userData) {
  const data = await docClient.get({
    TableName: 'Users',
    Key: { email: userData.email }
  }).promise()
  return data.Item
}
async function updateShift (userData, isLastNumber) {
  const currentDate = new Date()
  await docClient.update({
    TableName: 'Shifts',
    Key: { email: userData.email, isLast: isLastNumber },
    UpdateExpression: "Set clock_out = :c",
    ExpressionAttributeValues: { ":c": currentDate.toISOString() }
  }).promise()
  await docClient.update({
    TableName: 'Users',
    Key: { email: userData.email },
    UpdateExpression: "Set working = :q",
    ExpressionAttributeValues: { ":q": false }
  }).promise()
}
async function getShifts (userData) {
  const data = await docClient.query({
    TableName: 'Shifts',
    KeyConditionExpression: "email = :userEmail",
    ExpressionAttributeValues: { ":userEmail": userData.email },
  }).promise()
  if (data.Items.length === 0) return undeﬁned
  else {
    const sorted = data.Items.sort((a, b) => {
      const dateA = new Date(a.date)
      const dateB = new Date(b.date)
      return dateA - dateB
    })
    return sorted[sorted.length - 1]
  }
}
async function createShift (userData) {
  const currentDate = new Date()
  await docClient.put({
    TableName: 'Shifts',
    Item: {
      email: userData.email,
      date: currentDate.toISOString(),
      clock_in: currentDate.toISOString(),
      isLast: Math.random(),
      clock_out: null
    }
  }).promise()
  await docClient.update({
    TableName: 'Users',
    Key: { email: userData.email },
    UpdateExpression: "Set working = :w",
    ExpressionAttributeValues: { ":w": true }
  }).promise()
}
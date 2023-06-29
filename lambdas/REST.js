const AWS = require('aws-sdk');
AWS.config.update({ region: 'us-east-2' });
const docClient = new AWS.DynamoDB.DocumentClient();
exports.handler = async (event) => {
  const action = event.queryStringParameters.action
  const body = JSON.parse(event.body)
  let response = {}
  switch (action) {
    case 'login':
      response = await logIn(body)
      break;
    case 'create':
      response = await createUser(body)
      break
    case 'update':
      response = await updateUser(body)
      break
    case 'getAll':
      response = await getAllUsers()
      break
    case 'getShifts':
      response = await getShifts(body)
      break
    case 'getOne':
      response = await getOneUser(body)
      break
    default:
      response = {
        statusCode: 400,
        body: JSON.stringify({
          message: 'Enpoint no encontrado'
        })
      }
  }
  return {
    ...response,
    headers: {
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
    }
  }
}
async function getOneUser (userData) {
  try {
    const data = await docClient.get({
      TableName: 'Users',
      Key: { email: userData.email }
    }).promise()
    if (data.Item) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          user: data.Item
        })
      }
    } else {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: 'No se encontró el usuario'
        })
      }
    }
  } catch (e) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Ocurrió un problema con el servidor'
      })
    }
  }
}
async function getShifts (userData) {
  try {
    const data = await docClient.query({
      TableName: 'Shifts',
      KeyConditionExpression: "email = :userEmail",
      ExpressionAttributeValues: { ":userEmail": userData.email }
    }).promise()
    return {
      statusCode: 200,
      body: JSON.stringify({
        shifts: data.Items
      })
    }
  } catch (e) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Ocurrió un problema con el servidor'
      })
    }
  }
}
async function getAllUsers () {
  try {
    const data = await docClient.scan({ TableName: 'Users' }).promise()
    const workers = data.Items.filter(user => user.role !== "Admin")
    return {
      statusCode: 200,
      body: JSON.stringify({
        workers
      })
    }
  } catch (e) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Ocurrió un problema con el servidor'
      })
    }
  }
}
async function updateUser (userData) {
  try {
    const fname = "first_name = :userFirst_name, "
    const flname = "first_last_name = :userFirst_last_name, "
    const slname = "second_last_name = :userSecond_last_name, "
    const shiftDuration = "shift_duration = :userShift_duration, "
    const workShift = "work_shift = :userWork_shift"
    await docClient.update({
      TableName: 'Users',
      Key: { email: userData.email },
      UpdateExpression: "Set " + fname + flname + slname + shiftDuration +
        workShift,
      ExpressionAttributeValues: {
        ":userFirst_name": userData.first_name,
        ":userFirst_last_name": userData.first_last_name,
        ":userSecond_last_name": userData.second_last_name,
        ":userShift_duration": userData.shift_duration,
        ":userWork_shift": userData.work_shift
      }
    }).promise()
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Usuario actualizado'
      })
    }
  } catch (e) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Ocurrió un problema con el servidor'
      })
    }
  }
}
async function createUser (userData) {
  try {
    await docClient.put({
      TableName: 'Users',
      Item: {
        'email': userData.email,
        'role': 'Worker',
        'first_name': userData.first_name,
        'first_last_name': userData.first_last_name,
        'second_last_name': userData.second_last_name,
        'shift_duration': userData.shift_duration,
        'work_shift': userData.work_shift,
        'working': false
      }
    }).promise()
    return {
      statusCode: 201,
      body: JSON.stringify({
        message: 'Usuario creado'
      })
    }
  } catch (e) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Ocurrió un problema con el servidor'
      })
    }
  }
}
async function logIn (userData) {
  try {
    const data = await docClient.get({
      TableName: 'Users',
      Key: { email: 'a19310153@ceti.mx' }
    }).promise()
    if (data.Item && userData.password == data.Item.password) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          message: 'Sesión iniciada'
        }),
      }
    } else {
      return {
        statusCode: 401,
        body: JSON.stringify({
          message: 'Ocurrió un error al iniciar sesión'
        })
      }
    }
  } catch (e) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Ocurrió un problema con el servidor'
      })
    }
  }
}
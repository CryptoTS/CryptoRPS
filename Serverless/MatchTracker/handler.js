'use strict';

module.exports.hello = (event, context, callback) => {
  const response = {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Go Serverless v1.0! Your function executed successfully!',
      input: event,
    }),
  };

  callback(null, response);

  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // callback(null, { message: 'Go Serverless v1.0! Your function executed successfully!', event });
};

/** HELPER FUNCTIONS **/

function safeParse(maybeJSON) {

  var json;
  try {
    json = JSON.parse(maybeJSON);
  }
  catch (err) {
    json = maybeJSON;
  }

  return json;
}
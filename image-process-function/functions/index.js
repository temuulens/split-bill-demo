const functions = require('firebase-functions');
const admin = require('firebase-admin');
const OpenAI = require('openai');

admin.initializeApp();

const openai = new OpenAI({
  apiKey: functions.config().openai.apikey,
});

exports.analyzeReceipt = functions.https.onRequest(async (req, res) => {
  // Set CORS headers for all responses
  res.set('Access-Control-Allow-Origin', '*');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Methods', 'POST');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    res.set('Access-Control-Max-Age', '3600');
    res.status(204).send('');
    return;
  }

  // Check if the request method is POST
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  // Get the base64 image from the request body
  const { base64Image } = req.body;

  if (!base64Image) {
    res.status(400).send('No base64 image provided');
    return;
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          "role": "system",
          "content": [
            {
              "type": "text",
              "text": "You are recepit converting into json assitant. Answer with json only without any extra text. without extra formating simple json.\n\nreturn format should be follow this\n\n{\n  \"items\": [\n    {\n      \"name\": \"\",\n      \"quantity\": 0,\n      \"unit_price\": 0,\n      \"total_price\": 0\n    }\n  ]\n}\n"
            }
          ]
        },
        {
          "role": "user",
          "content": [
            {
              "type": "image_url",
              "image_url": {
                "url": `data:image/png;base64,${base64Image}`
              }
            }
          ]
        }
      ],
      max_tokens: 1000,
    });

    // Send the OpenAI response back to the client
    res.status(200).json(response.choices[0].message.content);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Error processing the image');
  }
});


exports.saveJsonToDatabase = functions.https.onRequest(async (request, response) => {
  // Set CORS headers for all responses
  res.set('Access-Control-Allow-Origin', '*');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Methods', 'POST');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    res.set('Access-Control-Max-Age', '3600');
    res.status(204).send('');
    return;
  }

  // Check if the request method is POST
  if (request.method !== 'POST') {
    return response.status(405).send('Method Not Allowed');
  }

  try {
    // Parse the JSON body
    const jsonData = request.body;

    // Validate the JSON structure
    if (!jsonData || !jsonData.items || !Array.isArray(jsonData.items)) {
      return response.status(400).send('Invalid JSON structure');
    }

    // Generate a new UUID
    const newUuid = admin.database().ref().push().key;

    // Save the JSON data to the Realtime Database under the generated UUID
    await admin.database().ref(`orders/${newUuid}`).set(jsonData);

    // Return the UUID to the caller
    response.status(200).json({ uuid: newUuid });
  } catch (error) {
    console.error('Error saving data:', error);
    response.status(500).send('Internal Server Error');
  }
});
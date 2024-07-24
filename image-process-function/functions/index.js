const functions = require('firebase-functions');
const OpenAI = require('openai');

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

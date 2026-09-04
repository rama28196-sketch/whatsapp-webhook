exports.handler = async (event) => {
  const VERIFY_TOKEN =
    process.env.WHATSAPP_VERIFY_TOKEN ||
    "Rajkumar_WhatsApp_Verify_2026";

  // WhatsApp webhook verification
  if (event.httpMethod === "GET") {
    const params = event.queryStringParameters || {};

    const mode = params["hub.mode"];
    const token = params["hub.verify_token"];
    const challenge = params["hub.challenge"];

    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      return {
        statusCode: 200,
        headers: {
          "Content-Type": "text/plain"
        },
        body: challenge || ""
      };
    }

    return {
      statusCode: 403,
      body: "Verification failed"
    };
  }

  // Receive WhatsApp webhook messages
  if (event.httpMethod === "POST") {
    console.log("WhatsApp webhook:", event.body);

    return {
      statusCode: 200,
      body: "EVENT_RECEIVED"
    };
  }

  return {
    statusCode: 405,
    body: "Method Not Allowed"
  };
};

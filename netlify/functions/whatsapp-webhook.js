exports.handler = async (event) => {
  const VERIFY_TOKEN =
    process.env.WHATSAPP_VERIFY_TOKEN ||
    "Rajkumar_WhatsApp_Verify_2026";

  const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
  const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

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

  // Website complaint form submission
  if (event.httpMethod === "POST") {
    try {
      const data = JSON.parse(event.body || "{}");

      const name = data.name || data.fullName || "Not provided";
      const mobile = data.mobile || data.phone || "Not provided";
      const address = data.address || "Not provided";
      const complaint =
        data.complaint ||
        data.message ||
        data.description ||
        "Not provided";

      const recipient =
        process.env.WHATSAPP_RECIPIENT_NUMBER;

      if (!ACCESS_TOKEN || !PHONE_NUMBER_ID || !recipient) {
        return {
          statusCode: 500,
          body: JSON.stringify({
            error: "WhatsApp configuration missing"
          })
        };
      }

      const message = `
*புதிய புகார் பதிவு*

👤 பெயர்: ${name}

📱 மொபைல்: ${mobile}

📍 முகவரி: ${address}

📝 புகார் விவரம்:
${complaint}

இந்த தகவல் உங்கள் Complaint Website மூலம் பெறப்பட்டது.
      `.trim();

      const response = await fetch(
        `https://graph.facebook.com/v21.0/${PHONE_NUMBER_ID}/messages`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${ACCESS_TOKEN}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            to: recipient,
            type: "text",
            text: {
              body: message
            }
          })
        }
      );

      const result = await response.json();

      if (!response.ok) {
        return {
          statusCode: response.status,
          body: JSON.stringify(result)
        };
      }

      return {
        statusCode: 200,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          success: true,
          message: "Complaint submitted successfully"
        })
      };

    } catch (error) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: error.message
        })
      };
    }
  }

  return {
    statusCode: 405,
    body: "Method Not Allowed"
  };
};

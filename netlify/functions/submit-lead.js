exports.handler = async (event, context) => {
  // 1. Get your secret credentials from Netlify's environment
  const API_KEY = process.env.PARAMANTRA_API_KEY;
  const APP_NAME = process.env.PARAMANTRA_APP_NAME;

  // 2. Get the data your user submitted from the 11ty form
  // We expect it to be a JSON string, so we parse it.
  const formData = JSON.parse(event.body);

  // 3. Build the payload. We use URLSearchParams
  //    to create the 'application/x-www-form-urlencoded' format.
  const params = new URLSearchParams();

  // === Dynamic data from your form ===
  // These values come from the 'formData' object
  params.append('f_name', formData.f_name);
  params.append('l_name', formData.l_name);
  params.append('email', formData.email);
  params.append('phonefax', formData.phonefax); // Required
  params.append('notes', formData.notes);
  params.append('project', formData.project || ''); // Use the project if provided, or send empty string

  // === Static data from your PHP file ===
  // These are added securely on the backend.
  params.append('rep_id', 'vgmeenal');
  params.append('channel_id', 'Enquiry_Form');
  params.append('subject', 'Lead from Website');
  params.append('alert_client', '0');
  params.append('alert_rep', '0');

  // 4. Create the Basic Auth header:
  // Username = API Key, Password = BLANK
  // This matches the logic from your PHP file: CURLOPT_USERPWD, $api_key
  const basicAuth = Buffer.from(`${API_KEY}:`).toString('base64');

  // 5. Define the secure 'https' URL from your PHP file
  const url = 'https://cloud.paramantra.com/paramantra/api/data/new/format/json';

  try {
    // 6. Make the secure request to the Paramantra API using NATIVE fetch
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${basicAuth}`,
        'X-API-KEY': API_KEY,
        'ACTION-ON': APP_NAME,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(), // Send the form-urlencoded data
    });

    // 7. Get the response from Paramantra (e.g., success, duplicate)
    const data = await response.json();

    // 8. Send the response back to your front-end
    return {
      statusCode: response.status,
      body: JSON.stringify(data),
    };

  } catch (error) {
    // 9. Handle any network or other errors
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to submit lead', details: error.message }),
    };
  }
};
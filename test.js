import * as dotenv from 'dotenv';
dotenv.config();

console.log(process.env.OPENAI_API_KEY);

async function buildFollowUp(answer) {
    // TODO: This is where the Examiner Agent will be implemented
    // Right now it will connect to the OpenAI API to generate a response
    // We will use the OpenAI API key that is stored in the .env file

    // 1. Log the input to ensure variables are correct
    console.log("Attempting to send message:", answer);
    
    // 2. Check if key is loaded (Don't log the actual key for security)
    if (!process.env.OPENAI_API_KEY) {
      console.error("DEBUG: API Key is missing or undefined.");
      return "Configuration Error: API Key missing.";
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-5-nano", // CORRECTED MODEL NAME
          messages: [
            {
              role: "system",
              content: "You are a helpful assistant that can answer questions about Radiation Oncology."
            },
            {
              role: "user",
              content: answer || "Test message" // Fallback if answer is undefined
            }
          ]
        })
      });

      // 3. Check for HTTP errors BEFORE parsing JSON
      if (!response.ok) {
        // Parse the error message from OpenAI specifically
        const errorData = await response.json().catch(() => null); 
        const errorText = errorData ? JSON.stringify(errorData) : await response.text();
        
        throw new Error(`API Error ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log("Success:", data); // View full response structure
      return data.choices[0].message.content;

    } catch (error) {
      // 4. Log the specific error
      console.error('Detailed Debug Error:', error.message);
      return `Error: ${error.message}`;
    }
  }

buildFollowUp("What is the treatment plan for this patient?");
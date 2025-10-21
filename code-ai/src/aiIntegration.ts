import axios from "axios";

async function getAIPoweredBotResponse(prompt: string): Promise<string> {
  const apiUrl = "http://localhost:3000";

  try {
    const response = await axios.post(apiUrl, { prompt });
    console.log("Axios response:", response.data);

    // Check if response is in expected format
    if (response.data && response.data.bot) {
      return response.data.bot.trim();
    } else {
      console.error("Unexpected response format:", response.data);
      return "Unexpected response from AI";
    }
  } catch (error: any) {
    // Axios errors have a response object
    if (error.response) {
      console.error(
        "Error status:",
        error.response.status,
        "data:",
        error.response.data
      );
    } else {
      console.error("Network / other error:", error.message);
    }
    return "Something went wrong";
  }
}

export { getAIPoweredBotResponse };

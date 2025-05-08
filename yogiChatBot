function SendMessage() {
  var player = GetPlayer();
  var message = player.GetVar("message");
  var response = player.GetVar("response");
  var chatHistory = player.GetVar("chatHistory");
  var role = player.GetVar("role");
  var apiKey = player.GetVar("apiKey");

  var systemContent = `Act as a ${role} Assistant. Provide a concise answer to the user's question in a maximum of 500 characters.`;
  var userContent = `Question: ${message}`;
  apiKey = `Bearer ${apiKey}`;

  function sendMessage() {
    player.SetVar("response", "Please wait...");
    player.SetVar("message", "");

    var xhr = new XMLHttpRequest();
    var url = 'https://api.openai.com/v1/chat/completions';
    xhr.open('POST', url, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Authorization', apiKey);

    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          try {
            var apiResponse = JSON.parse(xhr.responseText);
            if (
              apiResponse.choices &&
              apiResponse.choices[0] &&
              apiResponse.choices[0].message &&
              apiResponse.choices[0].message.content
            ) {
              var generatedResponse = apiResponse.choices[0].message.content.trim();
              player.SetVar("response", generatedResponse);

              // Update and limit chat history to last 5 exchanges (10 lines)
              var updatedHistory = `${chatHistory}\nUser: ${message}\nResponse: ${generatedResponse}\n`;
              var historyLines = updatedHistory.trim().split('\n');
              var limitedHistory = historyLines.slice(-10).join('\n');
              player.SetVar("chatHistory", limitedHistory);
            } else {
              player.SetVar("response", `Error: ${JSON.stringify(apiResponse)}`);
            }
          } catch (e) {
            player.SetVar("response", "Error parsing response.");
          }
        } else {
          player.SetVar("response", `Error: ${xhr.status} - ${xhr.statusText}`);
        }
      }
    };

    var data = JSON.stringify({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemContent },
        { role: "user", content: userContent }
      ],
      max_tokens: 150
    });

    xhr.send(data);
  }

  sendMessage();
}

function ClearChat() {
  var player = GetPlayer();
  player.SetVar("chatHistory", "");
  player.SetVar("response", "");
}

function ExportChat() {
  var player = GetPlayer();
  var chatHistory = player.GetVar("chatHistory");
  var blob = new Blob([chatHistory], { type: 'application/msword' });
  var downloadLink = document.createElement("a");
  downloadLink.download = "Chat History.doc";
  downloadLink.href = window.URL.createObjectURL(blob);
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
}

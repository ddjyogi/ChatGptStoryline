/* ======================================================
   yogiChatBotGpt4.js  –  GPT-4o request + chat utilities
   ====================================================== */
if (!window.__yogiChatLoaded) {              // <--  safety guard
  window.__yogiChatLoaded = true;

  function SendMessage() {
    var player = GetPlayer();
    var message      = player.GetVar("message");
    var response     = player.GetVar("response");
    var chatHistory  = player.GetVar("chatHistory");
    var role         = player.GetVar("role");
    var apiKey       = player.GetVar("apiKey");

    /* ---------- build prompt ---------- */
    var systemContent = `Act as a ${role} Assistant. Provide a concise answer to the user's question in a maximum of 2000 characters.`;
    var userContent   = `Question: ${message}`;
    apiKey = `Bearer ${apiKey}`;

    /* ---------- fire request ---------- */
    function sendMessage () {
      player.SetVar("response", "Please wait...");
      player.SetVar("message", "");

      var xhr = new XMLHttpRequest();
      xhr.open('POST', 'https://api.openai.com/v1/chat/completions', true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.setRequestHeader('Authorization', apiKey);

      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            try {
              var apiResponse = JSON.parse(xhr.responseText);
              var generatedResponse =
                apiResponse?.choices?.[0]?.message?.content?.trim();

              if (generatedResponse) {
                player.SetVar("response", generatedResponse);

                /* keep only last 5 exchanges (10 lines) */
                var updated =
                  `${chatHistory}\nUser: ${message}\nResponse: ${generatedResponse}\n`;
                var limited = updated.trim().split('\n').slice(-10).join('\n');
                player.SetVar("chatHistory", limited);
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

      xhr.send(
        JSON.stringify({
          model: "gpt-4o",
          messages: [
            { role: "system", content: systemContent },
            { role: "user",   content: userContent   }
          ],
          max_tokens: 150
        })
      );
    }

    sendMessage();
  }

  function ClearChat () {
    var p = GetPlayer();
    p.SetVar("chatHistory", "");
    p.SetVar("response",    "");
  }

  function ExportChat () {
    var p = GetPlayer();
    var blob = new Blob([p.GetVar("chatHistory")], { type: 'application/msword' });
    var a = document.createElement("a");
    a.download = "Chat History.doc";
    a.href = URL.createObjectURL(blob);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  /* make the helpers globally discoverable if you wish */
  window.SendMessage  = SendMessage;
  window.ClearChat    = ClearChat;
  window.ExportChat   = ExportChat;
}

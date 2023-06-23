
import chatWindow from "@/render/components/assist/cards/chatWindow.vue";
import { h } from "vue";
import { useStore } from "@/render/store";

const store = useStore();
const webSocketGet = (target, params, callback = () => { }) => {
  return new Promise(function (resolve, reject) {
    var server = new WebSocket(target);
    server.onopen = function () {
      server.send(
        JSON.stringify(params)
      );
    };
    server.onerror = function (err) {
      reject(err);
    };
    server.onmessage = function (e) {
      const resp = callback(e.data);
      if (resp == "__DONE__") {
        server.close();
      }
    };

    resolve({
      server: server,
    });
  });
}

export const renderChatWindow = (session, content) => {
  // Need to cache the chat history even if user does not need response
  const chatCacheKey = content.key ? content.key : `__CHAT_${session}__`;

  const inputChatHistory = content.params?.history ?? [];
  if (store.getReturnValue(session)[chatCacheKey] == null) {
    store.setValue(session, chatCacheKey, []);
  }

  // if (store.getReturnValue(session)[chatCacheKey].length == 0) {
  //   const chatCache = content.params?.history ?? [];
  //   store.setValue(session, chatCacheKey, chatCache);
  // }
  
  return h(chatWindow, {
    messages: inputChatHistory.concat(store.getReturnValue(session)[chatCacheKey]),
    style: { width: "100%", height: "100%" },

    onCustomEvent: async (data) => {
      const v = store.getReturnValue(session)[chatCacheKey];
      if (!data.transient) {
        v.push(data.content);
      }

      // Automatic response (empty placeholder)
      v.push("");
      store.setValue(session, chatCacheKey, v);

      // A simple version: receives all the text from websocket server
      const server = content.params?.server ?? "";
      console.log("[ Chat ] requesting from server: " + server);
      if (server.startsWith("ws://")) {
        webSocketGet(server, content.params, (r) => {
          if (r == "__DONE__") {
            return "__DONE__";
          } else {
            const v = store.getReturnValue(session)[chatCacheKey];
            v[v.length - 1] = v[v.length - 1] + r;
            store.setValue(session, chatCacheKey, v);
          }
        });

      } else if (server.startsWith("http")) {
        // send a HTTP GET or POST request to server
        const method = content.params?.method ?? "GET";
        if (method == "GET") {
          var url = server + "?";
          var index = 0;
          for (const [key, value] of Object.entries(content.params?.data ?? {})) {
            if (index > 0) {
              url = url + "&";
            }
            index = index + 1;
            if (key == "__QUERY_KEY__") {
              url = url + value + "=" + data;
            } else {
              url = url + key + "=" + value;
            }
          }

          fetch(url)
            .then(response => response.json())
            .then(r => {
              var append = r;
              const keys = content.params?.response ?? [];
              for (const key of keys) {
                append = append[key];
              }

              const v = store.getReturnValue(session)[chatCacheKey];
              v[v.length - 1] = v[v.length - 1] + String(append);
              store.setValue(session, chatCacheKey, v);
            })

            .catch(error => {
              // console.error('Error:', error);
              const v = store.getReturnValue(session)[chatCacheKey];
              v[v.length - 1] = v[v.length - 1] + String(error);
              store.setValue(session, chatCacheKey, v);
            });

        } else if (method == "POST") {
          const jsonData = content.params?.data ?? {};
          if (jsonData["__QUERY_KEY__"] != null) {
            jsonData[jsonData["__QUERY_KEY__"]] = data.content;
          }
          // console.log("POST data: " + JSON.stringify(jsonData), server);

          fetch(server, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(jsonData),
          })
            .then(response => response.json())
            .then(r => {
              console.log("POST response: " + JSON.stringify(r), jsonData, data);
              var append = r;
              const keys = content.params?.response ?? [];
              for (const key of keys) {
                append = append[key];
              }

              const v = store.getReturnValue(session)[chatCacheKey];
              v[v.length - 1] = v[v.length - 1] + String(append);
              store.setValue(session, chatCacheKey, v);
            }
            ).catch((error) => {
              const v = store.getReturnValue(session)[chatCacheKey];
              v[v.length - 1] = v[v.length - 1] + String(error);
              store.setValue(session, chatCacheKey, v);
            }
            );
        }
      }
    },
  });
};
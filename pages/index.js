import Head from "next/head";
import { useState } from "react";
import styles from "./index.module.css";
import { css } from "@emotion/css";

const FIRST_MESSAGE = {role: "system", content: "You are a helpful chinese language tutor assistant who teaches others chinese by having a conversion with them."};

export default function Home() {
  const [animalInput, setAnimalInput] = useState("");
  const [result, setResult] = useState();

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  const handleNewMessage = (event) => setNewMessage(event.target.value);

  const onClickSendBtn = (event) => {
    onSubmit(event);
  };

  const onKeydownSendBtn = (event) => {
    if (event.key === "Enter") {
      onClickSendBtn(event);
    }
  };

  const getModelMessages = (messages) => {
	const msgs = [...messages, { text: newMessage, sentByMe: true }];
	return [FIRST_MESSAGE, ...msgs.map((msg) => ({role:  msg.sentByMe ? "user" : 'assistant', content: msg.text}))];
  }

  async function onSubmit(event) {
    event.preventDefault();
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ "messages": getModelMessages(messages) }),
      });
	  

	//   const response = await fetch( "https://api.openai.com/v1/chat/completions",
	// 	{
	// 		body: JSON.stringify({
	// 			"model": "gpt-3.5-turbo",
	// 			"messages": getModelMessages(messages),
	// 			"temperature": 0.3,
	// 			"max_tokens": 2000
	// 			}), 
	// 		method: "POST",
	// 		headers: {
	// 			"content-type": "application/json",
	// 			Authorization: "Bearer " + process.env.OPENAI_API_KEY,
	// 		}
	// 	})

      const data = await response.json();
      if (response.status !== 200) {
        throw (
          data.error ||
          new Error(`Request failed with status ${response.status}`)
        );
      }

      setMessages([
        ...messages,
        { text: newMessage, sentByMe: true },
        { text: data.result, sentByMe: false },
      ]);
      setNewMessage("");
    } catch (error) {
      // Consider implementing your own error handling logic here
      console.error(error);
      alert(error.message);
    }
  }

  return (
    <div>
      <Head>
        <title>AI Language Tutor</title>
        <link rel="icon" href="/dog.png" />
      </Head>

      <main className={styles.main}>
        <h1>AI Language Tutor</h1>

        <div
          className={css`
            display: flex;
            flex-direction: column;
            width: 700px;

            .message {
              padding: 0 5px;

              border-radius: 10px;
            }

            .sent {
              align-self: flex-end;
              background: bisque;
            }

            .received {
              align-self: flex-start;
              background: azure;
            }
          `}
        >
          {messages.map((message, index) => (
            <div
              key={index}
              className={`message ${message.sentByMe ? "sent" : "received"}`}
            >
              {message.text}
            </div>
          ))}
        </div>

        <div>
          <input
            type="text"
            value={newMessage}
            onChange={handleNewMessage}
            onKeyDown={onKeydownSendBtn}
          />
          <button onClick={onClickSendBtn}>Send</button>
        </div>
      </main>
    </div>
  );
}

import React, { useState, useRef, useEffect } from 'react';
import styles from '../styles/home.module.css';
import ReactMarkdown from 'react-markdown';
import user from '../assets/user.png';
import gptIcon from '../assets/chatgpt-icon.png';
import CircularProgress from '@mui/material/CircularProgress';

window.SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;

export default function Home(props) {

  const apiKey = process.env.REACT_APP_OPENAI_API_KEY;
  const [variables, setVariables] = useState({});
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi, I'm here to generate you an invoice. Share the details..." }
  ]);
  const messageListRef = useRef(null);
  const textAreaRef = useRef(null);

  useEffect(() => {
    const newRecognition = new window.SpeechRecognition();
    setRecognition(newRecognition);
  }, []);

  useEffect(() => {
    const messageList = messageListRef.current;
    messageList.scrollTop = messageList.scrollHeight;
  }, [messages]);

  useEffect(() => {
    textAreaRef.current.focus();
  }, []);

  const handleError = () => {
    setMessages((prevMessages) => [...prevMessages, { role: "assistant", content: "To get started, make sure internet connectivity." }]);
    setLoading(false);
    recognition.stop();
    setIsRecording(false);
    setUserInput("");
  };

  const startVoiceRecognition = () => {
    let previousTranscriptions = "";
    recognition.continuous = true;
    recognition.start();
    setIsRecording(true);
    setMessages((prevMessages) => [
      ...prevMessages,
      { role: "user", content: "Listening..." },
    ]);

    recognition.onresult = (event) => {
      const resultIndex = event.resultIndex;
      const transcript = event.results[resultIndex][0].transcript;
      previousTranscriptions += transcript;
      setUserInput(previousTranscriptions.trim());
    };

    recognition.onend = () => {
      setLoading(false);
      recognition.stop();
      setIsRecording(false);
      handleSubmit();
    };

    recognition.onerror = () => {
      setLoading(false);
      recognition.stop();
      setIsRecording(false);
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          role: "assistant",
          content:
            "Sorry, I could not understand what you said. Please try again.",
        },
      ]);
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (userInput.trim() === "") {
      return;
    }
    setLoading(true);
    setIsRecording(false);
    recognition.stop();
    const context = [...messages, { role: "user", content: userInput }];
    setMessages(context);
    const apiRequestBody = {
      "model": "gpt-3.5-turbo",
      messages: [{ "role": "system", "content": "Act as JSON invoice generator, only answer invoice related things. Ask user about: Customer Name, Item Description, Item Amount, Total. You have to ask user if any of detail is missing. When the user says no, and return user data in only JSON." }].concat(context),
      temperature: 0.1,
      max_tokens: 200
    };

    const response = await fetch("https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": "Bearer " + apiKey,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(apiRequestBody)
      });

      if (!response.ok) {
        handleError();
        return;
      };

      setUserInput("");
      const data = await response.json();
      const jsonString = data.choices[0].message.content.match(/^{[\s\S]*}$/m);
      if (jsonString) {
        const jsonObject = JSON.parse(jsonString[0]);
        const keys = Object.keys(jsonObject);
        const variables = {};
        keys.forEach(key => {
          variables[key] = jsonObject[key];
        });
        // if (variables.hasOwnProperty("Item Description".toLowerCase()) || variables.hasOwnProperty("Total".toLowerCase()) || variables.hasOwnProperty("Customer Name".toLowerCase()) || variables.hasOwnProperty("Item Amount".toLowerCase())) {
          setVariables(variables);
          props.callback(variables);
        // };
      };
      setMessages((prevMessages) => [...prevMessages, { role: "assistant", content: data.choices[0].message.content }]);
      setLoading(false);
  };

  const handleEnter = (e) => {
    if (e.key === "Enter" && userInput) {
      if (!e.shiftKey && userInput) {
        if (!recognition || (recognition && !recognition.active)) {
          handleSubmit(e);
        }
      }
    } else if (e.key === "Enter") {
      e.preventDefault();
    }
  };

  return (
    <>
      <main className={styles.main}>
        <div className={styles.cloud}>
          <div ref={messageListRef} className={styles.messagelist}>
            {messages.map((message, index) => {
              return (
                // The latest message sent by the user will be animated while waiting for a response
                <div key={index} className={message.role === "user" && loading && index === messages.length - 1 ? styles.usermessagewaiting : message.role === "assistant" ? styles.apimessage : styles.usermessage}>
                  {/* Display the correct icon depending on the message type */}
                  {message.role === "assistant" ? <img src={gptIcon} alt="AI" width="30" height="30" className={styles.boticon} priority={true} /> : <img src={user} alt="Me" width="30" height="30" className={styles.usericon} priority={true} />}
                  <div className={styles.markdownanswer}>
                    {/* Messages are being rendered in Markdown format */}
                    <ReactMarkdown linkTarget={"_blank"}>{message.content}</ReactMarkdown>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        <div className={styles.center}>
          <div className={styles.cloudform}>
            <form onSubmit={handleSubmit}>
              <textarea
                disabled={loading}
                onKeyDown={handleEnter}
                ref={textAreaRef}
                autoFocus={false}
                rows={1}
                maxLength={512}
                type="text"
                id="userInput"
                name="userInput"
                placeholder={loading ? "Waiting for response..." : "Type your question..."}
                value={userInput}
                onChange={e => setUserInput(e.target.value)}
                className={styles.textarea}
              />
              <button
                type="submit"
                disabled={loading}
                className={styles.generatebutton}
              >
                {loading ? <div className={styles.loadingwheel}><CircularProgress color="inherit" size={20} /> </div> :
                  <svg viewBox='0 0 20 20' className={styles.svgicon} xmlns='http://www.w3.org/2000/svg'>
                    <path d='M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z'></path>
                  </svg>}
              </button>
              {isRecording ?
                <button className={styles.voicebutton} onClick={() => {
                  recognition.stop();
                  setIsRecording(false);
                }}>
                  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className={styles.svgicon}>
                    <circle cx="12" cy="12" r="10" fill="green" />
                  </svg>
                </button> :
                <button
                  type="button"
                  onClick={startVoiceRecognition}
                  className={styles.voicebutton}
                >
                  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className={styles.svgicon}>
                    <circle cx="12" cy="12" r="7" fill="#ff0000" />
                    <circle cx="12" cy="12" r="10" stroke="#ff0000" strokeWidth="3" fill="none" />
                  </svg>
                </button>}
            </form>
          </div>
        </div>
      </main>
    </>
  )
}

import React, { useState } from 'react';
import './App.css';
import { messageCard_bot, messageCard_user } from './components/message_cards';


const ChatInterface = () => {
  const [message, setMessage] = useState<string>("");
  const[messageList, setMessageList] = useState<Array<any>>([]);
  const [messageCards, setMessageCards] = useState<Array<any>>([]);

  const handleButtonClick = async () => {
    //do rag on user message then update messageCards
    const response = await fetch('http://localhost:3000/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: message,
        messageList: messageList
      })
    })

    const bot_message = await response.text();

    setMessageCards([messageCard_bot(bot_message), messageCard_user(message), ...messageCards]);
    setMessageList([...messageList, { role: "user", content: message}, { role: "assistant", content: bot_message}]);
    setMessage("");
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(event.target.value);

  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleButtonClick();
    }
  };

  return (
    <>
      <div className="flex h-screen overflow-hidden">
        <div className="flex-1">

          <header className="bg-white p-4 text-gray-700 border-b-2">
            <h1 className="text-2xl font-semibold text-center">VetGPT</h1>
          </header>
          <main className="flex h-full overflow-y-auto p-4 pb-36 flex-col-reverse">
            {messageCards}
          </main>
          <footer className="bg-white border-t border-gray-300 p-4 absolute bottom-0 w-full">
            <form className="flex items-center">
              <input type="string" onKeyDown={handleKeyDown} onChange={handleInputChange} value={message} placeholder="Type a message..." className="w-full p-2 rounded-md border border-gray-400 focus:outline-none focus:border-blue-500" />
              <button type="button" onClick={handleButtonClick} className="bg-indigo-500 text-white px-4 py-2 rounded-md ml-2">Send</button>
            </form>
          </footer>
        </div>
      </div>

    </>
  )
};

export default ChatInterface;
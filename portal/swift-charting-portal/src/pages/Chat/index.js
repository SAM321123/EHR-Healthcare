import React from 'react';

import { Route, Routes } from 'react-router-dom';

import ChatList from './ChatComponent/chatList/chatList';

const ChatLists = () => (
  <Routes>
    <Route path="/" element={<ChatList />} />
    <Route path="/:id" element={<ChatList />} />
  </Routes>
);

export default ChatLists;

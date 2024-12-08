import { axiosBaseInstance } from '../axios';

export const addChatHistory = async (authToken, message, role) => {
  try {
    await axiosBaseInstance(authToken).post('/api/chat-history', {
      message,
      role
    });
  } catch (error) {
    console.error('unable to add chat history');
  }
};

export const deleteChatHistory = async (authToken) => {
  try {
    await axiosBaseInstance(authToken).delete(`/api/chat-history`);
    return {
      success: true,
      message: 'Chat history deleted successfully'
    };
  } catch (error) {
    return {
      success: false,
      message: 'Unable to delete chat history, try again'
    };
  }
};

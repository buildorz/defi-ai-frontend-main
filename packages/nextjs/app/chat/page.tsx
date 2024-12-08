"use client";

import React, { Fragment, useEffect, useRef, useState } from "react";
import Image from "next/image";
import AudioPlayer from "react-h5-audio-player";
import "react-h5-audio-player/lib/styles.css";
import Markdown from "react-markdown";
import { useAccount, useWalletClient } from "wagmi";
import ChatInput from "~~/components/ChatInput";
import ConfirmationCard from "~~/components/ConfirmationCard";
import { RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";
import { socket } from "~~/lib/socket";
import { addChatHistory } from "~~/utils/apis/chat-history";
import { axiosBaseInstance } from "~~/utils/axios";
import {
  addToLocalStorage,
  getBlockchainNameFromId,
  getFromLocalStorage,
  getRandomId,
  removeFromLocalStorage,
} from "~~/utils/helper";
import { notification } from "~~/utils/scaffold-eth";

export type Message = {
  id: string | null;
  message: string;
  image?: string;
  hasImage: boolean;
  data: string;
  role?: string;
  audio?: Blob;
  confirmationCard?: boolean;
  userInteracted?: boolean;
  timeoutId?: NodeJS.Timeout;
  retryAvailable?: boolean;
  retryText?: string;
  retryQuery?: string;
  sent?: boolean;
  updated_at?: string;
  created_at?: string;
  confirmationTime?: number;
};

type AuthResponse = {
  data: {
    id: any;
    token: any;
    data: {
      token: string;
      id: string;
      [key: string]: any;
    };
    message?: string;
  };
  status: number;
};

type ErrorResponse = {
  response?: {
    data?: {
      message?: string;
    };
  };
};

type ChatHistoryResponse = {
  data: {
    data: {
      map(arg0: (chat: any) => Message): React.SetStateAction<Message[]>;
      data: Array<{
        image?: string;
        message?: string;
        created_at?: string;
        updated_at?: string;
        [key: string]: any;
      }>;
    };
  };
};

type SocketResponse = {
  success?: {
    message?: string;
    constructedMessage?: string;
    confirmation?: boolean;
    data?: any;
    imageData?: boolean;
    confirmationTime?: number;
  }[];
};

export default function Chat() {
  socket.connect();

  const [messages, setMessages] = useState<Message[]>([]);
  const { address, isConnected, chain } = useAccount();
  const [tokenExists, setTokenExists] = useState<boolean>(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedNetwork, setSelectedNetwork] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<{ clearCanvas: () => void } | null>(null);
  const [isScreenLoading, setIsScreenLoading] = useState<boolean>(false);
  const [incomingMessage, setIncomingMessage] = useState(false);
  const [isMessageLoading, setIsMessageLoading] = useState(false);
  const [connectedWalletAddressBlockchain, setConnectedWalletAddressBlockchain] = useState<string | null>(null);
  const [connectedWalletAddress, setConnectedWalletAddress] = useState<string | null>(null);

  const { data: walletClient } = useWalletClient();

  const convertBlobToBase64 = (blob: ArrayLike<number> | ArrayBufferLike) => {
    if (blob instanceof ArrayBuffer) {
      const uint8Array = new Uint8Array(blob);
      const binaryString = uint8Array.reduce((acc, i) => {
        return acc + String.fromCharCode(i);
      }, "");
      return window.btoa(binaryString);
    } else if (ArrayBuffer.isView(blob)) {
      const buffer = Buffer.from(blob.buffer);
      return buffer.toString("base64");
    } else if (Array.isArray(blob)) {
      const buffer = Buffer.from(blob);
      return buffer.toString("base64");
    } else {
      throw new Error("Unsupported blob type");
    }
  };

  useEffect(() => {
    const handleNewMessageResponse = (data: SocketResponse) => {
      if (data?.success) {
        for (const singleData of data.success) {
          if (!singleData.message) continue;

          const messageData: Message = {
            id: null,
            message: singleData?.constructedMessage ?? singleData?.message ?? "",
            role: "BOT",
            confirmationCard: singleData["confirmation"] ?? false,
            data: singleData?.imageData ? convertBlobToBase64(singleData?.data) : singleData?.data,
            confirmationTime: singleData?.confirmationTime,
            userInteracted: false,
            hasImage: singleData?.imageData ?? false,
          };

          setMessages(prevMessages => [...prevMessages, messageData]);
        }
      }
      setIsMessageLoading(false);
      scrollChatContainer();
    };

    socket.on("newMessageResponse", handleNewMessageResponse);
    return () => {
      socket.off("newMessageResponse", handleNewMessageResponse);
    };
  }, []);

  // useEffect(() => {
  //   let authInterval: NodeJS.Timer;

  //   if (connectedWalletAddress && !tokenExists) {
  //     console.log("Starting auth interval with:", {
  //       wallet: connectedWalletAddress,
  //       blockchain: connectedWalletAddressBlockchain,
  //     });

  //     authInterval = setInterval(() => {
  //       authenticateUser();
  //     }, 1000);
  //   }

  //   return () => {
  //     if (authInterval) {
  //       clearInterval(authInterval);
  //     }
  //   };
  // }, [connectedWalletAddress, tokenExists]);

  useEffect(() => {
    const handleWalletConnection = async (): Promise<void> => {
      if (connectedWalletAddress) {
        await authenticateUser();
      } else {
        removeFromLocalStorage("token");
        removeFromLocalStorage("userDetails");
      }
    };

    handleWalletConnection();
  }, [connectedWalletAddress]);

  useEffect(() => {
    if (chain) {
      setConnectedWalletAddressBlockchain(getBlockchainNameFromId(chain.id));
    } else {
      setConnectedWalletAddressBlockchain(null);
    }
  }, [chain]);

  const fetchPreviousChats = async (token: string): Promise<void> => {
    setIsScreenLoading(true);

    try {
      const chatResponse = await axiosBaseInstance(token).get<ChatHistoryResponse>(
        "/api/chat-history?page=1&limit=100",
      );

      setMessages(
        chatResponse.data.data.data?.map((chat: any) => {
          const data: Message = {
            ...chat,
            hasImage: !!chat?.image,
            data: chat?.image ? convertBlobToBase64(chat?.image) : chat?.message,
            id: chat.id || null,
            message: chat.message || "",
          };

          delete data?.image;
          delete data?.created_at;
          delete data?.updated_at;

          return data;
        }),
      );

      setIsScreenLoading(false);
      scrollChatContainer();
    } catch (error) {
      setIsScreenLoading(false);
    }
  };

  const authenticateUser = async (): Promise<void> => {
    try {
      console.log("Authenticating with:", {
        wallet: connectedWalletAddress,
        blockchain: connectedWalletAddressBlockchain,
      });

      const response = await axiosBaseInstance().post<AuthResponse>("/api/auth/authenticate", {
        wallet: connectedWalletAddress,
      });

      if (response.status === 200) {
        const responseData = response.data.data;
        const token = responseData.token;

        addToLocalStorage("token", token);
        addToLocalStorage("userDetails", responseData);
        setTokenExists(true);
        setUserId(responseData.id);

        await fetchPreviousChats(token);
      } else {
        notification.error("Error connecting account, try again later.");
        setTokenExists(false);
      }
    } catch (error: unknown) {
      const err = error as ErrorResponse;
      notification.error(err?.response?.data?.message ?? "Error connecting account, try again later.");
      setTokenExists(false);
    }
  };

  useEffect(() => {
    // check if wallet not connected and show notification
    if (!isConnected) {
      notification.info("Please connect your wallet to use the chat");
    }

    if (isConnected && walletClient?.account) {
      console.log("Setting wallet address and blockchain");
      setConnectedWalletAddress(walletClient.account.address);
      setConnectedWalletAddressBlockchain(getBlockchainNameFromId(chain?.id || 1));
    } else {
      setConnectedWalletAddress(null);
      setConnectedWalletAddressBlockchain(null);
      removeFromLocalStorage("token");
      removeFromLocalStorage("userDetails");
    }
  }, [isConnected, walletClient]);

  const handleClearCanvas = (): void => {
    if (chatInputRef.current) {
      chatInputRef.current.clearCanvas();
    }
  };

  // scroll chat container to bottom to show new messages
  const scrollChatContainer = (): void => {
    const scrollHeight = Math.ceil(containerRef?.current?.scrollHeight || 0) - 100;

    const handleScroll = () => {
      if (scrollHeight && containerRef.current) {
        containerRef.current.scrollTo({
          top: scrollHeight,
          behavior: "smooth",
        });
      }
    };

    setTimeout(handleScroll, 300);
  };

  // remove message from messages array
  const deleteMessage = (index: number): void => {
    setMessages(messages.filter((_, i) => i !== index));
  };

  // replace message in messages array
  const replaceMessage = (index: number, newMessage: Message): void => {
    const message = messages[index];

    if (!message?.userInteracted) {
      clearTimeout(message?.timeoutId);
    }

    setMessages(messages.map((message, i) => (i === index ? newMessage : message)));
  };

  // add message to messages array
  const addMessage = (message: Message): void => {
    setMessages([...messages, message]);
  };

  const sendMessage = async (message: string | Blob, audioMessage = false) => {
    socket.emit("newMessage", {
      userId: userId,
      blockchain: connectedWalletAddressBlockchain,
      [audioMessage ? "audioMessage" : "message"]: message,
    });

    console.log("Sending message:", {
      userId: userId,
      blockchain: connectedWalletAddressBlockchain,
      [audioMessage ? "audioMessage" : "message"]: message,
    });
  };

  useEffect(() => {
    const lastMessage = messages?.length > 0 && (messages[messages.length - 1] as Message);
    const lastMessageIndex = messages?.length - 1;

    if (lastMessage && lastMessage?.confirmationTime && !lastMessage.userInteracted) {
      const timeoutId: NodeJS.Timeout = setTimeout(async () => {
        const message = `Oops! It looks like your transaction couldn't be completed within ${
          lastMessage?.confirmationTime ? lastMessage.confirmationTime / 1000 : 0
        } seconds. Please give it another shot.`;

        replaceMessage(lastMessageIndex, {
          id: null,
          message: message,
          role: "BOT",
          confirmationCard: false,
          retryAvailable: true,
          retryText: "Retry Request",
          retryQuery: "the last request failed. retry with same properties",
          hasImage: false,
          data: "",
        });

        const userDetails = getFromLocalStorage<{ token: string }>("userDetails");
        if (userDetails?.token) {
          await addChatHistory(userDetails.token, message, "BOT");
        }
      }, lastMessage.confirmationTime ?? 0);
      setMessages(prevMessages =>
        prevMessages.map((message, i) => {
          if (i === lastMessageIndex) {
            return {
              ...message,
              timeoutId,
            };
          }
          return message;
        }),
      );
    }

    // scroll chat container to bottom to show new messages
    scrollChatContainer();
  }, [messages.length]);

  const handleInputSend = async (recordedBlob: Blob | null, inputText: string | null): Promise<void> => {
    if (inputText !== null) {
      await sendMessage(inputText);
      setIsMessageLoading(true);
      scrollChatContainer();

      const newMessage: Message = {
        id: null,
        message: inputText,
        role: "USER",
        hasImage: false,
        data: "",
      };
      setMessages(prevMessages => [...prevMessages, newMessage]);
    } else if (recordedBlob !== null) {
      try {
        await sendMessage(recordedBlob, true);
        setIsMessageLoading(true);
        scrollChatContainer();

        setMessages([
          ...messages,
          {
            id: null,
            message: "",
            role: "USER",
            confirmationCard: false,
            audio: recordedBlob,
            hasImage: false,
            data: "",
          },
        ]);

        handleClearCanvas();
      } catch (error) {
        console.log("error", error);
      }
    }
  };

  useEffect(() => {
    scrollChatContainer();
  }, [messages?.length, address]);

  return (
    <div className="min-h-screen flex flex-col bg-black">
      {/* Header with logo */}
      <div className="flex justify-center">
        <header className="relative z-[100] w-[600px] bg-[#ffffff1a] border border-gray-600/20  backdrop-blur-[100px] p-1.5  rounded-full   flex justify-between items-center mt-5 ">
          <div className="relative w-8 h-8">
            <Image alt="defiai logo" className="cursor-pointer" fill src="/DefiAIlogo.png" />
          </div>
          <div className="flex  gap-2 items-center  text-white">
            <RainbowKitCustomConnectButton />
          </div>
        </header>
      </div>

      <main className="flex-1 flex justify-center items-start p-6">
        {/* chat container */}
        {connectedWalletAddress && tokenExists ? (
          <div className="w-full max-w-[1200px] h-[calc(100vh-120px)]">
            <div className="bg-black w-full h-full flex flex-col gap-4">
              <div className="flex justify-end">
                <button className="bg-[#8f259b] px-6 text-white h-[43px] rounded-full  hover:bg-[#8f259b]/90 transition-colors">
                  Delete Chat History
                </button>
              </div>

              <div className="flex-1  flex flex-col overflow-hidden mt-5">
                <div
                  ref={containerRef}
                  className="flex-1 p-6 overflow-y-auto overflow-x-hidden no-scrollbar chat-scrollable-container"
                >
                  {messages.length === 0 && (
                    <Fragment>
                      <h4 className="text-white text-[24px] font-semibold">Ask {`DEFI AI`} with your prompt.</h4>
                      <p className="text-[white]/70 mt-2 text-[20px]">
                        AI Powered Conversational User Interface for Cryptocurrency.
                      </p>
                    </Fragment>
                  )}

                  {messages.length > 0 &&
                    messages.map((message, index) =>
                      message.confirmationCard ? (
                        <div key={getRandomId()} className="w-full  mt-20">
                          <ConfirmationCard
                            message={message.message}
                            data={message.data as any}
                            deleteMessage={() => deleteMessage(index)}
                            addMessage={addMessage}
                            replaceMessage={replaceMessage}
                            index={index}
                          />
                        </div>
                      ) : message.audio ? (
                        <div className="sent-audio flex flex-wrap justify-end pb-[25px]" key={getRandomId()}>
                          <AudioPlayer
                            src={URL.createObjectURL(message.audio)}
                            autoPlay={false}
                            onPlay={() => console.log("onPlay")}
                            customAdditionalControls={[]}
                            loop={false}
                            autoPlayAfterSrcChange={false}
                            showJumpControls={false}
                            layout="horizontal-reverse"
                          />
                        </div>
                      ) : (
                        <div
                          className={`relative ${message.role === "USER" ? "flex justify-end" : "flex justify-start"} ${
                            message.role === "USER" ? "" : "rounded-lg leading-4"
                          }`}
                          key={getRandomId()}
                        >
                          {message.role === "USER" ? (
                            <div className="text-white break-words text-right my-3 bg-[#ffffff1a]   backdrop-blur-[100px] py-3 pl-[22px] pr-[78px] rounded-[20px] max-w-[60%]">
                              {message.message}
                            </div>
                          ) : (
                            <div className="flex gap-4 items-center max-w-[60%] my-3">
                              <div className="text-white break-words text-left bg-[#8f259b] py-3   pl-[22px] pr-[78px] rounded-[20px]">
                                {message?.hasImage && (
                                  <img
                                    src={`data:image/png;base64,${message?.data}`}
                                    alt="chart-image"
                                    className={"size-fit py-2 px-4 pb-4"}
                                  />
                                )}
                                <div
                                  key={getRandomId()}
                                  className={` font-medium  text-[16px] max-sm:text-[15px]  pt-0 text-wrap break-words text-base leading-[24px]`}
                                >
                                  <Markdown
                                    components={{
                                      a: ({ node, ...props }) => (
                                        <a
                                          style={{
                                            textDecoration: "underline",
                                            marginBottom: "1em",
                                          }}
                                          target="_blank"
                                          {...props}
                                        />
                                      ),
                                      p: ({ node, ...props }) => <p {...props} />,
                                      h1: ({ node, ...props }) => (
                                        <h1
                                          style={{
                                            marginTop: "1em",
                                            marginBottom: "0.5em",
                                          }}
                                          {...props}
                                        />
                                      ),
                                      h2: ({ node, ...props }) => (
                                        <h2
                                          style={{
                                            marginTop: "1em",
                                            marginBottom: "0.5em",
                                          }}
                                          {...props}
                                        />
                                      ),
                                      li: ({ node, ...props }) => <li style={{ marginBottom: "0.5em" }} {...props} />,
                                    }}
                                  >
                                    {message.message}
                                  </Markdown>

                                  {/* show retry button if retryAvailable is true */}
                                  {message?.retryAvailable && (
                                    <button
                                      className="text-white text-sm rounded-md py-3 px-4 mt-7 bg-[#0a0a0a] font-medium "
                                      onClick={() => {
                                        setIsMessageLoading(true);
                                        if (message?.retryQuery) {
                                          sendMessage(message?.retryQuery);
                                        }
                                        replaceMessage(index, {
                                          ...message,
                                          retryAvailable: false,
                                        });
                                      }}
                                    >
                                      {message?.retryText || "Retry Request"}
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ),
                    )}

                  {isMessageLoading && (
                    <div className="py-4 bg-[#202020] w-[100px] flex self-start justify-center items-center rounded-[26px]">
                      <span className="loader"></span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-2">
                <ChatInput
                  ref={chatInputRef}
                  sendBtnHandler={handleInputSend}
                  setIsMessageLoading={setIsMessageLoading}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex justify-center items-center h-[80vh] ">
            <div className="w-full max-w-[400px] flex  flex-col gap-4 bg-[#171717] rounded-[15px] p-8 text-white text-center">
              <span className="text-xl font-medium">Connect Wallet to get started!</span>
              <div className="flex flex-col gap-3 justify-center">
                <RainbowKitCustomConnectButton />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

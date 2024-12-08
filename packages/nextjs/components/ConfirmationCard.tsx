import { useState } from "react";
import { sendEthereumTransaction } from "../lib/blockchains/ethereum/sendTransaction";
import { addChatHistory } from "../utils/apis/chat-history";
import { axiosBaseInstance } from "../utils/axios";
import Markdown from "react-markdown";
import { Message } from "~~/app/chat/page";
import { SUPPORTED_BLOCKCHAINS } from "~~/utils/constants";
import { getFromLocalStorage } from "~~/utils/helper";

type TransactionResponse = {
  success: boolean;
  message: string;
  tx: string;
};

type TxData = {
  amount: string;
  token: string;
  platform?: string;
};

interface ConfirmationCardProps {
  message: string;
  data: {
    blockchain: string;
    function: string;
    constructedMessage?: string;
    txData?: TxData;
  };
  deleteMessage: (index: number) => void;
  addMessage: (message: Message) => void;
  replaceMessage: (index: number, message: Message) => void;
  index: number;
}

const ConfirmationCard = ({
  message,
  data,
  deleteMessage,
  addMessage,
  replaceMessage,
  index,
}: ConfirmationCardProps) => {
  const [tx, setTx] = useState<string | undefined>();
  const [isConfirmLoading, setIsConfirmLoading] = useState<boolean>(false);

  const blockchain = data?.blockchain;
  const functionType = data?.function;

  const handleDecline = async (): Promise<void> => {
    replaceMessage(index, {
      message: "You declined the transaction",
      sent: false,
      confirmationCard: false,
      userInteracted: true,
      id: null,
      hasImage: false,
      data: "",
    });

    const userDetails = getFromLocalStorage("userDetails") as { token?: string };
    await addChatHistory(userDetails?.token ?? "", "You declined the transaction", "BOT");
  };

  const handleAccept = async (data: ConfirmationCardProps["data"]): Promise<void> => {
    setIsConfirmLoading(true);

    const userDetails = getFromLocalStorage("userDetails") as { token?: string };
    let message = "Unable to process transaction, please try again";
    let finalSuccess = false;

    try {
      if (blockchain === SUPPORTED_BLOCKCHAINS.ETHEREUM) {
        if (functionType === "send" || functionType === "swap") {
          const response: any = await sendEthereumTransaction(data as any);
          if (response.tx) {
            setTx(response.tx);
          }
          message = response.message;
          finalSuccess = response.success;
        }
      }

      setIsConfirmLoading(false);

      if (finalSuccess) {
        await axiosBaseInstance(userDetails?.token as any).delete("/api/message/my-messages");
      }

      replaceMessage(index, {
        message: message,
        sent: false,
        confirmationCard: false,
        userInteracted: true,
        ...(!finalSuccess && {
          retryAvailable: true,
          retryText: "Retry Request",
          retryQuery: "the last request failed. retry with same properties",
        }),
        id: null,
        hasImage: false,
        data: ""
      });
    } catch (e) {
      console.log(`error in handleAccept`, e);
      replaceMessage(index, {
        message: message,
        sent: false,
        confirmationCard: false,
        userInteracted: true,
        retryAvailable: true,
        retryText: "Retry Request",
        retryQuery: "the last request failed. retry with same properties",
        id: null,
        hasImage: false,
        data: ""
      });
    }

    await addChatHistory(userDetails?.token || "", message, "BOT");
  };

  return (
    <div className="bg-white/[.08] w-full rounded-2xl flex flex-col text-white p-4 gap-4">
      <span>{data?.constructedMessage ?? "Please Confirm this transaction"}</span>
      <div className="break-normal">
        <Markdown>{message}</Markdown>
      </div>
      <div className="flex justify-between w-full max-w-[500px] left-0 right-0 m-auto mt-2">
        <button
          className="text-white bg-reject-red h-[35px] rounded-xl py-1 px-6 sm:px-12 text-[16px] transition ease-in-out duration-200 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          onClick={handleDecline}
        >
          Decline
        </button>
        <button
          className="bg-confirm-green h-[35px] flex justify-center items-center rounded-xl py-1 px-6 sm:px-12 text-[16px] text-white transition ease-in-out duration-200 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          onClick={() => handleAccept(data)}
        >
          {isConfirmLoading ? <span className="confirmBtnLoaderGray"></span> : <span>Confirm</span>}
        </button>
      </div>
    </div>
  );
};

export default ConfirmationCard;

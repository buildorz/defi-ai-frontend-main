import { axiosBaseInstance } from "../../../utils/axios";
import { getFromLocalStorage } from "../../../utils/helper";
import { ethers } from "ethers";

type TransactionData = {
  tx: {
    data: string;
    to: string;
    value: string | number;
    gas: string | number;
  };
  txData?: {
    toAddress: string;
    token: string;
    value: string | number;
  };
};

type TransactionResponse = {
  success: boolean;
  message: string;
  tx?: ethers.TransactionResponse;
};

export const sendEthereumTransaction = async (data: TransactionData): Promise<TransactionResponse> => {
  try {
    if (typeof window.ethereum !== "undefined") {
      const userDetails = getFromLocalStorage("userDetails");

      if (!userDetails) {
        throw new Error("Kindly login first to proceed");
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const tx = await signer.sendTransaction({
        data: data.tx.data !== "" ? data.tx.data : null,
        to: data.tx.to,
        value: data.tx.value,
        gasLimit: data.tx.gas,
      });

      const txHash = tx.hash;

      // try {
      //   await axiosBaseInstance(userDetails?.token).post("/api/transaction/add-record", {
      //     tx_hash: txHash,
      //     user_id: userDetails?.id,
      //     type: "SEND",
      //     recipient: data?.txData?.toAddress,
      //     token_sent: data?.txData?.token,
      //     amount_sent: data?.tx?.value,
      //   });
      // } catch (error) {
      //   console.log(`Error storing transaction: ${error}`);
      // }

      return {
        success: true,
        message: `Transaction sent, you can monitor it [here](https://etherscan.io/tx/${txHash}).`,
        tx: tx,
      };
    }
    throw new Error("Ethereum provider not found");
  } catch (error) {
    console.log("error in sendEthereumTransaction", error);
    return {
      success: false,
      message: "Error sending transaction",
    };
  }
};

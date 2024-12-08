import { axiosBaseInstance } from "../../../utils/axios";
import { getFromLocalStorage } from "../../../utils/helper";
import { ethers } from "ethers";

type BaseNameTransactionData = {
  tx: {
    to: string;
    value: string | number;
    gasLimit: number;
    data: string;
  };
  txData: {
    name: string;
    duration: number;
    price: string;
    gasEstimate: string;
    registrationRequest: {
      name: string;
      owner: string;
      duration: number;
      resolver: string;
      data: any[];
      reverseRecord: boolean;
    };
  };
  function: string;
  sub_function: string | null;
  blockchain: string;
  constructedMessage: string;
};

type BaseNameTransactionResponse = {
  success: boolean;
  message: string;
  tx?: ethers.TransactionResponse;
};

export const purchaseBaseName = async (data: BaseNameTransactionData): Promise<BaseNameTransactionResponse> => {
  try {
    if (typeof window.ethereum === "undefined") {
      throw new Error("Please install a Web3 wallet like MetaMask");
    }

    const userDetails = getFromLocalStorage("userDetails") as any;

    if (!userDetails) {
      throw new Error("Please login first to proceed");
    }

    // Switch to Base network if needed
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x2105" }], // Chain ID for Base
      });
    } catch (switchError: any) {
      // If Base network is not added, add it
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: "0x2105",
                chainName: "Base",
                nativeCurrency: {
                  name: "ETH",
                  symbol: "ETH",
                  decimals: 18,
                },
                rpcUrls: ["https://mainnet.base.org"],
                blockExplorerUrls: ["https://basescan.org"],
              },
            ],
          });
        } catch (addError) {
          throw new Error("Failed to add Base network to your wallet");
        }
      } else {
        throw new Error("Failed to switch to Base network");
      }
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    // Send the transaction
    const tx = await signer.sendTransaction({
      to: data.tx.to,
      value: BigInt(data.tx.value.toString()),
      data: data.tx.data as `0x${string}`,
      gasLimit: BigInt(data.tx.gasLimit),
    });

    const txHash = tx.hash;

    // Record the transaction
    try {
      await axiosBaseInstance(userDetails?.token).post("/api/transaction/add-record", {
        tx_hash: txHash,
        user_id: userDetails?.id,
        type: "BASE_NAME_REGISTRATION",
        name: data.txData.name,
        duration: data.txData.duration,
        price: data.txData.price,
      });
    } catch (error) {
      console.error("Failed to record transaction:", error);
      // Continue even if recording fails
    }

    return {
      success: true,
      message: `Successfully initiated Base name registration. You can monitor the transaction on the Base Scan by clicking [here](https://basescan.org/tx/${txHash}).`,
      tx,
    };
  } catch (error: any) {
    console.error("Base name registration error:", error);
    return {
      success: false,
      message: "We encountered a problem while trying to process your request, try again",
    };
  }
};

import { axiosBaseInstance } from "../axios";
import axios from "axios";

export const getTokenAnalysis = async (token, blockchain) => {
  try {
    const res = await axiosBaseInstance(null).post(
      "/api/transaction/analyseToken",
      {
        token,
        blockchain,
      }
    );

    if (res.statusText !== "OK") {
      throw new Error("An error occured fetching token analysis");
    }

    return res.data;
  } catch (error) {
    console.error("unable to add chat history");
    throw new Error(error);
  }
};

export const getUserPortfolio = async (
  authToken,
  blockchain,
  nftConfirmation = false
) => {
  try {
    const res = await axiosBaseInstance(authToken).post(
      "/api/transaction/userPorfolio",
      {
        blockchain,
        nftConfirmation,
      }
    );

    if (res.statusText !== "OK") {
      throw new Error("An error occured fetching user portfolio");
    }

    return res.data.data;
  } catch (error) {
    console.error(error);
    throw new Error(error);
  }
};

export const getContractAddress = async (tokenName, blockchain) => {
  try {
    let blockchainName;

    console.log(blockchain);

    switch (blockchain) {
      case "eth":
        blockchainName = "ethereum";
        break;

      case "sol":
        blockchainName = "solana";
        break;

      default:
        break;
    }
    const res = await axios.get(
      `https://api.dexscreener.com/latest/dex/search?q=${tokenName}%20${blockchainName}`
    );

    if (res.status < 200 || res.status >= 300) {
      throw new Error("An error occured trying to get contract address");
    }

    const matches = res.data.pairs
      .filter(
        (el) =>
          el.baseToken.name.toLowerCase() === tokenName.toLowerCase() &&
          el.chainId === blockchainName
      )
      .map((el) => el.baseToken.address);

    return matches[0];
  } catch (error) {
    throw new Error(error);
  }
};

export const transfer = async (
  authToken,
  token,
  toAddress,
  amount,
  blockchain
) => {
  try {
    const res = await axiosBaseInstance(authToken).post(
      "/api/transaction/transfer",
      {
        token,
        toAddress,
        amount,
        blockchain,
      }
    );

    return res.data;
  } catch (error) {
    throw new Error(error);
  }
};

export const swap = async (
  authToken,
  tokenIn,
  tokenOut,
  amountToSwap,
  slippage,
  blockchain
) => {
  try {
    const res = await axiosBaseInstance(authToken).post(
      "/api/transaction/swap",
      {
        tokenIn,
        tokenOut,
        amountToSwap,
        slippage,
        blockchain,
      }
    );

    return res.data;
  } catch (error) {
    throw new Error(error);
  }
};

export const bridge = async (
  authToken,
  tokenIn,
  tokenOut,
  amountToBridge,
  sourceBlockchain,
  destinationBlockchain,
  payoutAddr
) => {
  try {
    const res = await axiosBaseInstance(authToken).post(
      "/api/transaction/bridge",
      {
        tokenIn,
        tokenOut,
        amountToBridge,
        sourceBlockchain,
        destinationBlockchain,
        payoutAddr,
      }
    );

    return res.data;
  } catch (error) {
    throw new Error(error);
  }
};

export const onramp = async (
  authToken,
  cryptoCurrency,
  fiatCurrency,
  amount,
  walletAddress
) => {
  try {
    const res = await axiosBaseInstance(authToken).post(
      "/api/transaction/onramp",
      {
        cryptoCurrency,
        fiatCurrency,
        amount,
        walletAddress,
      }
    );

    console.log(res);

    // if (!res.data) {
    //   throw new Error("An error occured");
    // }

    return res.data;
  } catch (error) {
    throw new Error(error);
  }
};

export const offramp = async (
  authToken,
  cryptoCurrency,
  fiatCurrency,
  amount
) => {
  try {
    const res = await axiosBaseInstance(authToken).post(
      "/api/transaction/offramp",
      { cryptoCurrency, fiatCurrency, amount }
    );

    if (!res.data) {
      throw new Error("An error occured");
    }

    return res.data;
  } catch (error) {
    throw new Error(error);
  }
};

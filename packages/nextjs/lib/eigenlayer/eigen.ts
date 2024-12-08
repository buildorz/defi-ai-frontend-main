import { getFromLocalStorage } from "../../utils/helper";
import delegationManagerContractABI from "./abi/delegationManagerABI.json";
import strategyManagerContractABI from "./abi/strategyManagerABI.json";
import { ethers } from "ethers";
import { Contract, ContractTransaction } from "ethers";

// Define interfaces
interface StakeAndDelegateParams {
  tokenContractAddress: string;
  data: {
    to: string;
    data: string;
  };
  txData: string;
  strategy: string;
  amount: string;
}

interface StakeAndDelegateResponse {
  success: boolean;
  message: string;
  tx?: ethers.TransactionResponse;
}

// Define constants
const erc20Abi: string[] = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function balanceOf(address account) external view returns (uint256)",
];

const strategyManagerContractAddress = "0x858646372CC42E1A627fcE94aa7A7033e7CF075A";
const delegationManagerContractAddress = "0x39053D51B77DC0d36036Fc1fCc8Cb819df8Ef37A";

// const operatorAddress = "0x3eab8764e3303efb09481266e9558eded1d96984";

const operatorAddress = "0xcaaeb411241ac87b5846797c15bf339a54a1d736";

const stakeFn = async (signer: ethers.Signer, strategy: string, tokenContractAddress: string, amount: string) => {
  try {
    const strategyManagerContract = new ethers.Contract(
      strategyManagerContractAddress,
      strategyManagerContractABI,
      signer,
    );

    const tx = await strategyManagerContract.depositIntoStrategy(strategy, tokenContractAddress, amount);
    return tx;
  } catch (error) {}
};

//  const txData = strategyManagerInterface.encodeFunctionData(
//       "depositIntoStrategy",
//       [strategyAddress[tokenContractAddress], tokenContractAddress, amountInWei]
//     );

// Convert functions with type annotations
const approveToken = async (tokenContract: Contract, spender: string, amount: string | number): Promise<boolean> => {
  try {
    console.log("Approve Spender: ", spender);
    const approveTx = await tokenContract.approve(spender, amount);
    await approveTx.wait();
    console.log("Token approved to Strategy MAnager Contract.");
    return true;
  } catch (error) {
    console.error("Approve Token Error: ", error);
    throw error;
  }
};

const getAllowance = async (tokenContract: Contract, owner: string, spender: string): Promise<string> => {
  try {
    console.log("Token Contract: ", tokenContract);
    console.log("Owner: ", owner);
    console.log("Spender: ", spender);
    const allowance = await tokenContract.allowance(owner, spender);
    return allowance;
  } catch (error) {
    console.error("Error checking allowance: ", error);
    throw error;
  }
};

const delegateToOperator = async (signer: ethers.Signer): Promise<ContractTransaction | false> => {
  try {
    const delegationManagerContract = new ethers.Contract(
      delegationManagerContractAddress,
      delegationManagerContractABI,
      signer,
    );
    // Execute transaction with gas limit
    const tx = await delegationManagerContract.delegateTo(operatorAddress);
    return tx;
  } catch (error) {
    console.error("delegateToOperator error", error);
    return false;
  }
};

const stakeAndDelegate = async ({
  tokenContractAddress,
  amount,
  strategy,
}: StakeAndDelegateParams): Promise<StakeAndDelegateResponse | undefined> => {
  try {
    if (typeof window.ethereum !== "undefined") {
      const userDetails = getFromLocalStorage("userDetails");

      if (!userDetails) {
        throw new Error("Kindly login first to proceed");
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const tokenContract = new ethers.Contract(tokenContractAddress, erc20Abi, signer);

      const tokenBalance = await tokenContract.balanceOf(signer.address);
      if (tokenBalance < amount) {
        return {
          success: false,
          message: `Insufficient balance`,
        };
      }

      const allowance = await getAllowance(tokenContract, signer.address, strategyManagerContractAddress);
      if (allowance < amount) {
        const tokenApproval = await approveToken(tokenContract, strategyManagerContractAddress, amount);
        if (!tokenApproval) {
          return {
            success: false,
            message: `Approval Failed`,
          };
        }
      }

      //   staking
      const stakedTx = await stakeFn(signer, strategy, tokenContractAddress, amount);

      if (!stakedTx) {
        return {
          success: false,
          message: `Stake failed`,
        };
      }
      // console.log("tx", stakedTx);

      //   delegation
      // const delegatorTx = await delegateToOperator(signer);

      // if (!delegatorTx) {
      //   return {
      //     success: false,
      //     message: `Delegation failed`,
      //   };
      // }

      return {
        success: true,
        message: `Transaction sent, you can monitor it [here](https://etherscan.io/tx/${stakedTx.hash}).`,
        tx: stakedTx,
      };
    }
  } catch (error) {
    console.log("stake and Delegate Error", error);
    return {
      success: false,
      message: "Stake and delegate failed",
    };
  }
};

export { approveToken, getAllowance, delegateToOperator, stakeAndDelegate };

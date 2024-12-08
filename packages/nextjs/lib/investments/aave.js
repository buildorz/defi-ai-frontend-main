import tokenAbi from "./USDTtoken.json";
import LendingPoolAddressesProviderABI from "./LendingPoolAddressesProvider.json";
import { baseHelper } from "../../utils/helper";
import { ethers } from "ethers";

const assets = {
    USDC: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    USDT: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
};

const LendingPoolABI = [
    "function supply(address asset, uint256 amount, address onBehalfOf, uint16 referralCode) external",
];

const referralCode = 0;

const approveToken = async (tokenContract, spender, amount) => {
    try {
        console.log("Appprove Spender: ", spender);

        const approveTx = await tokenContract.approve(spender, amount);
        await approveTx.wait();
        console.log("Token approved to Lending Contract.");
        return true;
    } catch (error) {
        console.error("Approve Token Error: ", error);
        throw error;
    }
};

const getAllowance = async (tokenContract, owner, spender) => {
    try {
        console.log("Token Contract: ", tokenContract);
        console.log("Owner: ", owner);
        console.log("Spender: ", spender);
        const allowance = await tokenContract.allowance(owner, spender);
        return ethers.formatUnits(allowance, 6);
    } catch (error) {
        console.error("Error checking allowance: ", error);
        throw error;
    }
};
const resetAllowance = async (tokenContract, lpCoreAddress) => {
    try {
        const resetApproveTx = await tokenContract.approve(lpCoreAddress, 0);
        await resetApproveTx.wait();
        console.log("Token allowance reset to 0.");
        return true;
    } catch (error) {
        console.error("Reset Allowance Error: ", error);
        return false;
    }
};
export async function depositToAave({ lpCoreAddress, amountInWei, lpContract, token, amount }) {
    try {
        if (typeof window.ethereum !== 'undefined') {
            const userDetails = baseHelper.getFromLocalStorage('userDetails');

            if (!userDetails) {
                throw new Error('Kindly login first to proceed');
            }
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();

            const tokenAddress = assets[token.toUpperCase()];
            const userAddress = await signer.getAddress();

            if (!tokenAddress) {
                return {
                    status: false,
                    message: "error unsupported token",
                };
            }
            const tokenContract = new ethers.Contract(tokenAddress, tokenAbi, signer);
            const allowance = await getAllowance(
                tokenContract,
                userAddress,
                lpCoreAddress
            );

            if (amountInWei >= allowance) {
                await resetAllowance(tokenContract, lpCoreAddress);
            }
            const usdtAllowanceAmountInWei = ethers.parseUnits(
                (amount + 1).toString(),
                6
            );
            const tokenApproved = await approveToken(tokenContract, lpCoreAddress, usdtAllowanceAmountInWei);
            if (!tokenApproved) {
                return {
                    status: false,
                    message: "error approving token",
                };
            }

            const lpContract = new ethers.Contract(
                lpCoreAddress,
                LendingPoolABI,
                signer
            );

            const depositTx = await lpContract.supply(
                tokenAddress,
                amountInWei,
                userAddress,
                referralCode
            );
            await depositTx.wait();
            const { hash } = depositTx;
            return {
                success: true,
                message: `You have Successfully Invested ${amount} ${token} in Aave\n Transaction Hash: https://etherscan.io/tx/${hash}\nReply "Show my Portfolio " to see your investments`,
                tx: hash,
            };
        }
    } catch (error) {
        console.log(error);
        return {
            success: false,
            message:
                "An error occurred while trying to invest in Lido. Please try again later.",
        };
    }
}
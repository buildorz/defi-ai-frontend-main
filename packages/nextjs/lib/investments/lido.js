import { ethers } from 'ethers';
import {
    LidoSDK, LidoSDKCore,
    TransactionCallbackStage,
    SDKError,
} from '@lidofinance/lido-ethereum-sdk';
import { baseHelper } from '../../utils/helper';


export async function stakeEthToLido(value, token, blockchain) {
    try {
        if (typeof window.ethereum !== 'undefined') {
            const userDetails = baseHelper.getFromLocalStorage('userDetails');

            if (!userDetails) {
                throw new Error('Kindly login first to proceed');
            }
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            console.log("stakeEthToLido", value);

            const userAddress = await signer.getAddress();
            // Get from FrontEnd
            // const wallet = await getSigner(userId);

            const config = {
                chainId: 1,
                rpcUrls: ['https://eth-mainnet.g.alchemy.com/v2/fjPUumRgHEyLj_Dgdfww-H4JHbO6il3D'],
                web3provider: LidoSDKCore.createWeb3Provider(1, window.ethereum),
            };

            const lidoSDK = new LidoSDK({
                rpcUrls: ['https://eth-mainnet.g.alchemy.com/v2/fjPUumRgHEyLj_Dgdfww-H4JHbO6il3D'],
                chainId: 1,
                web3Provider: LidoSDKCore.createWeb3Provider(1, window.ethereum),
            });

            const callback = ({ stage, payload }) => {
                switch (stage) {
                    case TransactionCallbackStage.SIGN:
                        console.log('wait for sign');
                        break;
                    case TransactionCallbackStage.RECEIPT:
                        console.log('wait for receipt');
                        console.log(payload, 'transaction hash');
                        break;
                    case TransactionCallbackStage.CONFIRMATION:
                        console.log('wait for confirmation');
                        console.log(payload, 'transaction receipt');
                        break;
                    case TransactionCallbackStage.DONE:
                        console.log('done');
                        console.log(payload, 'transaction confirmations');
                        break;
                    case TransactionCallbackStage.ERROR:
                        console.log('error');
                        console.log(payload, 'error object with code and message');
                        break;
                    default:
                }
            };

            // Calls
            const stakeTx = await lidoSDK.stake.stakeEth({
                value: value,
                referralAddress: userAddress,
            });

            console.log("stake result", stakeTx);


            return {
                success: true,
                message: `Transaction sent, you can monitor it [here](https://etherscan.io/tx/${stakeTx.hash}).`,
                hash: stakeTx.hash,

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

export async function completeInvestInLido(amount, token, blockchain) {
    try {

        if (typeof window.ethereum !== 'undefined') {
            const userDetails = baseHelper.getFromLocalStorage('userDetails');

            if (!userDetails) {
                throw new Error('Kindly login first to proceed');
            }

            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();

            if (["eth", "ethereum"].includes(blockchain.toLowerCase())) {
                const userAddress = await signer.getAddress();


                const userBalance = await provider.getBalance(userAddress);
                const formattedAmount = ethers.parseEther(amount.toString());

                if (formattedAmount > userBalance) {
                    return {
                        success: false,
                        message: `You do not have enough ETH. Your balance is ${ethers.formatEther(
                            userBalance.toString()
                        )} while you're attempting to invest ${amount} ETH`,
                    };
                }
                const { hash } = await stakeEthToLido(formattedAmount);

                if (!hash) {
                    return {
                        success: false,
                        message:
                            "An error occurred while trying to invest in Lido. Please try again later.",
                    };
                }

                const etherscanUrl = `https://etherscan.io/tx/${hash}`;
                const message = `🎉 Congratulations! Your investment of ${amount} ETH in Lido has been successfully completed.\n🔍 View Your Transaction:\nYou can track your transaction on the Ethereum blockchain by clicking this link:${etherscanUrl}\n
📚 Next Steps:\n
• To view your stETH Rewards, simply type 'Show Lido rewards'.\n
• To view your Entire portfolio, simply type 'Show my portfolio'.\n
• Learn more about Lido staking at https://lido.fi/.
                    `;

                return {
                    success: true,
                    message,
                    tx: hash,
                };
            }
        } else {
            return {
                success: false,
                message:
                    "An error occurred while trying to invest in Lido. Invalid blockchain.",
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
import { ethers } from 'ethers';
import { getWalletByShortUuid } from '../config/uuid2wallet';

/**
 * 使用 shortUuid 獲取錢包實例進行交易簽名
 * 
 * @param {string} shortUuid - 用戶的短 UUID
 * @param {object} provider - ethers provider 實例
 * @returns {ethers.Wallet|null} 錢包實例或 null
 */
export const getWalletForSigning = (shortUuid, provider) => {
  try {
    const walletData = getWalletByShortUuid(shortUuid);
    
    if (!walletData || !walletData.privateKey) {
      console.error(`No wallet found for shortUuid: ${shortUuid}`);
      return null;
    }

    // 使用私鑰創建錢包實例
    const wallet = new ethers.Wallet(walletData.privateKey, provider);
    
    // 驗證地址是否匹配
    if (wallet.address.toLowerCase() !== walletData.address.toLowerCase()) {
      console.error('Wallet address mismatch!');
      return null;
    }

    return wallet;
  } catch (error) {
    console.error('Error creating wallet for signing:', error);
    return null;
  }
};

/**
 * 使用 shortUuid 簽名交易
 * 
 * @param {string} shortUuid - 用戶的短 UUID
 * @param {object} transaction - 交易對象
 * @param {object} provider - ethers provider 實例
 * @returns {Promise<string>} 交易 hash
 */
export const signAndSendTransaction = async (shortUuid, transaction, provider) => {
  try {
    const wallet = getWalletForSigning(shortUuid, provider);
    
    if (!wallet) {
      throw new Error('Unable to create wallet for signing');
    }

    console.log('Signing transaction with wallet:', wallet.address);
    
    // 發送交易
    const tx = await wallet.sendTransaction(transaction);
    console.log('Transaction sent:', tx.hash);
    
    return tx;
  } catch (error) {
    console.error('Error signing and sending transaction:', error);
    throw error;
  }
};

/**
 * 使用 shortUuid 簽名消息
 * 
 * @param {string} shortUuid - 用戶的短 UUID
 * @param {string} message - 要簽名的消息
 * @param {object} provider - ethers provider 實例
 * @returns {Promise<string>} 簽名結果
 */
export const signMessage = async (shortUuid, message, provider) => {
  try {
    const wallet = getWalletForSigning(shortUuid, provider);
    
    if (!wallet) {
      throw new Error('Unable to create wallet for signing');
    }

    const signature = await wallet.signMessage(message);
    console.log('Message signed successfully');
    
    return signature;
  } catch (error) {
    console.error('Error signing message:', error);
    throw error;
  }
};

/**
 * 使用 shortUuid 調用合約方法
 * 
 * @param {string} shortUuid - 用戶的短 UUID
 * @param {object} contract - ethers 合約實例
 * @param {string} methodName - 合約方法名稱
 * @param {array} args - 方法參數
 * @param {object} provider - ethers provider 實例
 * @returns {Promise<object>} 交易結果
 */
export const callContractMethod = async (shortUuid, contract, methodName, args = [], provider) => {
  try {
    const wallet = getWalletForSigning(shortUuid, provider);
    
    if (!wallet) {
      throw new Error('Unable to create wallet for signing');
    }

    // 將合約連接到錢包
    const contractWithSigner = contract.connect(wallet);
    
    console.log(`Calling ${methodName} with wallet:`, wallet.address);
    
    // 調用合約方法
    const tx = await contractWithSigner[methodName](...args);
    console.log('Transaction sent:', tx.hash);
    
    // 等待確認
    const receipt = await tx.wait();
    console.log('Transaction confirmed in block:', receipt.blockNumber);
    
    return { tx, receipt };
  } catch (error) {
    console.error(`Error calling contract method ${methodName}:`, error);
    throw error;
  }
};

/**
 * 驗證 shortUuid 是否有對應的錢包
 * 
 * @param {string} shortUuid - 用戶的短 UUID
 * @returns {boolean} 是否存在對應的錢包
 */
export const hasWallet = (shortUuid) => {
  const walletData = getWalletByShortUuid(shortUuid);
  return walletData !== null && walletData.privateKey !== undefined;
};

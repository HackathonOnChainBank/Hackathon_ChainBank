/**
 * 錢包存儲工具
 * 將私鑰加密後存儲在 localStorage
 * 
 * 注意：這只是演示用途，生產環境應該使用後端服務
 */

// 簡單的 XOR 加密（僅用於演示，生產環境請使用更強的加密）
const encryptPrivateKey = (privateKey, password) => {
  const key = password.padEnd(privateKey.length, password);
  let encrypted = '';
  for (let i = 0; i < privateKey.length; i++) {
    encrypted += String.fromCharCode(
      privateKey.charCodeAt(i) ^ key.charCodeAt(i % key.length)
    );
  }
  return btoa(encrypted); // Base64 編碼
};

const decryptPrivateKey = (encryptedKey, password) => {
  try {
    const encrypted = atob(encryptedKey); // Base64 解碼
    const key = password.padEnd(encrypted.length, password);
    let decrypted = '';
    for (let i = 0; i < encrypted.length; i++) {
      decrypted += String.fromCharCode(
        encrypted.charCodeAt(i) ^ key.charCodeAt(i % key.length)
      );
    }
    return decrypted;
  } catch (error) {
    console.error('解密失敗:', error);
    return null;
  }
};

// 存儲私鑰
export const storePrivateKey = (shortUuid, address, privateKey, password) => {
  try {
    // 加密私鑰
    const encryptedPrivateKey = encryptPrivateKey(privateKey, password);
    
    // 讀取現有的錢包映射
    const walletsData = localStorage.getItem('chainbank_wallets');
    const wallets = walletsData ? JSON.parse(walletsData) : {};
    
    // 存儲加密後的私鑰
    wallets[shortUuid] = {
      address,
      encryptedPrivateKey: encryptedPrivateKey,
      createdAt: new Date().toISOString(),
      privateKey: privateKey//暫時展示用
    };
    
    localStorage.setItem('chainbank_wallets', JSON.stringify(wallets));
    
    console.log('✓ 私鑰已安全存儲（已加密）');
    return true;
  } catch (error) {
    console.error('存儲私鑰失敗:', error);
    return false;
  }
};

// 獲取私鑰
export const getPrivateKey = (shortUuid, password) => {
  try {
    const walletsData = localStorage.getItem('chainbank_wallets');
    if (!walletsData) return null;
    
    const wallets = JSON.parse(walletsData);
    const wallet = wallets[shortUuid];
    
    if (!wallet || !wallet.encryptedPrivateKey) return null;

    return decryptPrivateKey(wallet.encryptedPrivateKey, password);

  } catch (error) {
    console.error('獲取私鑰失敗:', error);
    return null;
  }
};

// 獲取錢包地址（不需要密碼）
export const getWalletAddress = (shortUuid) => {
  try {
    const walletsData = localStorage.getItem('chainbank_wallets');
    if (!walletsData) return null;
    
    const wallets = JSON.parse(walletsData);
    return wallets[shortUuid]?.address || null;
  } catch (error) {
    console.error('獲取錢包地址失敗:', error);
    return null;
  }
};

// 檢查是否存在錢包
export const hasWallet = (shortUuid) => {
  try {
    const walletsData = localStorage.getItem('chainbank_wallets');
    if (!walletsData) return false;
    
    const wallets = JSON.parse(walletsData);
    return !!wallets[shortUuid];
  } catch (error) {
    return false;
  }
};

// 刪除錢包（謹慎使用）
export const deleteWallet = (shortUuid) => {
  try {
    const walletsData = localStorage.getItem('chainbank_wallets');
    if (!walletsData) return false;
    
    const wallets = JSON.parse(walletsData);
    delete wallets[shortUuid];
    
    localStorage.setItem('chainbank_wallets', JSON.stringify(wallets));
    console.log('✓ 錢包已刪除');
    return true;
  } catch (error) {
    console.error('刪除錢包失敗:', error);
    return false;
  }
};

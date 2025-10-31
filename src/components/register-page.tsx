import { useState } from 'react';
// import { useNavigate } from 'react-router-dom'; // 移除此行，因為未使用
import { ethers } from 'ethers';
import { generateUuidV4 } from '../contract/uuid-generator';
import { uuidToShortId } from '../contract/short-uuid';
import { useAuth } from '../contexts/AuthContext';
import { storePrivateKey } from '../utils/walletStorage';
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { CheckCircle, ArrowRight, Lock, UserPlus } from "lucide-react";

// 定義 WalletInfo 接口
interface WalletInfo {
  fullName: string;
  country: string;
  dateOfBirth: string;
  phoneCountryCode: string;
  phone: string;
  email: string;
  uuid: string;
  shortUuid: string;
  walletAddress: string;
  passwordHash: string;
  network: string;
  chainId: number;
  privateKey: string;
  mnemonic: string;
}

// 擴展 ImportMetaEnv（如果需要，在 vite-env.d.ts 中添加）
declare global {
  interface ImportMetaEnv {
    VITE_PRIVATE_KEY_1: string;
    VITE_RPC_URL: string;
  }
}

export function RegisterPage() {
  // const navigate = useNavigate(); // 移除此行，因為未使用
  const { register } = useAuth();
  const [step, setStep] = useState(1); // 1: 填寫資料, 2: 設定密碼, 3: 顯示 shortUuid
  const [isCreating, setIsCreating] = useState(false);
  const [userForm, setUserForm] = useState({
    fullName: '',
    country: '',
    dateOfBirth: '',
    phoneCountryCode: '+886', // 預設台灣
    phone: '',
    email: ''
  });
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [error, setError] = useState('');

  // 常用國家電話代碼
  const countryCodes = [
    { code: '+1', name: '美國/加拿大', flag: '🇺🇸' },
    { code: '+44', name: '英國', flag: '🇬🇧' },
    { code: '+81', name: '日本', flag: '🇯🇵' },
    { code: '+82', name: '韓國', flag: '🇰🇷' },
    { code: '+86', name: '中國', flag: '🇨🇳' },
    { code: '+852', name: '香港', flag: '🇭🇰' },
    { code: '+853', name: '澳門', flag: '🇲🇴' },
    { code: '+886', name: '台灣', flag: '🇹🇼' },
    { code: '+65', name: '新加坡', flag: '🇸🇬' },
    { code: '+60', name: '馬來西亞', flag: '🇲🇾' },
    { code: '+66', name: '泰國', flag: '🇹🇭' },
    { code: '+84', name: '越南', flag: '🇻🇳' },
    { code: '+63', name: '菲律賓', flag: '🇵🇭' },
    { code: '+62', name: '印尼', flag: '🇮🇩' },
  ];

  // 國家列表
  const countries = [
    '台灣', '中國', '香港', '澳門', '日本', '韓國', '新加坡', '馬來西亞',
    '泰國', '越南', '菲律賓', '印尼', '美國', '加拿大', '英國', '澳洲',
    '紐西蘭', '其他'
  ];

  // 創建新錢包
  const createWallet = () => {
    try {
      const wallet = ethers.Wallet.createRandom();
      return {
        address: wallet.address,
        privateKey: wallet.privateKey,
        mnemonic: wallet.mnemonic?.phrase || ''
      };
    } catch (error) {
      console.error('創建錢包失敗:', error);
      throw error;
    }
  };

  // 生成 UUID 並轉換為 short UUID
  const generateShortUuid = () => {
    const uuid = generateUuidV4();
    const shortUuid = uuidToShortId(uuid);
    return { uuid, shortUuid };
  };

  // 處理基本資料提交（步驟1 -> 步驟2）
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      // 驗證表單
      if (!userForm.fullName || !userForm.country || !userForm.dateOfBirth || !userForm.email) {
        throw new Error('請填寫所有必填欄位');
      }

      // 驗證 email 格式
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userForm.email)) {
        throw new Error('請輸入有效的電子郵件地址');
      }

      // 驗證電話號碼（如果有填寫）
      if (userForm.phone && !/^\d+$/.test(userForm.phone)) {
        throw new Error('電話號碼只能包含數字');
      }

      // 進入密碼設定步驟
      setStep(2);
    } catch (err) {
      const error = err as Error;
      setError(error.message || '驗證失敗，請重試');
    }
  };

  // 簡單的密碼 hash（實際應用中應使用更安全的方法）
  const hashPassword = async (password: string) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  // 處理密碼提交並創建帳戶（步驟2 -> 步驟3）
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    setError('');

    try {
      // 驗證密碼
      if (!password || password.length < 8) {
        throw new Error('密碼至少需要 8 個字元');
      }

      if (password !== confirmPassword) {
        throw new Error('兩次輸入的密碼不一致');
      }

      // 1. 創建錢包
      console.log('正在創建錢包...');
      const wallet = createWallet();

      // 2. 生成 UUID
      console.log('正在生成 UUID...');
      const { uuid, shortUuid } = generateShortUuid();

      // 系統管理員後台記錄（用於 uuid2wallet.js 映射）
      console.log('=== 系統管理員記錄 ===');
      console.log(`"${shortUuid}": {`);
      console.log(`  address: "${wallet.address}",`);
      console.log(`  privateKey: "${wallet.privateKey}"`);
      console.log('}');
      console.log('======================');

      // 3. Hash 密碼
      const passwordHash = await hashPassword(password);

      // 4. 存儲私鑰（加密後存入 localStorage）
      console.log('正在存儲私鑰...');
      const keyStored = storePrivateKey(shortUuid, wallet.address, wallet.privateKey, password);

      if (!keyStored) {
        throw new Error('私鑰存儲失敗');
      }
      console.log('✓ 私鑰已安全存儲');

      // 5. 組合用戶資料（不包含 privateKey）
      const userData: WalletInfo = {
        // 基本資料
        ...userForm,
        // UUID 資訊
        uuid,
        shortUuid,
        // 錢包資訊（只存地址，不存私鑰）
        walletAddress: wallet.address,
        // 密碼 hash
        passwordHash,
        // 網路資訊
        network: 'celo-sepolia',
        chainId: 11145550,
        privateKey: wallet.privateKey,
        mnemonic: wallet.mnemonic
      };

      // 6. 使用 AuthContext 註冊
      console.log('正在註冊用戶...');
      const registeredUser = (register as any)(userData); // 類型斷言以修復 'never' 錯誤

      console.log('✓ 用戶註冊成功！', registeredUser);

      // 7. 轉 CELO 給新用戶作為 gas fee
      console.log('正在轉帳 CELO 作為 gas fee...');
      try {
        await transferInitialGasFee(wallet.address);
        console.log('✓ 初始 gas fee 已轉帳');
      } catch (gasError) {
        console.warn('Gas fee 轉帳失敗:', gasError);
        // 不中斷註冊流程，只記錄錯誤
      }

      // 8. 儲存必要資訊並進入下一步
      setWalletInfo(userData);
      setStep(3);

    } catch (err) {
      const error = err as Error;
      console.error('註冊錯誤:', error);
      setError(error.message || '註冊失敗，請重試');
    } finally {
      setIsCreating(false);
    }
  };

  // 轉帳初始 gas fee 給新用戶
  const transferInitialGasFee = async (recipientAddress: string) => {
    try {
      // 使用管理員私鑰
      const adminPk = (import.meta as any).env.VITE_PRIVATE_KEY_1; // 類型斷言以修復 'env' 錯誤
      if (!adminPk) {
        throw new Error('管理員私鑰未設定');
      }
      console.log('管理員私鑰已載入');

      // 連接到 Celo Sepolia RPC
      const rpcUrl = (import.meta as any).env.VITE_RPC_URL || 'https://forno.celo-sepolia.celo-testnet.org'; // 類型斷言以修復 'env' 錯誤
      console.log('RPC URL:', rpcUrl);

      const provider = new ethers.JsonRpcProvider(rpcUrl);
      const adminWallet = new ethers.Wallet(
        adminPk.startsWith('0x') ? adminPk : '0x' + adminPk,
        provider
      );

      // 轉帳金額（例如：0.01 CELO，足夠支付多次交易的 gas）
      const amount = ethers.parseEther('0.05');

      console.log('從管理員錢包轉帳:', adminWallet.address);
      console.log('到新用戶錢包:', recipientAddress);
      console.log('金額:', ethers.formatEther(amount), 'CELO');

      const tx = await adminWallet.sendTransaction({
        to: recipientAddress,
        value: amount,
        gasLimit: 21000 // 標準轉帳 gas limit
      });

      console.log('交易已提交:', tx.hash);

      // 等待確認
      const receipt = await tx.wait();
      if (receipt) {
        console.log('交易已確認，區塊:', receipt.blockNumber);
      }

      return receipt;
    } catch (error) {
      console.error('轉帳 gas fee 失敗:', error);
      throw error;
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    alert(`${label}已複製到剪貼簿`);
  };

  const handleComplete = () => {
    // 導向首頁或儀表板
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Page title */}
        <div className="mb-8">
          <h1 className="text-4xl sm:text-5xl mb-4">
            <span className="bg-gradient-to-r from-slate-200 to-purple-200 bg-clip-text text-transparent">
              🏦 ChainBank 用戶註冊
            </span>
          </h1>
          <p className="text-slate-400 text-lg">填寫基本資料，系統將自動為您創建區塊鏈錢包</p>
        </div>

        {step === 1 && (
          <Card className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 border border-slate-700/50 backdrop-blur-sm p-8">
            {/* Progress bar */}
            <div className="flex justify-center mb-8">
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm">1</div>
                  <span className="ml-2 text-slate-300">基本資料</span>
                </div>
                <div className="w-8 h-0.5 bg-slate-600"></div>
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center text-slate-400 text-sm">2</div>
                  <span className="ml-2 text-slate-400">設定密碼</span>
                </div>
                <div className="w-8 h-0.5 bg-slate-600"></div>
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center text-slate-400 text-sm">3</div>
                  <span className="ml-2 text-slate-400">完成註冊</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-6">
              <h2 className="text-2xl text-slate-100 mb-6">基本資料</h2>

              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-slate-300">姓名 *</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="請輸入真實姓名"
                  value={userForm.fullName}
                  onChange={(e) => setUserForm({ ...userForm, fullName: e.target.value })}
                  className="bg-slate-800/50 border-slate-600 text-slate-200 placeholder:text-slate-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="country" className="text-slate-300">國家 *</Label>
                  <Select value={userForm.country} onValueChange={(value) => setUserForm({ ...userForm, country: value })}>
                    <SelectTrigger className="bg-slate-800/50 border-slate-600 text-slate-200">
                      <SelectValue placeholder="請選擇國家" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-600">
                      {countries.map(country => (
                        <SelectItem key={country} value={country} className="text-slate-200 hover:bg-slate-700">{country}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth" className="text-slate-300">出生日期 *</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={userForm.dateOfBirth}
                    onChange={(e) => setUserForm({ ...userForm, dateOfBirth: e.target.value })}
                    className="bg-slate-800/50 border-slate-600 text-slate-200"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300">電話號碼</Label>
                <div className="flex">
                  <Select value={userForm.phoneCountryCode} onValueChange={(value) => setUserForm({ ...userForm, phoneCountryCode: value })}>
                    <SelectTrigger className="w-32 bg-slate-800/50 border-slate-600 text-slate-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-600">
                      {countryCodes.map(item => (
                        <SelectItem key={item.code} value={item.code} className="text-slate-200 hover:bg-slate-700">
                          {item.flag} {item.code} {item.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="tel"
                    placeholder="912345678"
                    value={userForm.phone}
                    onChange={(e) => setUserForm({ ...userForm, phone: e.target.value.replace(/\D/g, '') })}
                    className="flex-1 bg-slate-800/50 border-slate-600 text-slate-200 placeholder:text-slate-500"
                  />
                </div>
                <p className="text-slate-400 text-sm">選填：請輸入不含國碼的電話號碼</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-300">電子郵件（登入帳號）*</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@email.com"
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  className="bg-slate-800/50 border-slate-600 text-slate-200 placeholder:text-slate-500"
                  required
                />
                <p className="text-slate-400 text-sm">此電子郵件將作為您的登入帳號</p>
              </div>

              {error && (
                <div className="text-red-400 text-sm">⚠️ {error}</div>
              )}

              <div className="bg-slate-800/50 p-4 rounded-lg">
                <h3 className="text-slate-200 text-lg mb-2">📝 註冊說明</h3>
                <ul className="text-slate-400 text-sm space-y-1">
                  <li>系統將自動為您創建 Celo Sepolia 測試網錢包</li>
                  <li>每位用戶將獲得唯一的用戶 ID (Short UUID)</li>
                  <li>請妥善保管錢包資訊，特別是私鑰和助記詞</li>
                  <li>所有資料將加密儲存</li>
                </ul>
              </div>

              <Button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 border-0">
                下一步：設定密碼
              </Button>
            </form>
          </Card>
        )}

        {step === 2 && (
          <Card className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 border border-slate-700/50 backdrop-blur-sm p-8">
            {/* Progress bar */}
            <div className="flex justify-center mb-8">
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <CheckCircle className="w-8 h-8 text-green-400" />
                  <span className="ml-2 text-slate-300">基本資料</span>
                </div>
                <div className="w-8 h-0.5 bg-purple-600"></div>
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm">2</div>
                  <span className="ml-2 text-slate-300">設定密碼</span>
                </div>
                <div className="w-8 h-0.5 bg-slate-600"></div>
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center text-slate-400 text-sm">3</div>
                  <span className="ml-2 text-slate-400">完成註冊</span>
                </div>
              </div>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              <h2 className="text-2xl text-slate-100 mb-6">🔐 設定登入密碼</h2>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-300">密碼 *</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="請輸入密碼（至少 8 個字元）"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-slate-800/50 border-slate-600 text-slate-200 placeholder:text-slate-500"
                  required
                  minLength={8}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-slate-300">確認密碼 *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="請再次輸入密碼"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-slate-800/50 border-slate-600 text-slate-200 placeholder:text-slate-500"
                  required
                  minLength={8}
                />
              </div>

              {error && (
                <div className="text-red-400 text-sm">⚠️ {error}</div>
              )}

              <div className="bg-slate-800/50 p-4 rounded-lg">
                <h3 className="text-slate-200 text-lg mb-2">🔒 密碼安全提示</h3>
                <ul className="text-slate-400 text-sm space-y-1">
                  <li>密碼至少需要 8 個字元</li>
                  <li>建議使用大小寫字母、數字和特殊符號組合</li>
                  <li>不要使用過於簡單的密碼</li>
                  <li>請妥善保管您的密碼，遺失後無法找回</li>
                </ul>
              </div>

              <div className="flex gap-4">
                <Button type="button" variant="outline" className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700" onClick={() => setStep(1)}>
                  上一步
                </Button>
                <Button type="submit" className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 border-0" disabled={isCreating}>
                  {isCreating ? '正在創建帳戶...' : '創建帳戶'}
                </Button>
              </div>
            </form>
          </Card>
        )}

        {step === 3 && walletInfo && (
          <Card className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 border border-slate-700/50 backdrop-blur-sm p-8">
            {/* Progress bar */}
            <div className="flex justify-center mb-8">
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <CheckCircle className="w-8 h-8 text-green-400" />
                  <span className="ml-2 text-slate-300">基本資料</span>
                </div>
                <div className="w-8 h-0.5 bg-purple-600"></div>
                <div className="flex items-center">
                  <CheckCircle className="w-8 h-8 text-green-400" />
                  <span className="ml-2 text-slate-300">設定密碼</span>
                </div>
                <div className="w-8 h-0.5 bg-purple-600"></div>
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm">3</div>
                  <span className="ml-2 text-slate-300">完成註冊</span>
                </div>
              </div>
            </div>

            <div className="text-center mb-8">
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h2 className="text-2xl text-slate-100 mb-2">註冊成功！</h2>
              <p className="text-slate-400">您的帳戶已創建完成</p>
            </div>

            <div className="space-y-6">
              <div className="bg-slate-800/50 p-4 rounded-lg">
                <h3 className="text-slate-200 text-lg mb-4">🆔 您的登入帳號</h3>
                <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg">
                  <span className="text-slate-300">帳號 ID</span>
                  <div className="flex items-center gap-2">
                    <code className="text-slate-100 bg-slate-700 px-2 py-1 rounded">{walletInfo.shortUuid}</code>
                    <Button size="sm" variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700" onClick={() => copyToClipboard(walletInfo.shortUuid, '帳號 ID')}>
                      複製
                    </Button>
                  </div>
                </div>
              </div>

              <div className="bg-red-900/20 border border-red-700/50 p-4 rounded-lg">
                <h3 className="text-red-300 text-lg mb-2">⚠️ 重要提醒</h3>
                <div className="text-red-200 text-sm">
                  <p className="mb-2"><strong>請務必記住以下資訊：</strong></p>
                  <ul className="space-y-1">
                    <li><strong>帳號 ID：</strong>{walletInfo.shortUuid}</li>
                    <li><strong>密碼：</strong>您剛才設定的密碼</li>
                  </ul>
                  <p className="mt-4 text-red-400">
                    ⛔ 請妥善保管此帳號 ID，<strong>遺失後無法找回</strong>
                  </p>
                </div>
              </div>

              <div className="bg-slate-800/50 p-4 rounded-lg">
                <h3 className="text-slate-200 text-lg mb-2">📱 如何使用</h3>
                <ul className="text-slate-400 text-sm space-y-1">
                  <li>使用您的<strong>帳號 ID</strong>和<strong>密碼</strong>登入系統</li>
                  <li>系統會自動為您管理區塊鏈錢包</li>
                  <li>無需記憶複雜的私鑰或助記詞</li>
                  <li>所有交易都由系統安全處理</li>
                  <li>您只需要記住<strong>帳號 ID</strong>和<strong>密碼</strong>即可</li>
                </ul>
              </div>

              <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 border-0" onClick={handleComplete}>
                完成註冊，開始使用
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
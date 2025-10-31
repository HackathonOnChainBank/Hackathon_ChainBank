import image_550763c6bd405bb0e462640703893cfcc371a345 from 'figma:asset/550763c6bd405bb0e462640703893cfcc371a345.png';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import { useAuth } from '../contexts/AuthContext';
import { getPrivateKey } from '../utils/walletStorage';
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Lock, QrCode, CheckCircle } from "lucide-react";

export function LoginPage() {
  const navigate = useNavigate();
  const { login, getUserByShortUuid } = useAuth();
  const [shortUuid, setShortUuid] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Hash 密碼（與註冊時相同的方法）
  const hashPassword = async (password: string) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  // 驗證錢包地址格式
  const isValidAddress = (address: string) => {
    try {
      return ethers.isAddress(address);
    } catch {
      return false;
    }
  };

  // 處理登入
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      // 驗證輸入
      if (!shortUuid.trim()) {
        throw new Error('請輸入您的帳號 ID');
      }

      if (!password) {
        throw new Error('請輸入密碼');
      }

      // 查找用戶
      const userData = (getUserByShortUuid as any)(shortUuid.trim()); // 類型斷言以修復 'never' 錯誤

      if (!userData) {
        throw new Error('找不到此帳號，請確認輸入正確或先進行註冊');
      }

      // 驗證密碼
      const passwordHash = await hashPassword(password);
      if (userData.passwordHash !== passwordHash) {
        throw new Error('密碼錯誤');
      }

      // 驗證資料完整性
      if (!userData.walletAddress || !isValidAddress(userData.walletAddress)) {
        throw new Error('錢包資料異常，請聯繫客服');
      }

      // 驗證私鑰可以正確解密
      const privateKey = getPrivateKey(shortUuid.trim(), password);
      if (!privateKey) {
        throw new Error('無法獲取私鑰，請確認密碼是否正確');
      }

      // 使用私鑰創建錢包實例驗證
      const wallet = new ethers.Wallet(privateKey);
      if (wallet.address.toLowerCase() !== userData.walletAddress.toLowerCase()) {
        throw new Error('錢包地址驗證失敗');
      }

      console.log('✓ 錢包已成功載入:', wallet.address);

      // 執行登入
      (login as any)(shortUuid.trim()); // 類型斷言以修復 'never' 錯誤

      // 顯示成功訊息
      setSuccess('登入成功！');

    } catch (err) {
      const error = err as Error;
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Page title */}
        <div className="mb-8">
          <h1 className="text-4xl sm:text-5xl mb-4">
            <span className="bg-gradient-to-r from-slate-200 to-purple-200 bg-clip-text text-transparent">
              🏦 ChainBank 登入
            </span>
          </h1>
          <p className="text-slate-400 text-lg">使用您的帳號 ID 和密碼登入</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Login Card */}
          <Card className="lg:col-span-2 bg-gradient-to-br from-slate-900/80 to-slate-800/80 border border-slate-700/50 backdrop-blur-sm p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20">
                <Lock className="h-6 w-6 text-purple-300" />
              </div>
              <h2 className="text-2xl text-slate-100">登入您的帳戶</h2>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              {/* Account input */}
              <div className="space-y-2">
                <Label htmlFor="shortUuid" className="text-slate-300">帳號 ID *</Label>
                <Input
                  id="shortUuid"
                  type="text"
                  placeholder="請輸入您的帳號 ID"
                  value={shortUuid}
                  onChange={(e) => setShortUuid(e.target.value)}
                  className="bg-slate-800/50 border-slate-600 text-slate-200 placeholder:text-slate-500"
                  required
                  autoFocus
                  disabled={isLoading || !!success}
                />
                <small className="text-slate-400 text-sm">註冊時系統生成的唯一識別碼</small>
              </div>

              {/* Password input */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-300">密碼 *</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="請輸入您的密碼"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-slate-800/50 border-slate-600 text-slate-200 placeholder:text-slate-500"
                  required
                  disabled={isLoading || !!success}
                />
              </div>

              {error && (
                <div className="text-red-400 text-sm">⚠️ {error}</div>
              )}

              {success && (
                <div className="text-center space-y-4">
                  <div className="text-green-400 text-lg flex items-center justify-center gap-2">
                    <CheckCircle className="h-6 w-6" />
                    {success}
                  </div>
                  <Button
                    onClick={() => navigate('/info')}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 border-0"
                    size="lg"
                  >
                    進入資訊頁面
                  </Button>
                </div>
              )}

              {/* Forgot password link */}
              <div className="flex justify-end">
                <a href="#" className="text-purple-400 hover:text-purple-300 text-sm transition-colors">
                  忘記密碼？
                </a>
              </div>

              {/* Login button */}
              {!success && (
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 border-0"
                  size="lg"
                  disabled={isLoading}
                >
                  {isLoading ? '登入中...' : '登入'}
                </Button>
              )}

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-slate-900/80 text-slate-400">或</span>
                </div>
              </div>

              {/* Alternative login info */}
              <div className="text-center text-slate-400 text-sm">
                使用 QR Code 快速登入 →
              </div>
            </form>
          </Card>

          {/* QR Code Card */}
          <Card className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 border border-slate-700/50 backdrop-blur-sm p-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20">
                <QrCode className="h-6 w-6 text-purple-300" />
              </div>
              <h3 className="text-slate-100">掃描 QR Code</h3>
              <p className="text-slate-400 text-sm">使用手機掃描以快速登入</p>
              
              {/* QR Code placeholder */}
              <div className="w-full aspect-square max-w-[200px] rounded-xl overflow-hidden border-2 border-purple-500/30 bg-slate-800">
                <ImageWithFallback
                  src={image_550763c6bd405bb0e462640703893cfcc371a345}
                  alt="QR Code"
                  className="w-full h-full object-cover"
                />
              </div>

              <p className="text-slate-500 text-xs">
                QR Code 每 60 秒更新一次
              </p>
            </div>
          </Card>
        </div>

        {/* Register link */}
        <div className="mt-8 text-center">
          <p className="text-slate-400">還沒有帳戶？</p>
          <Button
            variant="outline"
            className="mt-2 bg-transparent border-slate-700 text-slate-300 hover:bg-white/5"
            onClick={() => navigate('/register')}
            disabled={isLoading || !!success}
          >
            立即註冊
          </Button>
        </div>

        {/* Login tips */}
        <div className="mt-8 bg-slate-800/50 p-4 rounded-lg">
          <h3 className="text-slate-200 text-lg mb-2">💡 無法登入？</h3>
          <ul className="text-slate-400 text-sm space-y-1">
            <li>請確認您輸入的帳號 ID 與註冊時相同</li>
            <li>密碼區分大小寫，請檢查是否正確</li>
            <li>如果您是第一次使用，請先<a href="/register" className="text-purple-400 hover:text-purple-300">註冊新帳戶</a></li>
            <li>忘記帳號 ID 或密碼請聯繫客服協助找回</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
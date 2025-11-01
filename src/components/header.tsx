import { Button } from "./ui/button";
import { Wallet, Menu, ChevronDown } from "lucide-react";
import { useState } from "react";
import { useAuth } from '../contexts/AuthContext';

type HeaderProps = {
  currentPage: string;
  onNavigate: (page: string) => void;
};

export function Header({ currentPage, onNavigate }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showCreditCardMenu, setShowCreditCardMenu] = useState(false);
  const { logout } = useAuth();
  
  const navLinks = [
    { name: "首頁", page: "home" },
    { name: "資訊頁面", page: "info" },
    { name: "災難救助", page: "disaster-relief" },
    { name: "存款", page: "deposit" },
    { name: "一般轉帳", page: "transfer" }
  ];

  const creditCardLinks = [
    { name: "信用卡申請", page: "credit-card-apply" },
    { name: "信用卡消費", page: "credit-card-spending" }
  ];

  const isCreditCardPage = currentPage === "credit-card-apply" || currentPage === "credit-card-spending";
  
  const handleLogout = () => {
    logout();
    onNavigate("login");
  };
  
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button 
            onClick={() => onNavigate("home")}
            className="flex items-center gap-2"
          >
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600">
              <Wallet className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl bg-gradient-to-r from-slate-200 to-purple-200 bg-clip-text text-transparent">
              RWA Bank
            </span>
          </button>
          
          {/* Desktop navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link, index) => (
              <button
                key={index}
                onClick={() => onNavigate(link.page)}
                className={`transition-colors ${
                  currentPage === link.page 
                    ? 'text-purple-400' 
                    : 'text-slate-400 hover:text-purple-300'
                }`}
              >
                {link.name}
              </button>
            ))}
            
            {/* 信用卡服務下拉選單 */}
            <div 
              className="relative"
              onMouseEnter={() => setShowCreditCardMenu(true)}
              onMouseLeave={() => setShowCreditCardMenu(false)}
            >
              <button
                className={`flex items-center gap-1 transition-colors ${
                  isCreditCardPage 
                    ? 'text-purple-400' 
                    : 'text-slate-400 hover:text-purple-300'
                }`}
              >
                信用卡服務
                <ChevronDown className="h-4 w-4" />
              </button>
              
              {showCreditCardMenu && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-slate-900 border border-slate-700 rounded-lg shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  {creditCardLinks.map((link, index) => (
                    <button
                      key={index}
                      onClick={() => onNavigate(link.page)}
                      className={`w-full text-left px-4 py-3 transition-colors border-b border-slate-800 last:border-b-0 ${
                        currentPage === link.page
                          ? 'bg-purple-600/20 text-purple-300'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-purple-300'
                      }`}
                    >
                      {link.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-2">
            <Button 
              variant="outline"
              className="bg-transparent border-slate-700 text-slate-300 hover:bg-white/5"
              onClick={() => onNavigate("login")}
            >
              登入
            </Button>
            <Button 
              variant="outline"
              className="bg-transparent border-slate-700 text-slate-300 hover:bg-white/5"
              onClick={() => onNavigate("register")}
            >
              註冊
            </Button>
            <Button 
              variant="outline"
              className="bg-transparent border-slate-700 text-slate-300 hover:bg-white/5"
              onClick={handleLogout}
            >
              登出
            </Button>
          </div>
          
          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-slate-400 hover:text-slate-200"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
        
        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-800">
            <div className="flex flex-col gap-4">
              {navLinks.map((link, index) => (
                <button
                  key={index}
                  onClick={() => {
                    onNavigate(link.page);
                    setIsMenuOpen(false);
                  }}
                  className={`text-left transition-colors py-2 ${
                    currentPage === link.page 
                      ? 'text-purple-400' 
                      : 'text-slate-400 hover:text-purple-300'
                  }`}
                >
                  {link.name}
                </button>
              ))}
              
              {/* 信用卡服務 */}
              <div className="border-t border-slate-800 pt-4">
                <div className="text-slate-500 text-sm mb-2 px-2">信用卡服務</div>
                {creditCardLinks.map((link, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      onNavigate(link.page);
                      setIsMenuOpen(false);
                    }}
                    className={`w-full text-left transition-colors py-2 pl-4 ${
                      currentPage === link.page 
                        ? 'text-purple-400' 
                        : 'text-slate-400 hover:text-purple-300'
                    }`}
                  >
                    {link.name}
                  </button>
                ))}
              </div>
              
              <div className="pt-4 border-t border-slate-800 flex gap-2">
                <Button 
                  variant="outline"
                  className="flex-1 bg-transparent border-slate-700 text-slate-300 hover:bg-white/5"
                  onClick={() => {
                    onNavigate("login");
                    setIsMenuOpen(false);
                  }}
                >
                  登入
                </Button>
                <Button 
                  variant="outline"
                  className="flex-1 bg-transparent border-slate-700 text-slate-300 hover:bg-white/5"
                  onClick={() => {
                    onNavigate("register");
                    setIsMenuOpen(false);
                  }}
                >
                  註冊
                </Button>
                <Button 
                  variant="outline"
                  className="flex-1 bg-transparent border-slate-700 text-slate-300 hover:bg-white/5"
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                >
                  登出
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
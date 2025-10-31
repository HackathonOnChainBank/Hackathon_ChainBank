import { Button } from "./ui/button";
import { Wallet, Menu } from "lucide-react";
import { useState } from "react";
import { useAuth } from '../contexts/AuthContext';

type HeaderProps = {
  currentPage: string;
  onNavigate: (page: string) => void;
};

export function Header({ currentPage, onNavigate }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { logout } = useAuth();
  
  const navLinks = [
    { name: "首頁", page: "home" },
    { name: "資訊頁面", page: "info" },
    { name: "登入", page: "login" },
    { name: "註冊", page: "register" },
    { name: "災難救助", page: "disaster-relief" },
    { name: "存款", page: "deposit" },
    { name: "一般轉帳", page: "transfer" },
    { name: "信用卡申請", page: "credit-card-apply" },
    { name: "信用卡消費", page: "credit-card-spending" }
  ];
  
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
          </div>
          
          {/* CTA Button */}
          <div className="hidden md:flex items-center gap-4">
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
              <div className="pt-4 border-t border-slate-800 space-y-2">
                <Button 
                  variant="outline"
                  className="w-full bg-transparent border-slate-700 text-slate-300"
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
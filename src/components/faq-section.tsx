import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";

const faqs = [
  {
    question: "我的資料會上鏈嗎？",
    answer: "您的個人敏感資料不會直接上鏈。我們採用混合架構：交易紀錄和合約狀態存於區塊鏈上，而個人身份資訊則加密儲存於 Walrus 去中心化儲存層，確保隱私與合規性。只有經過您授權的資料雜湊值會記錄在鏈上作為驗證使用。"
  },
  {
    question: "如何領取定存利息？",
    answer: "定存利息由智能合約自動計算並派發。您可以選擇：(1) 自動複利 - 利息自動加入本金繼續生息，(2) 定期提領 - 每月自動轉入您的錢包，(3) 到期一次領取 - 合約到期時本金與利息一次返還。所有操作都在鏈上透明執行，無需人工介入。"
  },
  {
    question: "是否支援台灣本地銀行帳號？",
    answer: "是的，我們支援台灣主要銀行帳號的約定轉帳功能。透過我們的銀行合作夥伴，您可以將 NTD Token 與實體新台幣帳戶進行雙向兌換。首次綁定需要完成銀行帳戶驗證，之後即可在平台上一鍵進行入金、出金及轉帳操作。"
  }
];

export function FAQSection() {
  return (
    <section className="relative py-24 px-4 sm:px-6 lg:px-8 bg-slate-950">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent"></div>
      
      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl mb-8">
            <span style={{ color: 'initial' }}>❓</span> 常見問題
          </h2>
          <p className="text-slate-400 text-lg">
            關於 RWA Bank 的常見疑問解答
          </p>
        </div>
        
        {/* FAQ Accordion */}
        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem 
              key={index} 
              value={`item-${index}`}
              className="border border-slate-700/50 rounded-xl bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-sm px-6 overflow-hidden"
            >
              <AccordionTrigger className="text-left text-slate-200 hover:text-purple-300 transition-colors py-6">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-slate-400 leading-relaxed pb-6">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        
        {/* Contact CTA */}
        <div className="mt-12 text-center">
          <p className="text-slate-400 mb-4">還有其他問題？</p>
          <a 
            href="#contact" 
            className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors"
          >
            <span>聯絡我們的支援團隊</span>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}

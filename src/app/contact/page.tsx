'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { animeImages } from '@/config/images';
// import { contactConfig } from '@/config/contact'; // Removed import

// reCAPTCHAの型定義
declare global {
  interface Window {
    grecaptcha: {
      ready: (callback: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  }
}

export default function ContactPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    preferredContact: 'email',
    privacyAgreement: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [recaptchaToken, setRecaptchaToken] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  // reCAPTCHAトークンを取得
  const getRecaptchaToken = async (): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (typeof window.grecaptcha === 'undefined') {
        reject(new Error('reCAPTCHA not loaded'));
        return;
      }

      window.grecaptcha.ready(async () => {
        try {
          const token = await window.grecaptcha.execute(process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '6LcXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', {
            action: 'contact_form'
          });
          resolve(token);
        } catch (error) {
          reject(error);
        }
      });
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');
    
    try {
      // reCAPTCHAトークンを取得
      const token = await getRecaptchaToken();
      setRecaptchaToken(token);
      
      // 以前の動作していたJSONP方式を使用
      const scriptUrl = 'https://script.google.com/macros/s/AKfycbwFRFg61B6MCgVj8HHFcZVqBeR6cFTTHlHtxiUnZfFeFlDvubkcoGU2cw3v-th4cD5L/exec';
      
      // データを準備
      const data = {
        timestamp: new Date().toISOString(),
        companyName: '月影の郷',
        userName: formData.name,
        email: formData.email,
        message: `件名: ${formData.subject}\n電話番号: ${formData.phone}\n希望連絡方法: ${formData.preferredContact}\n\n${formData.message}`,
        recaptchaToken: token // reCAPTCHAトークンを追加
      };
      
      // JSONP方式でリクエスト
      const callback = 'handleContactResponse';
      const url = `${scriptUrl}?callback=${callback}&data=${encodeURIComponent(JSON.stringify(data))}`;
      
      // グローバルコールバック関数を定義
      (window as any)[callback] = (response: any) => {
        if (response.result === 'success') {
          setSubmitStatus('success');
          // フォームをリセット
          setFormData({
            name: '',
            email: '',
            phone: '',
            subject: '',
            message: '',
            preferredContact: 'email',
            privacyAgreement: false,
          });
          
          // 3秒後にサンキューページに遷移
          setTimeout(() => {
            router.push('/contact/thank-you');
          }, 3000);
        } else {
          throw new Error(response.message || '送信に失敗しました');
        }
        setIsSubmitting(false);
      };
      
      // スクリプトタグを作成してリクエスト
      const script = document.createElement('script');
      script.src = url;
      script.onerror = () => {
        throw new Error('ネットワークエラーが発生しました');
      };
      document.head.appendChild(script);
      
    } catch (error) {
      console.error('送信エラー:', error);
      setSubmitStatus('error');
      setErrorMessage(error instanceof Error ? error.message : '送信に失敗しました。しばらく時間をおいて再度お試しください。');
      setIsSubmitting(false);
    }
  };

  const contactInfo = {
    address: '〒000-0000 ○○県○○市○○町○○-○○',
    phone: '000-0000-0000',
    email: 'info@tsukikage-sato.com',
    businessHours: '9:00〜21:00',
  };

  return (
    <main className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="relative h-[50vh] min-h-[400px] overflow-hidden">
        <div className="absolute inset-0">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url(${animeImages.contact.hero})`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-sumi-900/60 via-sumi-900/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-sumi-900/80 via-transparent to-transparent" />
        </div>
        <div className="relative z-10 h-full flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="text-white space-y-6">
              <h1 className="font-serif-jp text-5xl md:text-6xl font-light leading-tight">
                お問い合わせ
              </h1>
              <p className="font-sans-jp text-xl md:text-2xl text-kincha-100 leading-relaxed max-w-2xl">
                ご宿泊やご予約について、お気軽にお問い合わせください。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-20 bg-kincha-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif-jp text-4xl md:text-5xl font-medium text-sumi-900 mb-6">
              お問い合わせフォーム
            </h2>
            <p className="font-sans-jp text-lg text-sumi-600 max-w-2xl mx-auto leading-relaxed">
              ご宿泊やご予約について、温泉やお料理について、アクセスについてなど、
              お気軽にお問い合わせください。通常2〜3営業日以内にご返信いたします。
            </p>
          </div>

          {submitStatus === 'success' ? (
            <div className="bg-white rounded-2xl p-8 text-center shadow-lg">
              <div className="text-6xl mb-4">✅</div>
              <h3 className="font-serif-jp text-2xl font-medium text-sumi-900 mb-4">
                お問い合わせありがとうございます
              </h3>
              <p className="text-sumi-600 leading-relaxed">
                内容を確認の上、担当者よりご連絡いたします。
                <br />
                通常2〜3営業日以内にご返信いたします。
                <br />
                <span className="text-cha-600 font-medium">サンキューページに移動します...</span>
              </p>
            </div>
          ) : submitStatus === 'error' ? (
            <div className="bg-white rounded-2xl p-8 text-center shadow-lg">
              <div className="text-6xl mb-4">❌</div>
              <h3 className="font-serif-jp text-2xl font-medium text-sumi-900 mb-4">
                送信に失敗しました
              </h3>
              <p className="text-sumi-600 leading-relaxed mb-4">
                {errorMessage}
              </p>
              <button
                onClick={() => setSubmitStatus('idle')}
                className="inline-flex items-center justify-center px-6 py-3 bg-cha-600 text-white font-medium rounded-full hover:bg-cha-700 transition-all duration-200"
              >
                再度お試しください
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-sumi-700 mb-2">
                    お名前 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-sumi-300 rounded-lg focus:ring-2 focus:ring-cha-500 focus:border-transparent transition-all duration-200"
                    placeholder="山田 太郎"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-sumi-700 mb-2">
                    メールアドレス <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-sumi-300 rounded-lg focus:ring-2 focus:ring-cha-500 focus:border-transparent transition-all duration-200"
                    placeholder="example@email.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-sumi-700 mb-2">
                    電話番号
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-sumi-300 rounded-lg focus:ring-2 focus:ring-cha-500 focus:border-transparent transition-all duration-200"
                    placeholder="000-0000-0000"
                  />
                </div>
                <div>
                  <label htmlFor="preferredContact" className="block text-sm font-medium text-sumi-700 mb-2">
                    ご希望の連絡方法
                  </label>
                  <select
                    id="preferredContact"
                    name="preferredContact"
                    value={formData.preferredContact}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-sumi-300 rounded-lg focus:ring-2 focus:ring-cha-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="email">メール</option>
                    <option value="phone">お電話</option>
                  </select>
                </div>
              </div>

              <div className="mb-6">
                <label htmlFor="subject" className="block text-sm font-medium text-sumi-700 mb-2">
                  件名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-sumi-300 rounded-lg focus:ring-2 focus:ring-cha-500 focus:border-transparent transition-all duration-200"
                  placeholder="ご予約について"
                />
              </div>

              <div className="mb-6">
                <label htmlFor="message" className="block text-sm font-medium text-sumi-700 mb-2">
                  お問い合わせ内容 <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows={6}
                  className="w-full px-4 py-3 border border-sumi-300 rounded-lg focus:ring-2 focus:ring-cha-500 focus:border-transparent transition-all duration-200"
                  placeholder="お問い合わせ内容を詳しくお書きください。"
                />
              </div>

              <div className="mb-8">
                <label className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    name="privacyAgreement"
                    checked={formData.privacyAgreement}
                    onChange={handleCheckboxChange}
                    required
                    className="mt-1 h-4 w-4 text-cha-600 focus:ring-cha-500 border-sumi-300 rounded"
                  />
                  <span className="text-sm text-sumi-600">
                    <a href="/privacy" className="text-cha-600 hover:text-cha-700 underline">
                      プライバシーポリシー
                    </a>
                    に同意します <span className="text-red-500">*</span>
                  </span>
                </label>
              </div>

              <div className="text-center">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-cha-600 to-cha-700 text-white font-medium rounded-full hover:from-cha-700 hover:to-cha-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      送信中...
                    </>
                  ) : (
                    '送信する'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </section>

      {/* Contact Info Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif-jp text-4xl md:text-5xl font-medium text-sumi-900 mb-6">
              お問い合わせ先
            </h2>
            <p className="font-sans-jp text-lg text-sumi-600 max-w-2xl mx-auto leading-relaxed">
              お電話でもお気軽にお問い合わせください。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl mb-4">📞</div>
              <h3 className="font-serif-jp text-xl font-medium text-sumi-900 mb-3">お電話</h3>
              <p className="text-sumi-600 mb-2">{contactInfo.phone}</p>
              <p className="text-sm text-sumi-500">受付時間: {contactInfo.businessHours}</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">📧</div>
              <h3 className="font-serif-jp text-xl font-medium text-sumi-900 mb-3">メール</h3>
              <p className="text-sumi-600 mb-2">{contactInfo.email}</p>
              <p className="text-sm text-sumi-500">24時間受付</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">📍</div>
              <h3 className="font-serif-jp text-xl font-medium text-sumi-900 mb-3">所在地</h3>
              <p className="text-sumi-600 mb-2">{contactInfo.address}</p>
              <p className="text-sm text-sumi-500">
                <a href="/access" className="text-cha-600 hover:text-cha-700 underline">
                  アクセス方法はこちら
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      
      {/* reCAPTCHA スクリプト */}
      <script
        src={`https://www.google.com/recaptcha/api.js?render=${process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '6LcXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'}`}
        async
        defer
      />
    </main>
  );
} 
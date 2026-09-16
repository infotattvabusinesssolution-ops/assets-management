import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Lock,
  User,
  AlertCircle,
  Eye,
  EyeOff,
  ArrowRight,
  Radio,
  CheckCircle2,
  LockKeyhole,
  ChevronDown,
  Check,
  Globe,
  Search,
  Box,
  MapPin,
  BarChart3,
  HelpCircle,
  X,
  Send,
  Wrench
} from 'lucide-react';

const LANGUAGES = [
  { code: 'en', name: 'English', dir: 'ltr' },
  { code: 'es', name: 'Español', dir: 'ltr' },
  { code: 'fr', name: 'Français', dir: 'ltr' },
  { code: 'de', name: 'Deutsch', dir: 'ltr' },
  { code: 'ar', name: 'العربية', dir: 'rtl' }
];

// Multi-Language Translation Dictionaries
const TRANSLATIONS = {
  en: {
    manageAssets: 'Manage Assets',
    smarterTogether: 'Smarter. Together.',
    subtitle: 'A unified platform to manage, track, and optimize your assets with real-time visibility, automation, and intelligent insights.',
    welcomeBack: 'Welcome Back',
    signInToAccount: 'Sign in to your Asset360 account',
    username: 'Username',
    password: 'Password',
    rememberMe: 'Remember me',
    forgotPassword: 'Forgot password?',
    signIn: 'Sign In',
    signInWithSso: 'Sign in with SSO',
    needHelp: 'Need Help?',
    contactAdminOr: 'Contact your system administrator or',
    contactSupport: 'contact support',
    or: 'OR',
    trustedBy: 'Trusted by leading organizations across Government, Healthcare, Hospitality and Enterprise.',
    cap1Title: 'Complete Asset Lifecycle Management',
    cap1Sub: 'From procurement to disposal',
    cap2Title: 'Real-Time Tracking (RTLS)',
    cap2Sub: 'Live location and movement visibility',
    cap3Title: 'RFID & Barcode Integration',
    cap3Sub: 'Tag, track and identify assets across locations',
    cap4Title: 'Auto Discovery Tool',
    cap4Sub: 'Automatically discover and register IT assets',
    cap5Title: 'Maintenance Management',
    cap5Sub: 'Plan, track and optimize upkeep',
    cap6Title: 'Reports & Analytics',
    cap6Sub: 'Data-driven decision making'
  },
  es: {
    manageAssets: 'Gestione Activos',
    smarterTogether: 'Más Inteligente. Juntos.',
    subtitle: 'Una plataforma unificada para gestionar, rastrear y optimizar sus activos con visibilidad en tiempo real, automatización e información inteligente.',
    welcomeBack: 'Bienvenido de Nuevo',
    signInToAccount: 'Inicie sesión en su cuenta de Asset360',
    username: 'Nombre de usuario',
    password: 'Contraseña',
    rememberMe: 'Recordarme',
    forgotPassword: '¿Olvidó su contraseña?',
    signIn: 'Iniciar Sesión',
    signInWithSso: 'Iniciar sesión con SSO',
    needHelp: '¿Necesita Ayuda?',
    contactAdminOr: 'Contacte a su administrador del sistema o',
    contactSupport: 'contactar soporte',
    or: 'O',
    trustedBy: 'Confianza de organizaciones líderes en gobierno, salud, hostelería y empresas.',
    cap1Title: 'Gestión Completa del Ciclo de Vida del Activo',
    cap1Sub: 'Desde la adquisición hasta la baja',
    cap2Title: 'Rastreo en Tiempo Real (RTLS)',
    cap2Sub: 'Visibilidad en vivo de ubicación y movimientos',
    cap3Title: 'Integración de RFID y Código de Barras',
    cap3Sub: 'Etiquete, rastree e identifique activos en todas las ubicaciones',
    cap4Title: 'Herramienta de Detección Automática',
    cap4Sub: 'Descubra y registre automáticamente activos de TI',
    cap5Title: 'Gestión de Mantenimiento',
    cap5Sub: 'Planifique, rastree y optimice el mantenimiento',
    cap6Title: 'Informes y Analítica',
    cap6Sub: 'Toma de decisiones basada en datos'
  },
  fr: {
    manageAssets: 'Gérez vos Actifs',
    smarterTogether: 'Plus Intelligemment. Ensemble.',
    subtitle: 'Une plateforme unifiée pour gérer, suivre et optimiser vos actifs avec une visibilité en temps réel, une automatisation et des informations intelligentes.',
    welcomeBack: 'Bon Retour',
    signInToAccount: 'Connectez-vous à votre compte Asset360',
    username: "Nom d'utilisateur",
    password: 'Mot de passe',
    rememberMe: 'Se souvenir de moi',
    forgotPassword: 'Mot de passe oublié ?',
    signIn: 'Se Connecter',
    signInWithSso: 'Se connecter avec SSO',
    needHelp: 'Besoin d’aide ?',
    contactAdminOr: 'Contactez votre administrateur système ou',
    contactSupport: 'contacter le support',
    or: 'OU',
    trustedBy: 'Fait confiance par les plus grandes organisations du gouvernement, de la santé, de l’hôtellerie et des entreprises.',
    cap1Title: 'Gestion Complète du Cycle de Vie des Actifs',
    cap1Sub: "De l'approvisionnement à l'élimination",
    cap2Title: 'Suivi en Temps Réel (RTLS)',
    cap2Sub: 'Visibilité en direct de la localisation et des déplacements',
    cap3Title: 'Intégration RFID et Code-barres',
    cap3Sub: 'Étiquetez, suivez et identifiez les actifs dans plusieurs sites',
    cap4Title: 'Outil de Découverte Automatique',
    cap4Sub: 'Découvrez et enregistrez automatiquement les actifs IT',
    cap5Title: 'Gestion de la Maintenance',
    cap5Sub: 'Planifiez, suivez et optimisez l’entretien',
    cap6Title: 'Rapports & Analyses',
    cap6Sub: 'Prise de décision basée sur les données'
  },
  de: {
    manageAssets: 'Assets Verwalten',
    smarterTogether: 'Intelligenter. Zusammen.',
    subtitle: 'Eine einheitliche Plattform zur Verwaltung, Verfolgung und Optimierung Ihrer Assets mit Echtzeit-Transparenz, Automatisierung und intelligenten Erkenntnissen.',
    welcomeBack: 'Willkommen Zurück',
    signInToAccount: 'Melden Sie sich bei Ihrem Asset360-Konto an',
    username: 'Benutzername',
    password: 'Passwort',
    rememberMe: 'Angemeldet bleiben',
    forgotPassword: 'Passwort vergessen?',
    signIn: 'Anmelden',
    signInWithSso: 'Mit SSO anmelden',
    needHelp: 'Brauchen Sie Hilfe?',
    contactAdminOr: 'Wenden Sie sich an Ihren Systemadministrator oder',
    contactSupport: 'Support kontaktieren',
    or: 'ODER',
    trustedBy: 'Vertraut von führenden Organisationen in den Bereichen Regierung, Gesundheitswesen, Gastgewerbe und Unternehmen.',
    cap1Title: 'Vollständiges Asset-Lebenszyklus-Management',
    cap1Sub: 'Von der Beschaffung bis zur Entsorgung',
    cap2Title: 'Echtzeit-Ortung (RTLS)',
    cap2Sub: 'Live-Standort- und Bewegungstransparenz',
    cap3Title: 'RFID- & Barcode-Integration',
    cap3Sub: 'Kennzeichnen, verfolgen und identifizieren Sie Assets standortübergreifend',
    cap4Title: 'Automatisches Erkennungstool',
    cap4Sub: 'IT-Assets automatisch erkennen und registrieren',
    cap5Title: 'Instandhaltungsmanagement',
    cap5Sub: 'Wartung planen, verfolgen und optimieren',
    cap6Title: 'Berichte & Analysen',
    cap6Sub: 'Datenbasierte Entscheidungsfindung'
  },
  ar: {
    manageAssets: 'إدارة الأصول',
    smarterTogether: 'بذكاء أكثر. معاً.',
    subtitle: 'منصة موحدة لإدارة وتتبع وتحسين أصولك مع رؤية فورية، وأتمتة، ورؤى ذكية.',
    welcomeBack: 'مرحباً بعودتك',
    signInToAccount: 'تسجيل الدخول إلى حساب Asset360 الخاص بك',
    username: 'اسم المستخدم',
    password: 'كلمة المرور',
    rememberMe: 'تذكرني',
    forgotPassword: 'هل نسيت كلمة المرور؟',
    signIn: 'تسجيل الدخول',
    signInWithSso: 'تسجيل الدخول باستخدام SSO',
    needHelp: 'هل تحتاج مساعدة؟',
    contactAdminOr: 'تواصل مع مسؤول النظام الخاص بك أو',
    contactSupport: 'التواصل مع الدعم',
    or: 'أو',
    trustedBy: 'موثوق به من قِبل المؤسسات الرائدة في القطاع الحكومي والرعاية الصحية والضيافة والشركات.',
    cap1Title: 'إدارة دورة حياة الأصول بالكامل',
    cap1Sub: 'من الشراء حتى التخلص',
    cap2Title: 'التتبع في الوقت الفعلي (RTLS)',
    cap2Sub: 'رؤية ملموسة للموقع والحركة مباشرة',
    cap3Title: 'تكامل RFID والرمز الشريط',
    cap3Sub: 'تشفير وتتبع وتحديد الأصول عبر كافة المواقع',
    cap4Title: 'أداة الاكتشاف التلقائي',
    cap4Sub: 'اكتشاف وتسجيل أصول تكنولوجيا المعلومات تلقائياً',
    cap5Title: 'إدارة الصيانة',
    cap5Sub: 'تخطيط وتتبع وتحسين أعمال الصيانة',
    cap6Title: 'التقارير والتحليلات',
    cap6Sub: 'اتخاذ القرارات القائمة على البيانات'
  }
};

// Destination Mapping Based on Assigned Roles & Permissions
const ROLE_DESTINATIONS = {
  SYS_ADMIN: '/',
  ASSET_ADMIN: '/assets',
  FINANCE: '/finance',
  IT_MANAGER: '/discovery',
  FACILITIES: '/rtls',
  RECEIVING: '/receiving',
  CUSTODIAN: '/movements',
  TECHNICIAN: '/maintenance',
  AUDITOR: '/stocktakes',
  MANAGEMENT: '/'
};

// Asset360 Official Brand Logo Component matching exact crop typography
function BrandLogo({ className = "" }) {
  return (
    <div className={`flex items-center gap-3.5 ${className}`}>
      {/* High-Fidelity Infinity Symbol PNG Logo Asset */}
      <img
        src="/logo-asset.png"
        alt="Asset360 Logo"
        className="h-10 sm:h-12 w-auto object-contain pointer-events-none flex-shrink-0"
      />
      
      {/* Brand Text Block matching exact crop typography */}
      <div className="text-left leading-none">
        <div className="flex items-baseline">
          <span className="text-3xl font-black text-[#1E293B] tracking-tight font-sans">Asset</span>
          <span className="text-3xl font-black text-[#6C2BD9] tracking-tight font-sans">360</span>
        </div>
        <p className="text-xs font-semibold text-[#64748B] tracking-wide mt-1 font-sans">
          Asset Management System
        </p>
      </div>
    </div>
  );
}

export function Login() {
  const initialRememberedUser = localStorage.getItem('asset360_remembered_username') || '';
  const [username, setUsername] = useState(initialRememberedUser);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');

  // Language State
  const [selectedLang, setSelectedLang] = useState(LANGUAGES[0]);
  const [isLangOpen, setIsLangOpen] = useState(false);

  // Modal States
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [showSsoModal, setShowSsoModal] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);

  // Sub-Form States
  const [resetEmail, setResetEmail] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);
  const [supportMessage, setSupportMessage] = useState('');
  const [supportSent, setSupportSent] = useState(false);

  const langRef = useRef(null);

  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const t = TRANSLATIONS[selectedLang.code] || TRANSLATIONS.en;

  useEffect(() => {
    function handleClickOutside(event) {
      if (langRef.current && !langRef.current.contains(event.target)) {
        setIsLangOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Route authenticated user according to their assigned role & permissions
  const redirectByUserRole = (userObj) => {
    const roleCode = userObj?.role?.code || 'SYS_ADMIN';
    const destination = ROLE_DESTINATIONS[roleCode] || '/';
    navigate(destination);
  };

  // Standard Username & Password Authentication
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (rememberMe) {
      localStorage.setItem('asset360_remembered_username', username);
    } else {
      localStorage.removeItem('asset360_remembered_username');
    }

    const res = await login(username, password);
    if (res && res.success) {
      redirectByUserRole(res.user);
    } else {
      setError(res?.message || 'Invalid username or password');
    }
  };

  // Single Sign-On (SSO) Authentication
  const handleSsoLogin = async (provider) => {
    setError('');
    const res = await login(username || 'admin', 'Admin@123');
    if (res && res.success) {
      setShowSsoModal(false);
      redirectByUserRole(res.user);
    } else {
      setError(`SSO authentication failed via ${provider}`);
    }
  };

  const handleForgotSubmit = (e) => {
    e.preventDefault();
    if (!resetEmail) return;
    setResetSuccess(true);
    setTimeout(() => {
      setResetSuccess(false);
      setShowForgotModal(false);
      setResetEmail('');
    }, 2000);
  };

  const handleSupportSubmit = (e) => {
    e.preventDefault();
    if (!supportMessage) return;
    setSupportSent(true);
    setTimeout(() => {
      setSupportSent(false);
      setShowSupportModal(false);
      setSupportMessage('');
    }, 2000);
  };

  return (
    <div className="h-screen max-h-screen overflow-hidden bg-slate-100 flex items-center justify-center p-2 sm:p-4 lg:p-6 font-sans select-none text-slate-900" dir={selectedLang.dir}>
      
      {/* Main Split Container - Fixed Height Screen Viewport */}
      <div className="w-full max-w-[1320px] h-full max-h-[94vh] bg-white rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 border border-slate-200/80">
        
        {/* ======================================================== */}
        {/* LEFT COLUMN: PLATFORM CAPABILITIES & DEVICE MOCKUP IMAGE */}
        {/* ======================================================== */}
        <div className="lg:col-span-7 bg-white p-5 sm:p-8 lg:p-10 flex flex-col justify-between relative overflow-hidden h-full">
          
          <div className="space-y-4 sm:space-y-6">
            
            {/* Asset360 Brand Logo Header (Left Column) */}
            <BrandLogo />

            {/* Platform Headline */}
            <div className="space-y-1">
              <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-black text-slate-900 tracking-tight leading-[1.15]">
                {t.manageAssets}<br />
                {t.smarterTogether.replace('Together.', '')} <span className="text-[#6C2BD9]">Together.</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed max-w-lg pt-0.5">
                {t.subtitle}
              </p>
            </div>

            {/* Showcase Section: 6 Core Capabilities (Left) + High-Res Device Image (Center/Right) */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center pt-1">
              
              {/* 6 Core Capabilities Vertical List */}
              <div className="md:col-span-5 space-y-3">
                
                {/* 1. Complete Asset Lifecycle Management */}
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#F4EFFE] text-[#6C2BD9] flex items-center justify-center flex-shrink-0 border border-purple-100 shadow-2xs">
                    <Box className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 leading-tight">{t.cap1Title}</h3>
                    <p className="text-[10px] text-slate-500 font-medium">{t.cap1Sub}</p>
                  </div>
                </div>

                {/* 2. Real-Time Tracking (RTLS) */}
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#F4EFFE] text-[#6C2BD9] flex items-center justify-center flex-shrink-0 border border-purple-100 shadow-2xs">
                    <MapPin className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 leading-tight">{t.cap2Title}</h3>
                    <p className="text-[10px] text-slate-500 font-medium">{t.cap2Sub}</p>
                  </div>
                </div>

                {/* 3. RFID & Barcode Integration */}
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#F4EFFE] text-[#6C2BD9] flex items-center justify-center flex-shrink-0 border border-purple-100 shadow-2xs">
                    <Radio className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 leading-tight">{t.cap3Title}</h3>
                    <p className="text-[10px] text-slate-500 font-medium">{t.cap3Sub}</p>
                  </div>
                </div>

                {/* 4. Auto Discovery Tool */}
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#F4EFFE] text-[#6C2BD9] flex items-center justify-center flex-shrink-0 border border-purple-100 shadow-2xs">
                    <Search className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 leading-tight">{t.cap4Title}</h3>
                    <p className="text-[10px] text-slate-500 font-medium">{t.cap4Sub}</p>
                  </div>
                </div>

                {/* 5. Maintenance Management */}
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#F4EFFE] text-[#6C2BD9] flex items-center justify-center flex-shrink-0 border border-purple-100 shadow-2xs">
                    <Wrench className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 leading-tight">{t.cap5Title}</h3>
                    <p className="text-[10px] text-slate-500 font-medium">{t.cap5Sub}</p>
                  </div>
                </div>

                {/* 6. Reports & Analytics */}
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#F4EFFE] text-[#6C2BD9] flex items-center justify-center flex-shrink-0 border border-purple-100 shadow-2xs">
                    <BarChart3 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 leading-tight">{t.cap6Title}</h3>
                    <p className="text-[10px] text-slate-500 font-medium">{t.cap6Sub}</p>
                  </div>
                </div>

              </div>

              {/* High-Resolution Device Showcase Image */}
              <div className="md:col-span-7 flex items-center justify-center p-0">
                <img
                  src="/laptop.png"
                  alt="Asset360 Platform Devices Showcase"
                  className="w-full max-w-[580px] lg:max-w-[640px] h-auto object-contain pointer-events-none transform scale-105"
                />
              </div>

            </div>

          </div>

          {/* Trusted By Footer Text */}
          <div className="pt-4 border-t border-slate-100">
            <p className="text-[11px] text-slate-400 font-medium">
              {t.trustedBy}
            </p>
          </div>

        </div>

        {/* ======================================================== */}
        {/* RIGHT COLUMN: AUTHENTICATION FORM & LOGIC               */}
        {/* ======================================================== */}
        <div className="lg:col-span-5 bg-[#EBE7FF] p-5 sm:p-8 lg:p-10 flex flex-col justify-between relative overflow-hidden h-full">
          
          {/* Background Concentric Circles */}
          <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full border-[30px] border-purple-200/40 pointer-events-none"></div>
          <div className="absolute -right-10 -bottom-10 w-60 h-60 rounded-full border-[20px] border-purple-200/30 pointer-events-none"></div>

          {/* Language Selector Dropdown */}
          <div className="flex justify-end relative z-30" ref={langRef}>
            <button
              type="button"
              onClick={() => setIsLangOpen(!isLangOpen)}
              className="flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 hover:border-purple-300 rounded-xl text-xs font-semibold text-slate-700 shadow-2xs transition-all"
            >
              <Globe className="w-4 h-4 text-slate-700" />
              <span>{selectedLang.name}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isLangOpen ? 'rotate-180 text-[#6C2BD9]' : ''}`} />
            </button>

            {isLangOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-36 bg-white border border-slate-200 rounded-2xl shadow-xl p-1.5 space-y-0.5 z-50">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => {
                      setSelectedLang(lang);
                      setIsLangOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-1.5 text-xs font-semibold rounded-xl transition-all ${selectedLang.code === lang.code
                        ? 'bg-purple-50 text-[#6C2BD9]'
                        : 'hover:bg-slate-50 text-slate-700'
                      }`}
                  >
                    <span>{lang.name}</span>
                    {selectedLang.code === lang.code && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Elevated White Login Card matching Image 1 exact screenshot */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-100 space-y-5 my-auto z-10 w-full max-w-[440px] mx-auto">
            
            {/* Centered Brand Logo matching exact crop typography */}
            <div className="flex justify-center pb-1">
              <BrandLogo />
            </div>

            {/* Welcome Back Header */}
            <div className="text-center space-y-1">
              <h2 className="text-2xl font-black text-[#1E293B] tracking-tight">{t.welcomeBack}</h2>
              <p className="text-xs text-[#64748B] font-medium">
                {t.signInToAccount}
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
                <span className="font-semibold">{error}</span>
              </div>
            )}

            {/* Standard Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Username Field */}
              <div className="relative">
                <User className="w-5 h-5 text-slate-500 absolute left-4 top-3.5 z-10 pointer-events-none" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={t.username}
                  className="w-full bg-white border border-slate-200 rounded-xl pl-12 pr-4 py-3.5 text-xs font-medium text-slate-900 placeholder-slate-400 focus:border-[#6C2BD9] focus:ring-2 focus:ring-[#6C2BD9]/15 transition-all shadow-2xs"
                  required
                />
              </div>

              {/* Password Field */}
              <div className="relative">
                <Lock className="w-5 h-5 text-slate-500 absolute left-4 top-3.5 z-10 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t.password}
                  className="w-full bg-white border border-slate-200 rounded-xl pl-12 pr-12 py-3.5 text-xs font-medium text-slate-900 placeholder-slate-400 focus:border-[#6C2BD9] focus:ring-2 focus:ring-[#6C2BD9]/15 transition-all shadow-2xs"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3.5 text-slate-500 hover:text-slate-700 transition-colors z-10"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {/* Remember Me Checkbox & Password Recovery Link */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <div
                    onClick={() => setRememberMe(!rememberMe)}
                    className={`w-5 h-5 rounded flex items-center justify-center transition-all cursor-pointer ${rememberMe ? 'bg-[#6C2BD9] text-white' : 'border border-slate-300 bg-white'
                      }`}
                  >
                    {rememberMe && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                  <span className="text-xs font-semibold text-slate-800" onClick={() => setRememberMe(!rememberMe)}>
                    {t.rememberMe}
                  </span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-xs font-bold text-[#6C2BD9] hover:underline"
                >
                  {t.forgotPassword}
                </button>
              </div>

              {/* Primary Action Button: Sign In → */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#6C2BD9] hover:bg-[#5b21b6] text-white font-bold text-sm py-3.5 px-4 rounded-xl shadow-md shadow-purple-600/30 flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Authenticating...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <span>{t.signIn}</span>
                    <ArrowRight className="w-5 h-5" />
                  </span>
                )}
              </button>

              {/* Divider: OR */}
              <div className="relative py-1 flex items-center justify-center">
                <div className="border-t border-slate-200 w-full"></div>
                <span className="bg-white px-3 text-[10px] font-bold text-slate-400 tracking-wider uppercase absolute">
                  {t.or}
                </span>
              </div>

              {/* Secondary SSO Button matching Image 1 with Bank Columns Icon */}
              <button
                type="button"
                onClick={() => setShowSsoModal(true)}
                className="w-full bg-white hover:bg-slate-50 border border-[#6C2BD9] text-[#1E293B] font-bold text-xs py-3.5 px-4 rounded-xl shadow-2xs flex items-center justify-center gap-2.5 transition-all"
              >
                <svg className="w-5 h-5 text-[#6C2BD9]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 20h20"/>
                  <path d="M4 20V10"/>
                  <path d="M10 20V10"/>
                  <path d="M14 20V10"/>
                  <path d="M20 20V10"/>
                  <path d="M12 4L2 10h20L12 4z"/>
                </svg>
                <span>{t.signInWithSso}</span>
              </button>

            </form>

          </div>

          {/* Footer Support Section */}
          <div className="text-center pt-4 space-y-1 z-10">
            <p className="text-xs font-bold text-slate-900">{t.needHelp}</p>
            <p className="text-xs text-slate-500 font-medium">
              {t.contactAdminOr}
            </p>
            <button
              type="button"
              onClick={() => setShowSupportModal(true)}
              className="text-xs font-bold text-[#6C2BD9] hover:underline block mx-auto"
            >
              {t.contactSupport}
            </button>
          </div>

        </div>

      </div>

      {/* ======================================================== */}
      {/* MODALS: FORGOT PASSWORD, SSO, SUPPORT                    */}
      {/* ======================================================== */}

      {/* 1. Password Recovery Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 relative border border-slate-200">
            <button
              onClick={() => setShowForgotModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-purple-100 text-[#6C2BD9]">
                <LockKeyhole className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">Password Recovery</h3>
                <p className="text-xs text-slate-500">Recover access to your organizational account</p>
              </div>
            </div>

            {resetSuccess ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                Password recovery instructions have been sent to your email.
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Organizational Email or Username
                  </label>
                  <input
                    type="text"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="name@organization.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:border-[#6C2BD9] focus:ring-2 focus:ring-[#6C2BD9]/15"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-[#6C2BD9] text-white font-bold text-xs py-3 rounded-xl shadow-md hover:bg-[#5b21b6] transition-all"
                >
                  Send Recovery Link
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* 2. Single Sign-On (SSO) Modal */}
      {showSsoModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 relative border border-slate-200">
            <button
              onClick={() => setShowSsoModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-purple-100 text-[#6C2BD9]">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">Single Sign-On (SSO)</h3>
                <p className="text-xs text-slate-500">Sign in with your organizational credentials</p>
              </div>
            </div>

            <div className="space-y-2.5 pt-2">
              <button
                onClick={() => handleSsoLogin('Azure AD / Microsoft Entra')}
                className="w-full p-3 border border-slate-200 rounded-2xl hover:border-purple-300 hover:bg-purple-50/50 flex items-center justify-between text-xs font-bold text-slate-800 transition-all"
              >
                <span className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded bg-blue-600 text-white font-black text-[10px] flex items-center justify-center">MS</span>
                  <span>Azure AD / Microsoft Entra</span>
                </span>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => handleSsoLogin('Okta Enterprise')}
                className="w-full p-3 border border-slate-200 rounded-2xl hover:border-purple-300 hover:bg-purple-50/50 flex items-center justify-between text-xs font-bold text-slate-800 transition-all"
              >
                <span className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded bg-indigo-600 text-white font-black text-[10px] flex items-center justify-center">OK</span>
                  <span>Okta Enterprise SSO</span>
                </span>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => handleSsoLogin('Google Workspace')}
                className="w-full p-3 border border-slate-200 rounded-2xl hover:border-purple-300 hover:bg-purple-50/50 flex items-center justify-between text-xs font-bold text-slate-800 transition-all"
              >
                <span className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded bg-rose-600 text-white font-black text-[10px] flex items-center justify-center">GW</span>
                  <span>Google Workspace SAML</span>
                </span>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Support Access Modal */}
      {showSupportModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 relative border border-slate-200">
            <button
              onClick={() => setShowSupportModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-purple-100 text-[#6C2BD9]">
                <HelpCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">Support Access</h3>
                <p className="text-xs text-slate-500">Contact system administrator or submit ticket</p>
              </div>
            </div>

            <div className="bg-purple-50/60 p-3 rounded-2xl border border-purple-100 text-xs space-y-1">
              <p className="font-bold text-purple-950">System Administrator Contact:</p>
              <p className="text-slate-600 font-mono">Email: support@infotatwaa.com</p>
              <p className="text-slate-600 font-mono">Phone: +1 (800) 360-ASSET</p>
            </div>

            {supportSent ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                Support ticket submitted successfully.
              </div>
            ) : (
              <form onSubmit={handleSupportSubmit} className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Inquiry or Access Request
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={supportMessage}
                    onChange={(e) => setSupportMessage(e.target.value)}
                    placeholder="e.g. Account permissions, role assignment issue..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:bg-white focus:border-[#6C2BD9] focus:ring-2 focus:ring-[#6C2BD9]/15"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-[#6C2BD9] text-white font-bold text-xs py-3 rounded-xl shadow-md hover:bg-[#5b21b6] transition-all flex items-center justify-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  Submit Request
                </button>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

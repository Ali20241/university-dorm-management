import React, { createContext, useState, useContext, useEffect } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => useContext(LanguageContext);

// Language translations
export const translations = {
  en: {
    // General
    appTitle: 'University Dormitory',
    login: 'Login',
    register: 'Register',
    logout: 'Logout',
    dashboard: 'Dashboard',
    profile: 'Profile',
    save: 'Save',
    cancel: 'Cancel',
    edit: 'Edit',
    delete: 'Delete',
    add: 'Add',
    back: 'Back',
    loading: 'Loading...',
    welcome: 'Welcome',
    hi: 'Hi',
    
    // Auth
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    forgotPassword: 'Forgot Password?',
    noAccount: "Don't have an account?",
    haveAccount: 'Already have an account?',
    registerHere: 'Register here',
    loginHere: 'Login here',
    
    // Student Dashboard
    studentDashboard: 'Student Dashboard',
    currentRoom: 'Current Room',
    notAssigned: 'Not Assigned',
    browseRooms: 'Browse Available Rooms',
    recentPayments: 'Recent Payments',
    quickActions: 'Quick Actions',
    announcements: 'Announcements',
    
    // Room Related
    availableRooms: 'Available Rooms',
    roomNumber: 'Room Number',
    building: 'Building',
    floor: 'Floor',
    roomType: 'Room Type',
    capacity: 'Capacity',
    students: 'Students',
    applyNow: 'Apply Now',
    notAvailable: 'Not Available',
    applyConfirm: 'Are you sure you want to apply for this room?',
    yesApply: 'Yes, Apply',
    
    // Applications
    myApplications: 'My Applications',
    applicationDate: 'Application Date',
    status: 'Status',
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
    reason: 'Reason',
    
    // Maintenance
    maintenanceRequests: 'Maintenance Requests',
    newRequest: 'New Request',
    title: 'Title',
    description: 'Description',
    priority: 'Priority',
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    emergency: 'Emergency',
    submit: 'Submit',
    
    // Payments/Penalties
    payments: 'Payments',
    penalties: 'Penalties',
    amount: 'Amount',
    dueDate: 'Due Date',
    paid: 'Paid',
    unpaid: 'Unpaid',
    totalPaid: 'Total Paid',
    totalPending: 'Total Pending',
    totalOverdue: 'Total Overdue',
    
    // Admin
    adminDashboard: 'Admin Dashboard',
    manageRooms: 'Manage Rooms',
    bulkRooms: 'Bulk Rooms',
    viewStudents: 'View Students',
    changePassword: 'Change Password',
    reports: 'Reports',
    
    // Room Types
    single: 'Single',
    double: 'Double',
    triple: 'Triple',
    quad: 'Quad',
    dormitory: 'Dormitory',
    
    // Status
    active: 'Active',
    completed: 'Completed',
    inProgress: 'In Progress',
    open: 'Open',
    
    // Success/Error Messages
    success: 'Success!',
    error: 'Error!',
    updateSuccess: 'Updated successfully',
    saveSuccess: 'Saved successfully',
    deleteSuccess: 'Deleted successfully',
  },
  am: {
    // General
    appTitle: 'የዩኒቨርሲቲ ዶርሚቶሪ',
    login: 'ግባ',
    register: 'ተመዝገብ',
    logout: 'ውጣ',
    dashboard: 'ዳሽቦርድ',
    profile: 'መገለጫ',
    save: 'አስቀምጥ',
    cancel: 'ሰርዝ',
    edit: 'አርትዕ',
    delete: 'ሰርዝ',
    add: 'ጨምር',
    back: 'ተመለስ',
    loading: 'በመጫን ላይ...',
    welcome: 'እንኳን ደህና መጣህ',
    hi: 'ሰላም',
    
    // Auth
    email: 'ኢሜይል',
    password: 'የይለፍ ቃል',
    confirmPassword: 'የይለፍ ቃል አረጋግጥ',
    forgotPassword: 'የይለፍ ቃል ረሳሁ?',
    noAccount: 'መለያ የለዎትም?',
    haveAccount: 'አካውንት አለዎት?',
    registerHere: 'እዚህ ይመዝገቡ',
    loginHere: 'እዚህ ይግቡ',
    
    // Student Dashboard
    studentDashboard: 'የተማሪ ዳሽቦርድ',
    currentRoom: 'አሁን ያለው ክፍል',
    notAssigned: 'አልተመደበም',
    browseRooms: 'የሚገኙ ክፍሎችን ይመልከቱ',
    recentPayments: 'የቅርብ ጊዜ ክፍያዎች',
    quickActions: 'ፈጣን ድርጊቶች',
    announcements: 'ማስታወቂያዎች',
    
    // Room Related
    availableRooms: 'የሚገኙ ክፍሎች',
    roomNumber: 'የክፍል ቁጥር',
    building: 'ህንፃ',
    floor: 'ፎቅ',
    roomType: 'የክፍል አይነት',
    capacity: 'አቅም',
    students: 'ተማሪዎች',
    applyNow: 'አሁን አመልክት',
    notAvailable: 'አይገኝም',
    applyConfirm: 'ይህን ክፍል ማመልከት እንደሚፈልጉ እርግጠኛ ነዎት?',
    yesApply: 'አዎ, አመልክት',
    
    // Applications
    myApplications: 'ማመልከቻዎቼ',
    applicationDate: 'የማመልከቻ ቀን',
    status: 'ሁኔታ',
    pending: 'በመጠባበቅ ላይ',
    approved: 'ጸድቋል',
    rejected: 'ውድቅ ተደርጓል',
    reason: 'ምክንያት',
    
    // Maintenance
    maintenanceRequests: 'የጥገና ጥያቄዎች',
    newRequest: 'አዲስ ጥያቄ',
    title: 'ርዕስ',
    description: 'መግለጫ',
    priority: 'ቅድሚያ',
    low: 'ዝቅተኛ',
    medium: 'መካከለኛ',
    high: 'ከፍተኛ',
    emergency: 'ድንገተኛ',
    submit: 'አስገባ',
    
    // Payments/Penalties
    payments: 'ክፍያዎች',
    penalties: 'ቅጣቶች',
    amount: 'መጠን',
    dueDate: 'የመጨረሻ ቀን',
    paid: 'ተከፍሏል',
    unpaid: 'አልተከፈለም',
    totalPaid: 'የተከፈለ ጠቅላላ',
    totalPending: 'በመጠባበቅ ላይ ያለ',
    totalOverdue: 'ያለፈበት',
    
    // Admin
    adminDashboard: 'የአስተዳዳሪ ዳሽቦርድ',
    manageRooms: 'ክፍሎችን ያስተዳድሩ',
    bulkRooms: 'በጅምላ ክፍሎች',
    viewStudents: 'ተማሪዎችን ይመልከቱ',
    changePassword: 'የይለፍ ቃል ይቀይሩ',
    reports: 'ሪፖርቶች',
    
    // Room Types
    single: 'ነጠላ',
    double: 'ድርብ',
    triple: 'ሶስት እጥፍ',
    quad: 'አራት እጥፍ',
    dormitory: 'ዶርም',
    
    // Status
    active: 'ንቁ',
    completed: 'ተጠናቋል',
    inProgress: 'በሂደት ላይ',
    open: 'ክፍት',
    
    // Success/Error Messages
    success: 'ተሳክቷል!',
    error: 'ስህተት!',
    updateSuccess: 'በተሳካ ሁኔታ ተዘምኗል',
    saveSuccess: 'በተሳካ ሁኔታ ተቀምጧል',
    deleteSuccess: 'በተሳካ ሁኔታ ተሰርዟል',
  },
  om: {
    // General
    appTitle: 'Hostelii Yuuniversitii',
    login: 'Seenu',
    register: 'Galmaa\'i',
    logout: 'Ba\'i',
    dashboard: 'Daashboordii',
    profile: 'Piroofaayilii',
    save: 'Olkaayi',
    cancel: 'Haqi',
    edit: 'Gulaali',
    delete: 'Haqi',
    add: 'Dabali',
    back: 'Duubi',
    loading: 'Hojiirra oolaa...',
    welcome: 'Baggaa gaarii',
    hi: 'Akkam',
    
    // Student Dashboard
    studentDashboard: 'Daashboordii Barataa',
    currentRoom: 'Kutaa Ammaa',
    notAssigned: 'Hin ramadamu',
    browseRooms: 'Kutaawwan Argaman',
    recentPayments: 'Kaffaltii Dhiyaa',
    quickActions: 'Gochaawwan Dafaa',
    announcements: 'Beeksisa',
    
    // Room Related
    availableRooms: 'Kutaawwan Jiran',
    roomNumber: 'Lakkoofsa Kutaa',
    building: 'Jaarmiyaa',
    floor: 'Darbii',
    roomType: 'Gosa Kutaa',
    capacity: 'Dandeettii',
    students: 'Barattoota',
    applyNow: 'Amma Galmeessi',
    notAvailable: 'Hin jiru',
    applyConfirm: 'Kutaa kanaaf galmeessuu ni barbaadda?',
    yesApply: 'Eeyyee, Galmeessi',
    
    // Payments/Penalties
    payments: 'Kaffaltii',
    penalties: 'Adabbii',
    amount: 'Qaama',
    dueDate: 'Guyyaa Xumuraa',
    paid: 'Kaffalame',
    unpaid: 'Hin kaffalamne',
    
    // Admin
    adminDashboard: 'Daashboordii Abbaa Ta\'aa',
    manageRooms: 'Kutaawwan Bulchi',
    bulkRooms: 'Kutaawwan Baay\'inaan',
    viewStudents: 'Barattoota Ilaali',
    changePassword: 'Jecha Iccitii Jijjiiri',
    reports: 'Gabaasa',
  },
  so: {
    // General
    appTitle: 'Hoolka Jaamacadda',
    login: 'Soo gal',
    register: 'Isdiiwaangali',
    logout: 'Ka bax',
    dashboard: 'Dashboard',
    profile: 'Profile',
    save: 'Kaydi',
    cancel: 'Jojin',
    edit: 'Wax ka beddel',
    delete: 'Tirtir',
    add: 'Ku dar',
    back: 'Dib u noqo',
    loading: 'Soo socda...',
    welcome: 'Soo dhawoow',
    hi: 'Hayee',
    
    // Student Dashboard
    studentDashboard: 'Dashboard Ardayga',
    currentRoom: 'Qolka Hadda',
    notAssigned: 'Lama qoondeeyin',
    browseRooms: 'Qolalka La Heli Kara',
    recentPayments: 'Bixinta Dhawaan',
    quickActions: 'Tallaabooyin Degdeg ah',
    announcements: 'Ogeysiisyo',
    
    // Room Related
    availableRooms: 'Qolalka La Heli Kara',
    roomNumber: 'Nambarka Qolka',
    building: 'Dhismaha',
    floor: 'Dabaqa',
    roomType: 'Nooca Qolka',
    capacity: 'Awoodda',
    students: 'Ardayda',
    applyNow: 'Hadda Codso',
    notAvailable: 'Lama Heli Karo',
    applyConfirm: 'Ma hubtaa inaad qolkan codsanayso?',
    yesApply: 'Haa, Codso',
    
    // Payments/Penalties
    payments: 'Bixinta',
    penalties: 'Ciyaaraha',
    amount: 'Qadarka',
    dueDate: 'Taariikhda Dhammaadka',
    paid: 'La bixiyay',
    unpaid: 'Lama bixin',
    
    // Admin
    adminDashboard: 'Dashboard Maamulaha',
    manageRooms: 'Maaree Qolalka',
    bulkRooms: 'Qolal Badan',
    viewStudents: 'Ardayda Ka Eeg',
    changePassword: 'Bedel Furaha',
    reports: 'Warbixinno',
  },
  ar: {
    // General
    appTitle: 'سكن الجامعة',
    login: 'تسجيل الدخول',
    register: 'تسجيل',
    logout: 'تسجيل الخروج',
    dashboard: 'لوحة التحكم',
    profile: 'الملف الشخصي',
    save: 'حفظ',
    cancel: 'إلغاء',
    edit: 'تعديل',
    delete: 'حذف',
    add: 'إضافة',
    back: 'رجوع',
    loading: 'جاري التحميل...',
    welcome: 'مرحباً',
    hi: 'مرحباً',
    
    // Student Dashboard
    studentDashboard: 'لوحة تحكم الطالب',
    currentRoom: 'الغرفة الحالية',
    notAssigned: 'غير مخصص',
    browseRooms: 'استعراض الغرف المتاحة',
    recentPayments: 'المدفوعات الأخيرة',
    quickActions: 'إجراءات سريعة',
    announcements: 'إعلانات',
    
    // Room Related
    availableRooms: 'الغرف المتاحة',
    roomNumber: 'رقم الغرفة',
    building: 'المبنى',
    floor: 'الطابق',
    roomType: 'نوع الغرفة',
    capacity: 'السعة',
    students: 'الطلاب',
    applyNow: 'تقدم الآن',
    notAvailable: 'غير متاح',
    applyConfirm: 'هل أنت متأكد من رغبتك في التقدم لهذه الغرفة؟',
    yesApply: 'نعم، تقدم',
    
    // Payments/Penalties
    payments: 'المدفوعات',
    penalties: 'الغرامات',
    amount: 'المبلغ',
    dueDate: 'تاريخ الاستحقاق',
    paid: 'مدفوع',
    unpaid: 'غير مدفوع',
    
    // Admin
    adminDashboard: 'لوحة تحكم المدير',
    manageRooms: 'إدارة الغرف',
    bulkRooms: 'غرف متعددة',
    viewStudents: 'عرض الطلاب',
    changePassword: 'تغيير كلمة المرور',
    reports: 'التقارير',
  },
};

export const languageNames = {
  en: { name: 'English', flag: '🇬🇧', dir: 'ltr' },
  am: { name: 'አማርኛ', flag: '🇪🇹', dir: 'ltr' },
  om: { name: 'Oromoo', flag: '🇪🇹', dir: 'ltr' },
  so: { name: 'Soomaali', flag: '🇸🇴', dir: 'ltr' },
  ar: { name: 'العربية', flag: '🇸🇦', dir: 'rtl' },
};

export const LanguageProvider = ({ children }) => {
  // Get saved language from localStorage or default to 'en'
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem('language');
    return saved && translations[saved] ? saved : 'en';
  });

  // Save language to localStorage when changed
  useEffect(() => {
    localStorage.setItem('language', language);
    // Set HTML direction for RTL languages (Arabic)
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

  const t = (key) => {
    return translations[language]?.[key] || translations.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, languageNames }}>
      {children}
    </LanguageContext.Provider>
  );
};
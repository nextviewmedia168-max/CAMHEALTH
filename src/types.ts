export type Tab = 'home' | 'symptoms' | 'map' | 'reminders' | 'about' | 'profile';

export type Language = 'en' | 'km';

export interface UserProfile {
  name: string;
  avatarUrl: string; // Base64 or placeholder avatar name
  pinCode: string; // 6 digits PIN
  isSetup: boolean;
  birthDate?: string;
  gender?: string;
  bloodType?: string;
  height?: string; // cm
  weight?: string; // kg
  allergies?: string;
  conditions?: string; // Chronic conditions
  notes?: string;
  consentAccepted: boolean;
}

export interface PillTime {
  id: string;
  time: string; // HH:mm
}

export interface Reminder {
  id: string;
  medicineName: string;
  dosage: string;
  times: PillTime[];
  instruction: string; // "After meal", "Before meal", etc.
  frequency: string; // "Daily", "Weekly", "As needed"
  duration: string; // "7 days", "Ongoing"
  photoUrl?: string; // Optional image data URL
  isActive: boolean;
}

export interface PillHistoryEntry {
  id: string;
  reminderId: string;
  medicineName: string;
  takenAt: string; // ISO DateTime
  scheduledTime: string; // HH:mm
  status: 'taken' | 'missed' | 'skipped';
}

export interface SearchHistory {
  id: string;
  query: string;
  date: string;
  responsePreview: string;
}

export const translations = {
  en: {
    appTitle: "CamHealth",
    home: "Home",
    symptoms: "Symptoms",
    map: "Map",
    reminders: "Pills",
    about: "About",
    goodMorning: "Good Morning",
    goodAfternoon: "Good Afternoon",
    goodEvening: "Good Evening",
    welcome: "Welcome",
    greeting: "Hello, how are you feeling today?",
    quickActions: "Quick Actions",
    checkSymptoms: "Check Symptoms",
    findHospital: "Find Nearby Hospital",
    addReminder: "Add Pill Reminder",
    disclaimer: "Disclaimer: This app is for informational purposes only. Consult a doctor.",
    symptomInputHint: "Describe how you're feeling...",
    analyzeButon: "Analyze",
    locationWait: "Finding your location...",
    hospitalsNearby: "Hospitals & Pharmacies Nearby",
    noReminders: "No reminders set for today.",
    saveReminder: "Save Reminder",
    newReminder: "New Reminder",
    medicineName: "Medicine Name",
    dosageLabel: "Dosage (e.g. 1 pill)",
    timeLabel: "Time",
    switchToKhmer: "ប្តូរទៅភាសាខ្មែរ",
    instruction: "Instructions (e.g. After meal)",
    schedule: "Schedule (e.g. Daily)",
    duration: "Duration (e.g. 7 days)",
    addTime: "Add Time",
    uploadPhoto: "Upload Photo",
    history: "History",
    adherence: "Adherence",
    streak: "Streak",
    missed: "Missed",
    taken: "Taken",
    aboutVision: "Our Vision",
    aboutVisionDesc: "«To elevate the quality of life and digital healthcare in Cambodia by making medical guidance accessible, reliable, and timely for everyone, everywhere.» CamHealth aims to be the leading mobile health platform in Cambodia, bridging the gap between patients and healthcare providers. By putting medical accessibility directly into the palm of the user's hand, we empower Cambodians to understand their health symptoms instantly and navigate the local healthcare ecosystem with confidence. ",
    aboutCreators: "Founder’s Vision",
    aboutCreatorsDesc: "Built by healthcare technology enthusiasts dedicated to improving health literacy in Cambodia.",
    aboutAdvantages: "Key Advantages",
    aboutAdvantagesList1: "Instant Preliminary Insights (AI-Powered Symptom Checker): Reduces anxiety and prevents self-diagnosis misinformation by giving users a safe, immediate, and structured understanding of their symptoms before they visit a doctor.",
    aboutAdvantagesList2: "Optimized Travel & Emergency Response (Location-Based Finder): Saves critical time and costs by instantly locating the nearest verified hospitals, clinics, and pharmacies using precise GPS and interactive map routing.",
    aboutAdvantagesList3: "Enhanced Treatment Adherence (Smart Medication Reminder): Protects patient health—especially for the elderly or those with chronic illnesses—by ensuring medications are taken consistently and exactly as prescribed via automated alerts.",
    aboutAdvantagesList4: "Tailored for Cambodia (Khmer Localization & Offline Capability): Eliminates language barriers with an intuitive, native Khmer UI and features built-in offline capabilities so vital functions still work in areas with unstable internet connectivity.",
    recentSearches: "Recent Searches",
    listen: "Listen",
    voiceInput: "Voice Input",
    profile: "Profile",
    userProfile: "User Profile",
    dob: "Date of Birth",
    gender: "Gender",
    bloodType: "Blood Type",
    height: "Height (cm)",
    weight: "Weight (kg)",
    allergies: "Allergies & Sensitivities",
    chronicConditions: "Chronic Conditions",
    generalNotes: "General Medical Notes",
    lockApp: "Lock App",
    privacyAlert: "Data Privacy & Compliance",
    consentLabel: "I agree to store my health records locally under medical data security standards.",
    saveProfile: "Save Profile Information",
    setupPin: "Setup 6-Digit PIN",
    changePin: "Change 6-Digit PIN",
    enterPin: "Enter 6-Digit PIN to Unlock",
    pincode: "PIN Code",
    registerProfile: "Setup Your Profile",
    notMatch: "PINs do not match!",
    incorrectPin: "Incorrect PIN code!",
    authorized: "PIN Verified Successfully",
    adherenceOverview: "Medication Compliance",
    userName: "Full Name",
    userPhoto: "Profile Picture",
    healthCompliance: "Data Privacy & HIPAA Compliance Statement: Your medical files, medication times, and diagnostics are saved strictly locally on this device in an offline encrypted format. CamHealth does not send any sensitive health data to external cloud services.",
    basicInfo: "Basic Information",
    medicalHistory: "Medical History",
    pinReset: "Manage PIN Code",
    allSchedule: "All Schedule",
    today: "Today",
    ongoing: "Ongoing",
    backToList: "Back to List",
    confirmClear: "Confirm Clear?",
    setupFirstTreatment: "Setup First Treatment",
    noLogsYet: "No logs yet.",
    todaysSchedule: "Today's Schedule",
    pillsDue: "pills due",
    completed: "Completed",
    scheduled: "Scheduled",
    take: "Take",
    skip: "Skip",
    healthScore: "Health Score",
    clearAll: "Clear All",
    refresh: "Refresh",
  },
  km: {
    appTitle: "CamHealth-ខេមហេល",
    home: "ទំព័រដើម",
    symptoms: "រោគសញ្ញា",
    map: "ផែនទី",
    reminders: "រំលឹកថ្នាំ",
    about: "អំពីយើង",
    goodMorning: "អរុណសួស្តី",
    goodAfternoon: "ទិវាសួស្តី",
    goodEvening: "សាយ័ណ្ហសួស្តី",
    welcome: "សូមស្វាគមន៍",
    greeting: "សួស្តី តើអ្នកមានអារម្មណ៍យ៉ាងណានៅថ្ងៃនេះ?",
    quickActions: "សកម្មភាពរហ័ស",
    checkSymptoms: "ពិនិត្យរោគសញ្ញា",
    findHospital: "ស្វែងរកមន្ទីរពេទ្យនៅជិតអ្នក",
    addReminder: "បន្ថែមការរំលឹកថ្នាំ",
    disclaimer: "ចំណាំ៖ កម្មវិធីនេះគឺសម្រាប់តែផ្តល់ព័ត៌មានបឋមប៉ុណ្ណោះ។ សូមពិគ្រោះជាមួយគ្រូពេទ្យ។",
    symptomInputHint: "ពិពណ៌នាពីអារម្មណ៍របស់អ្នក...",
    analyzeButon: "វិភាគ",
    locationWait: "កំពុងស្វែងរកទីតាំងរបស់អ្នក...",
    hospitalsNearby: "មន្ទីរពេទ្យ និងឱសថស្ថានក្បែរអ្នក",
    noReminders: "គ្មានការរំលឹកថ្នាំសម្រាប់ថ្ងៃនេះទេ។",
    saveReminder: "រក្សាទុកការរំលឹក",
    newReminder: "ការរំលឹកថ្មី",
    medicineName: "ឈ្មោះថ្នាំ",
    dosageLabel: "កម្រិត (ឧ. ១ គ្រាប់)",
    timeLabel: "ម៉ោង",
    switchToKhmer: "Switch to English",
    instruction: "សេចក្តីណែនាំ (ឧ. ក្រោយអាហារ)",
    schedule: "កាលវិភាគ (ឧ. រៀងរាល់ថ្ងៃ)",
    duration: "រយៈពេល (ឧ. ៧ ថ្ងៃ)",
    addTime: "បន្ថែមម៉ោង",
    uploadPhoto: "បញ្ចូលរូបថត",
    history: "ប្រវត្តិ",
    adherence: "ការគោរពតាម",
    streak: "ជាប់គ្នា",
    missed: "រំលង",
    taken: "បានលេប",
    aboutVision: "ចក្ខុវិស័យរបស់យើង",
    aboutVisionDesc: "«លើកកម្ពស់គុណភាពជីវិត និងការថែទាំសុខភាពបែបឌីជីថលនៅកម្ពុជា ឱ្យកាន់តែជឿនលឿន ងាយស្រួល និងរហ័សទាន់ពេលវេលាសម្រាប់ប្រជាជនខ្មែរគ្រប់រូប»  CamHealth មានគោលដៅក្លាយជាកម្មវិធីទូរស័ព្ទឈានមុខគេក្នុងប្រទេសកម្ពុជា ដែលលុបបំបាត់ឧបសគ្គរវាងអ្នកជំងឺ និងសេវាសុខាភិបាល ដោយបំប្លែងការថែទាំសុខភាពមកនៅលើស្មាតហ្វូន ជួយឱ្យប្រជាជនអាចយល់ដឹងពីសុខភាពខ្លួនឯង និងស្វែងរកជំនួយវេជ្ជសាស្ត្របានយ៉ាងឆាប់រហ័ស គ្រប់ពេលវេលា និងគ្រប់ទីកន្លែង។",
    aboutCreators: "គោលគំនិតរបស់អ្នកបង្កើតកម្មវិធី",
    aboutCreatorsDesc: "ក្នុងនាមជាស្ថាបនិកនៅពីក្រោយ CamHealth-ខេមហេល ខ្ញុំមានចក្ខុវិស័យក្នុងការកសាងវេទិកាសុខាភិបាលឌីជីថល ដែលភ្ជាប់ទំនាក់ទំនងរវាងសហគមន៍ និង សេវាសុខាភិបាលដែលអាចទុកចិត្តបាន និងបច្ចេកវិទ្យាទំនើប។ CamHealth បង្ហាញពីការប្តេជ្ញាចិត្តរបស់ខ្ញុំក្នុងការបង្កើតការគាំទ្រទៅលើផ្នែកសុខភាពដែលងាយស្រួល អាចទុកចិត្តបាន ដល់អ្នកប្រើប្រាស់។",
    aboutAdvantages: "អត្ថប្រយោជន៍ចម្បង",
    aboutAdvantagesList1: "ជួយវិនិច្ឆ័យរោគសញ្ញាបឋមបានរហ័ស (AI-Symptom Checker): ជួយកាត់បន្ថយការព្រួយបារម្ភ និងការយល់ច្រឡំលើប្រភេទទម្រង់ជំងឺ ដោយផ្តល់ការណែនាំសុខភាពបឋមមុនពេលទៅជួបគ្រូពេទ្យផ្ទាល់។",
    aboutAdvantagesList2: "សន្សំពេលវេលា និងថវិកា (Time & Cost Saving): ងាយស្រួលរកមន្ទីរពេទ្យ ឬឱសថស្ថានដែលនៅជិតខ្លួនបំផុតតាមរយៈ GPS និងមានប្លង់ផែនទីច្បាស់លាស់ មិនបាច់ចំណាយពេលរុករកយូរ និង មិនត្រូវការអុិនធឺណិត",
    aboutAdvantagesList3: "ង្កើនប្រសិទ្ធភាពនៃការញ៉ាំថ្នាំ (Smart Medication Reminder): ប្រព័ន្ធរំលឹកពេលលេបថ្នាំជួយឱ្យអ្នកជំងឺ (ជាពិសេសមនុស្សចាស់ ឬអ្នកមានជំងឺរ៉ាំរ៉ៃ) លេបថ្នាំបានត្រឹមត្រូវតាមវេជ្ជបញ្ជា និងទៀងទាត់ ដែលធ្វើឱ្យការព្យាបាលឆាប់ជាសះស្បើយ។",
    aboutAdvantagesList4: "ភាសាខ្មែរងាយស្រួលអាន និង ប្រើប្រាស់ (Khmer Localization): រចនាឡើងជាពិសេសសម្រាប់តម្រូវការប្រជាជនកម្ពុជា ងាយស្រួលអាន ងាយយល់ និងមានមុខងារដំណើរការទោះបីជាស្ថិតក្នុងតំបន់ដែលសេវាអ៊ីនធឺណិតខ្សោយក៏ដោយ។",
    recentSearches: "ការស្វែងរកចុងក្រោយ",
    listen: "ស្តាប់",
    voiceInput: "បញ្ចូលសំឡេង",
    profile: "ប្រវត្តិរូប",
    userProfile: "ប្រវត្តិរូបអ្នកប្រើប្រាស់",
    dob: "ថ្ងៃខែឆ្នាំកំណើត",
    gender: "ភេទ",
    bloodType: "ក្រុមឈាម",
    height: "កម្ពស់ (សង់ទីម៉ែត្រ)",
    weight: "ទម្ងន់ (គីឡូក្រាម)",
    allergies: "អាឡែកស៊ី និងប្រតិកម្ម",
    chronicConditions: "ជំងឺរ៉ាំរ៉ៃដទៃទៀត",
    generalNotes: "កំណត់ត្រាវេជ្ជសាស្ត្រទូទៅ",
    lockApp: "ចាក់សោកម្មវិធី",
    privacyAlert: "ឯកជនភាព និងការការពារទិន្នន័យ",
    consentLabel: "ខ្ញុំយល់ព្រមរក្សាទុកទិន្នន័យសុខភាពរបស់ខ្ញុំនៅលើឧបករណ៍នេះតាមស្តង់ដារសុវត្ថិភាព។",
    saveProfile: "រក្សាទុកព័ត៌មានប្រវត្តិរូប",
    setupPin: "បង្កើតលេខកូដសម្ងាត់ ៦ខ្ទង់",
    changePin: "ផ្លាស់ប្តូរលេខកូដសម្ងាត់ ៦ខ្ទង់",
    enterPin: "បញ្ចូលលេខកូដសម្ងាត់ ៦ខ្ទង់ ដើម្បីបើកកម្មវិធី",
    pincode: "លេខកូដសម្ងាត់",
    registerProfile: "ដំឡើងប្រវត្តិរូបរបស់អ្នក",
    notMatch: "លេខកូដសម្ងាត់មិនត្រូវគ្នាទេ!",
    incorrectPin: "លេខកូដសម្ងាត់មិនត្រឹមត្រូវទេ!",
    authorized: "បានផ្ទៀងភាពលេខកូដជោគជ័យ",
    adherenceOverview: "ការគោរពវិន័យលេបថ្នាំ",
    userName: "ឈ្មោះពេញ",
    userPhoto: "រូបថតប្រវត្តិរូប",
    healthCompliance: "សេចក្តីថ្លែងការណ៍ស្តីពីភាពឯកជននៃទិន្នន័យ៖ ឯកសារវេជ្ជសាស្ត្រ ពេលវេលាលេបថ្នាំ និងការវិភាគរោគសញ្ញារបស់អ្នកត្រូវបានរក្សាទុកតែនៅលើឧបករណ៍នេះប៉ុណ្ណោះ។ CamHealth មិនបញ្ជូនទិន្នន័យសុខភាពណាមួយទៅកាន់ជំនួយខាងក្រៅឡើយ។",
    basicInfo: "ព័ត៌មានមូលដ្ឋាន",
    medicalHistory: "ប្រវត្តិវេជ្ជសាស្ត្រ",
    pinReset: "គ្រប់គ្រងលេខកូដ PIN",
    allSchedule: "កាលវិភាគទាំងអស់",
    today: "ថ្ងៃនេះ",
    ongoing: "កំពុងបន្ត",
    backToList: "ត្រឡប់ទៅបញ្ជី",
    confirmClear: "បញ្ជាក់ការលុប?",
    setupFirstTreatment: "រៀបចំថ្នាំដំបូង",
    noLogsYet: "មិនទាន់មានកំណត់ត្រាទេ",
    todaysSchedule: "កាលវិភាគថ្ងៃនេះ",
    pillsDue: "គ្រាប់ថ្នាំត្រូវលេប",
    completed: "បានលេប",
    scheduled: "បានកំណត់",
    take: "លេប",
    skip: "រំលង",
    healthScore: "ពិន្ទុសុខភាព",
    clearAll: "លុបទិន្នន័យ",
    refresh: "ផ្ទុកឡើងវិញ",
  }
};

/**
 * Ko'p tilli tizim (i18n)
 * Qo'llab-quvvatlanadigan tillar: uz (standart), ru, en
 *
 * Foydalanish:
 *   const { t, lang, setLang } = useI18n()
 *   t('nav.dissertations') => "Dissertatsiyalar"
 */
import { create } from "zustand";

export type Lang = "uz" | "ru" | "en";

// ─── Tarjimalar ───────────────────────────────────────────────────────────────

const translations: Record<Lang, Record<string, string>> = {
  uz: {
    // Navigatsiya
    "nav.dashboard": "Bosh sahifa",
    "nav.dissertations": "Dissertatsiyalar",
    "nav.users": "Foydalanuvchilar",
    "nav.catalogs": "Kataloglar",
    "nav.countries": "Mamlakatlar",
    "nav.universities": "Universitetlar",
    "nav.directions": "Ilmiy yo'nalishlar",
    "nav.regions": "Regionlar",
    "nav.districts": "Tumanlar",
    "nav.ai": "AI Yordamchi",
    "nav.settings": "Sozlamalar",

    // Auth
    "auth.login": "Kirish",
    "auth.logout": "Chiqish",
    "auth.username": "Foydalanuvchi nomi",
    "auth.password": "Parol",
    "auth.loginBtn": "Tizimga kirish",
    "auth.loginError": "Login yoki parol noto'g'ri",

    // Umumiy
    "common.save": "Saqlash",
    "common.cancel": "Bekor qilish",
    "common.delete": "O'chirish",
    "common.edit": "Tahrirlash",
    "common.add": "Qo'shish",
    "common.search": "Qidirish",
    "common.filter": "Filter",
    "common.loading": "Yuklanmoqda...",
    "common.noData": "Ma'lumot topilmadi",
    "common.confirm": "Tasdiqlash",
    "common.actions": "Amallar",
    "common.status": "Holat",
    "common.createdAt": "Yaratilgan",
    "common.updatedAt": "Yangilangan",
    "common.name": "Nomi",
    "common.description": "Tavsif",
    "common.code": "Kod",
    "common.yes": "Ha",
    "common.no": "Yo'q",
    "common.total": "Jami",
    "common.page": "Sahifa",
    "common.of": "dan",
    "common.rows": "qator",
    "common.nameUz": "O'zbekcha nom",
    "common.nameRu": "Ruscha nom",
    "common.nameEn": "Inglizcha nom",
    "common.success": "Muvaffaqiyat",
    "common.error": "Xato",
    "common.deleteConfirm": "Haqiqatan ham o'chirishni xohlaysizmi?",

    // Dashboard
    "dashboard.title": "Bosh sahifa",
    "dashboard.totalDissertations": "Jami dissertatsiyalar",
    "dashboard.pendingReview": "Ko'rib chiqilmoqda",
    "dashboard.approvedProposals": "Tasdiqlangan",
    "dashboard.expertMentors": "Ilmiy rahbarlar",
    "dashboard.recentActivity": "So'nggi faoliyat",

    // Dissertatsiyalar
    "dissertation.title": "Dissertatsiya nomi",
    "dissertation.author": "Muallif",
    "dissertation.supervisor": "Ilmiy rahbar",
    "dissertation.university": "Universitet",
    "dissertation.direction": "Ilmiy yo'nalish",
    "dissertation.keywords": "Kalit so'zlar",
    "dissertation.problem": "Muammo",
    "dissertation.proposal": "Taklif",
    "dissertation.annotation": "Annotatsiya",
    "dissertation.conclusion": "Xulosa",
    "dissertation.defenseDate": "Himoya sanasi",
    "dissertation.status": "Holat",
    "dissertation.addNew": "Yangi dissertatsiya",
    "dissertation.list": "Dissertatsiyalar ro'yxati",
    "dissertation.view": "Ko'rish",
    "dissertation.files": "Fayllar",
    "dissertation.autoreferat": "Autoreferat",
    "dissertation.dissertationPdf": "Dissertatsiya (PDF)",
    "dissertation.dissertationWord": "Dissertatsiya (DOCX)",
    "dissertation.download": "Yuklab olish",
    "dissertation.preview": "Ko'rib chiqish",
    "dissertation.country": "Mamlakat",
    "dissertation.region": "Region",
    "dissertation.category": "Kategoriya",
    "dissertation.expertRating": "Ekspert bahosi",

    // Status
    "status.draft": "Qoralama",
    "status.pending": "Ko'rib chiqilmoqda",
    "status.approved": "Tasdiqlangan",
    "status.rejected": "Rad etilgan",
    "status.defended": "Himoya qilingan",

    // Wizard bosqichlari
    "wizard.step1": "Asosiy ma'lumotlar",
    "wizard.step2": "Ilmiy tasnif",
    "wizard.step3": "Kalit so'zlar va annotatsiya",
    "wizard.step4": "Muallif ma'lumotlari",
    "wizard.step5": "Fayllar",
    "wizard.step6": "Tasdiqlash",
    "wizard.next": "Keyingisi",
    "wizard.prev": "Oldingisi",
    "wizard.submit": "Yuborish",
    "wizard.stepOf": "{current} / {total} bosqich",

    // Muallif tanlash
    "author.select": "Muallifni tanlang",
    "author.createNew": "Yangi muallif yaratish",
    "author.byName": "To'liq ism bilan",
    "author.byPin": "JSHSHIR bilan",
    "author.byPassport": "Pasport ma'lumotlari bilan",
    "author.firstName": "Ism",
    "author.lastName": "Familiya",
    "author.middleName": "Otasining ismi",
    "author.pin": "JSHSHIR (14 raqam)",
    "author.passportSeries": "Pasport seriyasi (AA)",
    "author.passportNumber": "Pasport raqami (7 raqam)",
    "author.birthDate": "Tug'ilgan sana",
    "author.fetchInfo": "Ma'lumot olish",
    "author.selfSubmit": "Men o'zim muallif",

    // Fayl yuklash
    "upload.dragDrop": "Faylni bu yerga torting yoki bosing",
    "upload.acceptedFormats": "Qabul qilinadigan formatlar: PDF, DOCX, TXT",
    "upload.maxSize": "Maksimal hajm: 50 MB",
    "upload.uploading": "Yuklanmoqda...",
    "upload.processing": "Qayta ishlanmoqda...",
    "upload.success": "Fayl muvaffaqiyatli yuklandi",
    "upload.error": "Fayl yuklashda xato",

    // Kataloglar
    "catalog.countries": "Mamlakatlar",
    "catalog.universities": "Universitetlar",
    "catalog.directions": "Ilmiy yo'nalishlar",
    "catalog.regions": "Regionlar",
    "catalog.districts": "Tumanlar",
    "catalog.addCountry": "Mamlakat qo'shish",
    "catalog.addUniversity": "Universitet qo'shish",
    "catalog.addDirection": "Yo'nalish qo'shish",
    "catalog.addRegion": "Region qo'shish",
    "catalog.country": "Mamlakat",
    "catalog.region": "Region",
    "catalog.shortName": "Qisqa nom",

    // Foydalanuvchilar
    "users.list": "Foydalanuvchilar ro'yxati",
    "users.add": "Foydalanuvchi qo'shish",
    "users.username": "Login",
    "users.email": "Email",
    "users.role": "Rol",
    "users.active": "Faol",

    // Rollar
    "role.admin": "Administrator",
    "role.moderator": "Moderator",
    "role.doctorant": "Doktorant",
    "role.supervisor": "Ilmiy rahbar",
    "role.employee": "Xodim",

    // AI
    "ai.title": "AI Tadqiqot Yordamchisi",
    "ai.placeholder": "Savolingizni kiriting...",
    "ai.send": "Yuborish",
    "ai.thinking": "O'ylanmoqda...",
    "ai.similarDissertations": "O'xshash dissertatsiyalar",
    "ai.gaps": "Ilmiy bo'shliqlar",
    "ai.analyzeKeywords": "Kalit so'zlarni tahlil qilish",
    "ai.suggestions": "Tavsiyalar",

    // Xatolar
    "error.required": "Bu maydon to'ldirilishi shart",
    "error.minLength": "Kamida {min} ta belgi kiriting",
    "error.invalidEmail": "Email formati noto'g'ri",
    "error.networkError": "Tarmoq xatosi. Qaytadan urinib ko'ring.",
    "error.unauthorized": "Kirish huquqi yo'q",
    "error.notFound": "Ma'lumot topilmadi",
    "error.serverError": "Server xatosi",
  },

  ru: {
    // Navigatsiya
    "nav.dashboard": "Главная",
    "nav.dissertations": "Диссертации",
    "nav.users": "Пользователи",
    "nav.catalogs": "Справочники",
    "nav.countries": "Страны",
    "nav.universities": "Университеты",
    "nav.directions": "Научные направления",
    "nav.regions": "Регионы",
    "nav.districts": "Районы",
    "nav.ai": "ИИ Помощник",
    "nav.settings": "Настройки",

    "auth.login": "Войти",
    "auth.logout": "Выйти",
    "auth.username": "Имя пользователя",
    "auth.password": "Пароль",
    "auth.loginBtn": "Войти в систему",
    "auth.loginError": "Неверный логин или пароль",

    "common.save": "Сохранить",
    "common.cancel": "Отмена",
    "common.delete": "Удалить",
    "common.edit": "Редактировать",
    "common.add": "Добавить",
    "common.search": "Поиск",
    "common.filter": "Фильтр",
    "common.loading": "Загрузка...",
    "common.noData": "Данные не найдены",
    "common.confirm": "Подтвердить",
    "common.actions": "Действия",
    "common.status": "Статус",
    "common.createdAt": "Создано",
    "common.updatedAt": "Обновлено",
    "common.name": "Название",
    "common.description": "Описание",
    "common.code": "Код",
    "common.yes": "Да",
    "common.no": "Нет",
    "common.total": "Всего",
    "common.page": "Страница",
    "common.of": "из",
    "common.rows": "строк",
    "common.nameUz": "Название на узбекском",
    "common.nameRu": "Название на русском",
    "common.nameEn": "Название на английском",
    "common.success": "Успех",
    "common.error": "Ошибка",
    "common.deleteConfirm": "Вы действительно хотите удалить?",

    "dashboard.title": "Главная",
    "dashboard.totalDissertations": "Всего диссертаций",
    "dashboard.pendingReview": "На рассмотрении",
    "dashboard.approvedProposals": "Одобрено",
    "dashboard.expertMentors": "Научные руководители",
    "dashboard.recentActivity": "Последние действия",

    "dissertation.title": "Название диссертации",
    "dissertation.author": "Автор",
    "dissertation.supervisor": "Научный руководитель",
    "dissertation.university": "Университет",
    "dissertation.direction": "Научное направление",
    "dissertation.keywords": "Ключевые слова",
    "dissertation.problem": "Проблема",
    "dissertation.proposal": "Предложение",
    "dissertation.annotation": "Аннотация",
    "dissertation.conclusion": "Заключение",
    "dissertation.defenseDate": "Дата защиты",
    "dissertation.status": "Статус",
    "dissertation.addNew": "Новая диссертация",
    "dissertation.list": "Список диссертаций",
    "dissertation.view": "Просмотр",
    "dissertation.files": "Файлы",
    "dissertation.autoreferat": "Автореферат",
    "dissertation.dissertationPdf": "Диссертация (PDF)",
    "dissertation.dissertationWord": "Диссертация (DOCX)",
    "dissertation.download": "Скачать",
    "dissertation.preview": "Просмотр",
    "dissertation.country": "Страна",
    "dissertation.region": "Регион",
    "dissertation.category": "Категория",
    "dissertation.expertRating": "Оценка эксперта",

    "status.draft": "Черновик",
    "status.pending": "На рассмотрении",
    "status.approved": "Одобрено",
    "status.rejected": "Отклонено",
    "status.defended": "Защищено",

    "wizard.step1": "Основная информация",
    "wizard.step2": "Научная классификация",
    "wizard.step3": "Ключевые слова и аннотация",
    "wizard.step4": "Данные об авторе",
    "wizard.step5": "Файлы",
    "wizard.step6": "Подтверждение",
    "wizard.next": "Далее",
    "wizard.prev": "Назад",
    "wizard.submit": "Отправить",
    "wizard.stepOf": "Шаг {current} из {total}",

    "author.select": "Выберите автора",
    "author.createNew": "Создать нового автора",
    "author.byName": "По ФИО",
    "author.byPin": "По ПИНФЛ",
    "author.byPassport": "По паспортным данным",
    "author.firstName": "Имя",
    "author.lastName": "Фамилия",
    "author.middleName": "Отчество",
    "author.pin": "ПИНФЛ (14 цифр)",
    "author.passportSeries": "Серия паспорта (AA)",
    "author.passportNumber": "Номер паспорта (7 цифр)",
    "author.birthDate": "Дата рождения",
    "author.fetchInfo": "Получить данные",
    "author.selfSubmit": "Я сам автор",

    "upload.dragDrop": "Перетащите файл сюда или нажмите",
    "upload.acceptedFormats": "Принимаемые форматы: PDF, DOCX, TXT",
    "upload.maxSize": "Максимальный размер: 50 МБ",
    "upload.uploading": "Загружается...",
    "upload.processing": "Обрабатывается...",
    "upload.success": "Файл успешно загружен",
    "upload.error": "Ошибка загрузки файла",

    "catalog.countries": "Страны",
    "catalog.universities": "Университеты",
    "catalog.directions": "Научные направления",
    "catalog.regions": "Регионы",
    "catalog.districts": "Районы",
    "catalog.addCountry": "Добавить страну",
    "catalog.addUniversity": "Добавить университет",
    "catalog.addDirection": "Добавить направление",
    "catalog.addRegion": "Добавить регион",
    "catalog.country": "Страна",
    "catalog.region": "Регион",
    "catalog.shortName": "Краткое название",

    "users.list": "Список пользователей",
    "users.add": "Добавить пользователя",
    "users.username": "Логин",
    "users.email": "Email",
    "users.role": "Роль",
    "users.active": "Активен",

    "role.admin": "Администратор",
    "role.moderator": "Модератор",
    "role.doctorant": "Докторант",
    "role.supervisor": "Научный руководитель",
    "role.employee": "Сотрудник",

    "ai.title": "ИИ Научный помощник",
    "ai.placeholder": "Введите ваш вопрос...",
    "ai.send": "Отправить",
    "ai.thinking": "Думаю...",
    "ai.similarDissertations": "Похожие диссертации",
    "ai.gaps": "Научные пробелы",
    "ai.analyzeKeywords": "Анализ ключевых слов",
    "ai.suggestions": "Рекомендации",

    "error.required": "Это поле обязательно",
    "error.minLength": "Введите минимум {min} символов",
    "error.invalidEmail": "Неверный формат email",
    "error.networkError": "Ошибка сети. Попробуйте снова.",
    "error.unauthorized": "Нет доступа",
    "error.notFound": "Данные не найдены",
    "error.serverError": "Ошибка сервера",
  },

  en: {
    "nav.dashboard": "Dashboard",
    "nav.dissertations": "Dissertations",
    "nav.users": "Users",
    "nav.catalogs": "Catalogs",
    "nav.countries": "Countries",
    "nav.universities": "Universities",
    "nav.directions": "Scientific Directions",
    "nav.regions": "Regions",
    "nav.districts": "Districts",
    "nav.ai": "AI Assistant",
    "nav.settings": "Settings",

    "auth.login": "Login",
    "auth.logout": "Logout",
    "auth.username": "Username",
    "auth.password": "Password",
    "auth.loginBtn": "Sign In",
    "auth.loginError": "Invalid username or password",

    "common.save": "Save",
    "common.cancel": "Cancel",
    "common.delete": "Delete",
    "common.edit": "Edit",
    "common.add": "Add",
    "common.search": "Search",
    "common.filter": "Filter",
    "common.loading": "Loading...",
    "common.noData": "No data found",
    "common.confirm": "Confirm",
    "common.actions": "Actions",
    "common.status": "Status",
    "common.createdAt": "Created",
    "common.updatedAt": "Updated",
    "common.name": "Name",
    "common.description": "Description",
    "common.code": "Code",
    "common.yes": "Yes",
    "common.no": "No",
    "common.total": "Total",
    "common.page": "Page",
    "common.of": "of",
    "common.rows": "rows",
    "common.nameUz": "Uzbek name",
    "common.nameRu": "Russian name",
    "common.nameEn": "English name",
    "common.success": "Success",
    "common.error": "Error",
    "common.deleteConfirm": "Are you sure you want to delete?",

    "dashboard.title": "Dashboard",
    "dashboard.totalDissertations": "Total Dissertations",
    "dashboard.pendingReview": "Pending Review",
    "dashboard.approvedProposals": "Approved",
    "dashboard.expertMentors": "Scientific Supervisors",
    "dashboard.recentActivity": "Recent Activity",

    "dissertation.title": "Dissertation Title",
    "dissertation.author": "Author",
    "dissertation.supervisor": "Supervisor",
    "dissertation.university": "University",
    "dissertation.direction": "Scientific Direction",
    "dissertation.keywords": "Keywords",
    "dissertation.problem": "Problem",
    "dissertation.proposal": "Proposal",
    "dissertation.annotation": "Annotation",
    "dissertation.conclusion": "Conclusion",
    "dissertation.defenseDate": "Defense Date",
    "dissertation.status": "Status",
    "dissertation.addNew": "New Dissertation",
    "dissertation.list": "Dissertation List",
    "dissertation.view": "View",
    "dissertation.files": "Files",
    "dissertation.autoreferat": "Autoreferat",
    "dissertation.dissertationPdf": "Dissertation (PDF)",
    "dissertation.dissertationWord": "Dissertation (DOCX)",
    "dissertation.download": "Download",
    "dissertation.preview": "Preview",
    "dissertation.country": "Country",
    "dissertation.region": "Region",
    "dissertation.category": "Category",
    "dissertation.expertRating": "Expert Rating",

    "status.draft": "Draft",
    "status.pending": "Pending",
    "status.approved": "Approved",
    "status.rejected": "Rejected",
    "status.defended": "Defended",

    "wizard.step1": "Basic Information",
    "wizard.step2": "Scientific Classification",
    "wizard.step3": "Keywords & Abstract",
    "wizard.step4": "Author Information",
    "wizard.step5": "File Uploads",
    "wizard.step6": "Confirmation",
    "wizard.next": "Next",
    "wizard.prev": "Previous",
    "wizard.submit": "Submit",
    "wizard.stepOf": "Step {current} of {total}",

    "author.select": "Select Author",
    "author.createNew": "Create New Author",
    "author.byName": "By Full Name",
    "author.byPin": "By PIN (JSHSHIR)",
    "author.byPassport": "By Passport",
    "author.firstName": "First Name",
    "author.lastName": "Last Name",
    "author.middleName": "Middle Name",
    "author.pin": "PIN (14 digits)",
    "author.passportSeries": "Passport Series (AA)",
    "author.passportNumber": "Passport Number (7 digits)",
    "author.birthDate": "Date of Birth",
    "author.fetchInfo": "Fetch Information",
    "author.selfSubmit": "I am the author",

    "upload.dragDrop": "Drag and drop file here or click",
    "upload.acceptedFormats": "Accepted formats: PDF, DOCX, TXT",
    "upload.maxSize": "Maximum size: 50 MB",
    "upload.uploading": "Uploading...",
    "upload.processing": "Processing...",
    "upload.success": "File uploaded successfully",
    "upload.error": "File upload error",

    "catalog.countries": "Countries",
    "catalog.universities": "Universities",
    "catalog.directions": "Scientific Directions",
    "catalog.regions": "Regions",
    "catalog.districts": "Districts",
    "catalog.addCountry": "Add Country",
    "catalog.addUniversity": "Add University",
    "catalog.addDirection": "Add Direction",
    "catalog.addRegion": "Add Region",
    "catalog.country": "Country",
    "catalog.region": "Region",
    "catalog.shortName": "Short Name",

    "users.list": "User List",
    "users.add": "Add User",
    "users.username": "Username",
    "users.email": "Email",
    "users.role": "Role",
    "users.active": "Active",

    "role.admin": "Administrator",
    "role.moderator": "Moderator",
    "role.doctorant": "Doctoral Researcher",
    "role.supervisor": "Scientific Supervisor",
    "role.employee": "Employee",

    "ai.title": "AI Research Assistant",
    "ai.placeholder": "Enter your question...",
    "ai.send": "Send",
    "ai.thinking": "Thinking...",
    "ai.similarDissertations": "Similar Dissertations",
    "ai.gaps": "Research Gaps",
    "ai.analyzeKeywords": "Analyze Keywords",
    "ai.suggestions": "Suggestions",

    "error.required": "This field is required",
    "error.minLength": "Enter at least {min} characters",
    "error.invalidEmail": "Invalid email format",
    "error.networkError": "Network error. Please try again.",
    "error.unauthorized": "Unauthorized",
    "error.notFound": "Not found",
    "error.serverError": "Server error",
  },
};

// ─── Zustand Store ─────────────────────────────────────────────────────────────

interface I18nState {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
}

const getInitialLang = (): Lang => {
  if (typeof window === "undefined") return "uz";
  const stored = localStorage.getItem("lang") as Lang | null;
  return stored && ["uz", "ru", "en"].includes(stored) ? stored : "uz";
};

export const useI18n = create<I18nState>((set, get) => ({
  lang: "uz",

  setLang: (lang: Lang) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("lang", lang);
    }
    set({ lang });
  },

  t: (key: string, vars?: Record<string, string | number>): string => {
    const { lang } = get();
    const dict = translations[lang] || translations.uz;
    let text = dict[key] ?? translations.uz[key] ?? key;

    if (vars) {
      Object.entries(vars).forEach(([k, v]) => {
        text = text.replace(`{${k}}`, String(v));
      });
    }

    return text;
  },
}));

// LocalStorage dan til o'qish (client-side init)
if (typeof window !== "undefined") {
  const stored = getInitialLang();
  useI18n.setState({ lang: stored });
}

export const normalizeLanguage = (language) => {
    if (!language) return "en";

    const lang = String(language).toLowerCase();

    if (lang === "km" || lang === "kh" || lang === "khmer") return "km";
    if (lang === "zh" || lang === "cn" || lang === "china" || lang === "chinese") return "zh";

    return "en";
};

export const creatorRequestTranslations = {
    en: {
        pageTitle: "Creator Request",
        pageSubTitle: "Join our vibrant community. Share your moments, build your audience today.",
        section1Title: "Show off your vibe",
        required: "(Required)",
        aboutYourself: "About yourself",
        aboutRequired: "Please tell about yourself",
        yourLocation: "Your Location",
        selectLocation: "Please select your location",
        contentType: "Content Type",
        selectContentType: "Please select content type",
        section2Title: "How can we reach you?",
        enterPhone: "Enter phone number",
        phoneRequired: "Please enter phone number",
        sameAsPhone: "Same as phone",
        enterTelegram: "Enter Telegram phone number",
        section3Title: "Drop your links",
        requiredOneLink: "(Required at least one link)",
        socialSubTitle: "Add your existing channels so we can check out your awesome content.",
        tiktok: "TikTok Profile Link",
        facebook: "Facebook Profile/Page Link",
        instagram: "Instagram Profile Link",
        youtube: "YouTube Channel Link",
        otherLink: "Other Portfolio or Website Link",
        atLeastOneLink: "Please enter at least one link",
        submitSuccess: "Creator request submitted successfully",
        submitFail: "Failed to submit creator request",
        submitBtn: "Submit Request",
        contentTypes: [
            "Travel & Adventure",
            "Activities & Entertainment",
            "Food & Drinks",
            "Services & Products",
        ],
    },
    km: {
        pageTitle: "ស្នើសុំជា Creator",
        pageSubTitle: "ចូលរួមជាមួយសហគមន៍របស់យើង។ ចែករំលែកមាតិការបស់អ្នក និងបង្កើនអ្នកតាមដានរបស់អ្នក។",
        section1Title: "បង្ហាញស្ទាយ៍របស់អ្នក",
        required: "(តម្រូវ)",
        aboutYourself: "អំពីខ្លួនអ្នក",
        aboutRequired: "សូមបញ្ជាក់អំពីខ្លួនអ្នក",
        yourLocation: "ទីតាំងរបស់អ្នក",
        selectLocation: "សូមជ្រើសរើសទីតាំងរបស់អ្នក",
        contentType: "ប្រភេទមាតិកា",
        selectContentType: "សូមជ្រើសរើសប្រភេទមាតិកា",
        section2Title: "តើយើងអាចទាក់ទងអ្នកដោយរបៀបណា?",
        enterPhone: "បញ្ចូលលេខទូរស័ព្ទ",
        phoneRequired: "សូមបញ្ចូលលេខទូរស័ព្ទ",
        sameAsPhone: "ដូចលេខទូរស័ព្ទ",
        enterTelegram: "បញ្ចូលលេខ Telegram",
        section3Title: "ដាក់តំណភ្ជាប់របស់អ្នក",
        requiredOneLink: "(តម្រូវយ៉ាងតិច ១ តំណ)",
        socialSubTitle: "បន្ថែមឆានែលរបស់អ្នក ដើម្បីឱ្យយើងអាចពិនិត្យមើលមាតិការបស់អ្នកបាន។",
        tiktok: "តំណ TikTok",
        facebook: "តំណ Facebook Profile/Page",
        instagram: "តំណ Instagram",
        youtube: "តំណ YouTube Channel",
        otherLink: "តំណ Website ឬ Portfolio ផ្សេងទៀត",
        atLeastOneLink: "សូមបញ្ចូលយ៉ាងតិច ១ តំណ",
        submitSuccess: "បានផ្ញើសំណើ Creator ដោយជោគជ័យ",
        submitFail: "បរាជ័យក្នុងការផ្ញើសំណើ Creator",
        submitBtn: "ផ្ញើសំណើ",
        contentTypes: [
            "ដំណើរកំសាន្ត និង ផ្សងព្រេង",
            "សកម្មភាព និង កម្សាន្ត",
            "អាហារ និង ភេសជ្ជៈ",
            "សេវាកម្ម និង ផលិតផល",
        ],
    },
    zh: {
        pageTitle: "创作者申请",
        pageSubTitle: "加入我们的社区，分享你的精彩内容，建立你的受众。",
        section1Title: "展示你的风格",
        required: "(必填)",
        aboutYourself: "关于你自己",
        aboutRequired: "请介绍一下你自己",
        yourLocation: "你的地区",
        selectLocation: "请选择你的地区",
        contentType: "内容类型",
        selectContentType: "请选择内容类型",
        section2Title: "我们如何联系你？",
        enterPhone: "输入电话号码",
        phoneRequired: "请输入电话号码",
        sameAsPhone: "与手机号相同",
        enterTelegram: "输入 Telegram 电话号码",
        section3Title: "填写你的链接",
        requiredOneLink: "(至少需要一个链接)",
        socialSubTitle: "添加你现有的频道，方便我们查看你的精彩内容。",
        tiktok: "TikTok 主页链接",
        facebook: "Facebook 主页/页面链接",
        instagram: "Instagram 主页链接",
        youtube: "YouTube 频道链接",
        otherLink: "其他网站或作品集链接",
        atLeastOneLink: "请至少输入一个链接",
        submitSuccess: "创作者申请提交成功",
        submitFail: "提交创作者申请失败",
        submitBtn: "提交申请",
        contentTypes: [
            "旅行与冒险",
            "活动与娱乐",
            "美食与饮品",
            "服务与产品",
        ],
    },
};

export const provinceBottomSheetTranslations = {
    en: {
        title: "Province",
        searchPlaceholder: "Search province",
        loading: "Loading...",
        empty: "Province not found",
        confirm: "Confirm",
    },
    km: {
        title: "ខេត្ត",
        searchPlaceholder: "ស្វែងរកខេត្ត",
        loading: "កំពុងផ្ទុក...",
        empty: "រកមិនឃើញខេត្ត",
        confirm: "បញ្ជាក់",
    },
    zh: {
        title: "省份",
        searchPlaceholder: "搜索省份",
        loading: "加载中...",
        empty: "未找到省份",
        confirm: "确认",
    },
};

export const getCreatorRequestTranslate = (language = "en") => {
    const lang = normalizeLanguage(language);
    return creatorRequestTranslations[lang] || creatorRequestTranslations.en;
};

export const getProvinceBottomSheetTranslate = (language = "en") => {
    const lang = normalizeLanguage(language);
    return provinceBottomSheetTranslations[lang] || provinceBottomSheetTranslations.en;
};
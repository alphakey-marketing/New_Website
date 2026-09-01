---
type: PageLayout
title: Home
colors: colors-a
backgroundImage:
  type: BackgroundImage
  url: /images/bg1.jpg
  backgroundSize: cover
  backgroundPosition: center
  backgroundRepeat: no-repeat
  opacity: 75
sections:
  - elementId: ''
    colors: colors-f
    backgroundSize: full
    title: "冇時間搵客？我用8年經驗同AI，幫你嘅生意搵返啲客，同埋慳返你嘅時間"
    subtitle: >-
      我叫 Key，一個人做marketing做咗8年，而家用AI令自己快過一支team。


      你嘅對手可能已經用緊AI搶緊你嘅客 —— 我幫你手起刀落追返嚟，甚至反超前。


      唔使請一隊人，唔使自己捱晒啲時間做marketing。我有兩套方法，睇你而家喺邊個階段。
    styles:
      self:
        height: auto
        width: wide
        margin:
          - mt-0
          - mb-0
          - ml-0
          - mr-0
        padding:
          - pt-36
          - pb-48
          - pl-4
          - pr-4
        flexDirection: row-reverse
        textAlign: left
    type: HeroSection
    actions:
      - type: Button
        label: "睇下邊套岩我 👇"
        url: "/zh#tiers"
        style: secondary
  - type: TextSection
    elementId: proof
    colors: colors-f
    subtitle: "點解要信我"
    text: |
      過去8年，我幫唔同企業做到三位數營收增長 —— 靠嘅係細心市場分析同嚴謹執行，唔係好彩。*(具體數字喺下面案例入面)*

      > 「我啲檔期爆到有waiting list，做marketing終於唔再係我嘅頭痛。」
      > —— 一位催眠治療師客戶，[睇個案例 →](/zh/projects/project-one)

      依家我將呢套經驗配AI，幫你唔使成日諗「點樣搵多啲客」，亦唔使自己捱時間做，就搞得掂。
    styles:
      self:
        height: auto
        width: wide
        padding:
          - pt-16
          - pb-16
          - pl-4
          - pr-4
        textAlign: center
  - colors: colors-f
    type: FeaturedProjectsSection
    elementId: case-studies
    subtitle: "實際成效 —— 唔講得個「like」字"
    actions:
      - type: Link
        label: 睇晒所有項目
        url: /zh/projects
    showDate: false
    showDescription: true
    showFeaturedImage: true
    showReadMoreLink: true
    variant: variant-b
    projects:
      - content/pages/zh/projects/project-two.md
      - content/pages/zh/projects/project-three.md
      - content/pages/zh/projects/project-one.md
    styles:
      self:
        height: auto
        width: wide
        padding:
          - pt-16
          - pb-16
          - pl-4
          - pr-4
        textAlign: left
  - type: FeaturedItemsSection
    elementId: tiers
    colors: colors-f
    subtitle: "兩種同我合作嘅方式"
    items:
      - type: FeaturedItem
        title: "AI Launch System"
        subtitle: "我幫你裝好套會搵到客嘅系統，之後你自己揸"
        text: |
          我幫你設置好 AI 驅動嘅營銷系統、儀表板同活動，再教識你點用 —— 之後唔使長期靠我，慳返你自己捱時間做嘅工夫。

          > **$9,980** 一次性設置費 *(或分2期，每期$4,990)* + **$980/月** 令個系統持續更新、續牌、有新嘢 —— 唔係交咗貨就算 *(可隨時取消月費，系統仍然係你嘅)*

          *(頭5位客戶可鎖定呢個價，之後會檢討價錢。)*

          - ✅ AI輔助內容 & 廣告文案工作流程
          - ✅ SEO 及廣告活動設置
          - ✅ 為你業務配置好嘅營銷自動化工具
          - ✅ 社交媒體 & 品牌指引文件（語調、風格、視覺）
          - ✅ 工具同平台費用全包，唔使自己另外課金
          - ✅ 有更好嘅AI工具出，就幫你更新套流程
          - ✅ 每月content refresh + 自動化成效報告
          - ✅ 文件、教學片，仲有專屬社群，隨時搵到

          **加購：AI建網站（最多3頁靜態頁）連設置 —— $3,000**
        actions:
          - type: Button
            label: "即刻裝返套 AI Launch System 🚀"
            url: "https://wa.me/85296783395?text=你好Key%EF%BC%81我想了解下AI%20Launch%20System。"
            style: primary
        styles:
          self:
            textAlign: left
      - type: FeaturedItem
        title: "AI Growth Partner"
        subtitle: "我幫你把緊方向，你唔使一個人捱"
        text: |
          我做你嘅外部Marketing Director —— 定期通話 + WhatsApp直接跟進，同你一齊度策略、諗計劃、拆解卡住嘅問題。

          唔理你有冇team，我都幫你搵AI工具同自動化，頂替一個team嘅工作量。

          > **$5,000/月** *(相比全職請人月薪二萬幾起跳)* —— 月費制，冇長約，但每次只開3-5個位

          - ✅ **包含完整「AI Launch System」—— 唔另收$9,980設置費 —— 仲加埋：**
          - ✅ 每月Scheduled Call，一齊度策略同track進度
          - ✅ WhatsApp直接聯絡我，隨時brainstorm/請教
          - ✅ 有team就教你team點做啱，冇team就用AI幫你頂執行
          - ✅ 以收益為本嘅報告，唔講得個「like」字

          *(刻意開得少 —— 我想真係跟得住每一個客，唔想做到攤薄晒。)*
        actions:
          - type: Button
            label: "申請做 AI Growth Partner 🚀"
            url: "https://wa.me/85296783395?text=你好Key%EF%BC%81我想申請做AI%20Growth%20Partner客戶。"
            style: primary
        styles:
          self:
            textAlign: left
    columns: 2
    spacingX: 24
    spacingY: 24
    styles:
      self:
        height: auto
        width: wide
        padding:
          - pt-24
          - pb-24
          - pl-4
          - pr-4
        textAlign: center
  - type: TextSection
    elementId: faq
    colors: colors-f
    subtitle: "仲有啲疑問？"
    text: |
      **我完全唔識用AI/marketing，跟得上咩？**

      唔使識。AI Launch System會連埋文件同教學片一齊比你，跟住做就得。

      **裝好之後，如果自己搞唔掂點算？**

      放心，有文件、教學片同專屬社群幫你，唔會冇人理。如果之後想升級到有人幫手把關，隨時可以轉去AI Growth Partner。

      **幾耐先見到效果？**

      睇返你嘅起點，一般4-8星期會開始見到流量/查詢有變化。

      **AI做嘢會唔會冇人情味，好假？**

      AI淨係幫手加快重複性工作（例如寫初稿、跑數據），策略同把關全部係我親自睇，唔會交由AI亂噏。

      **同請一個全職marketing相比，邊樣抵？**

      全職請人月薪隨時二萬幾起跳，AI Growth Partner等於用零頭成本，攞到策略同執行力。
    styles:
      self:
        height: auto
        width: wide
        padding:
          - pt-16
          - pb-16
          - pl-4
          - pr-4
        textAlign: left
  - type: ContactSection
    elementId: lead-magnet
    colors: colors-f
    title: "免費：5個AI工具幫你慳返一半marketing時間"
    text: |
      填低個WhatsApp，撳掣即刻睇，唔使等。
    form:
      type: FormBlock
      elementId: lead-magnet-form
      whatsappPhone: "85296783395"
      whatsappGreeting: "你好Key！我啱啱睇咗「5個AI工具」個page。"
      redirectUrl: "/zh/ai-tools"
      submitLabel: "免費睇 📖"
      fields:
        - name: firstName
          label: 你的名字
          hideLabel: true
          placeholder: 你的名字
          isRequired: true
          width: 1/2
          type: TextFormControl
        - name: whatsapp
          label: Whatsapp 電話
          hideLabel: true
          placeholder: Whatsapp 電話
          isRequired: true
          width: 1/2
          type: TextFormControl
      styles:
        self:
          textAlign: center
    styles:
      self:
        height: auto
        width: narrow
        padding:
          - pt-16
          - pb-16
          - pl-4
          - pr-4
        textAlign: center
  - type: FeaturedPostsSection
    elementId: ''
    colors: colors-f
    variant: variant-d
    subtitle: Featured Posts
    showFeaturedImage: false
    actions:
      - type: Link
        label: 睇晒所有文章
        url: /zh/blog
    posts:
      - content/pages/zh/blog/post-five.md
      - content/pages/zh/blog/post-six.md
    showDate: true
    showExcerpt: true
    showReadMoreLink: true
    styles:
      self:
        height: auto
        width: narrow
        padding:
          - pt-28
          - pb-48
          - pl-4
          - pr-4
        textAlign: left
  - type: CtaSection
    elementId: ''
    colors: colors-f
    backgroundSize: full
    title: "AI 驅動 + 8年經驗，想營銷做得自在，揾我傾吓啦... 💬"
    text: |
      同我講兩句你盤生意嘅情況、想了解邊個方案 —— 每個訊息我都親自睇。
    actions:
      - type: Button
        label: "WhatsApp 我 🚀"
        url: "https://wa.me/85296783395?text=你好Key%EF%BC%81我想了解下你嘅marketing服務。"
        style: primary
    styles:
      self:
        height: auto
        width: narrow
        margin:
          - mt-0
          - mb-0
          - ml-0
          - mr-0
        padding:
          - pt-24
          - pb-24
          - pr-4
          - pl-4
        flexDirection: row
        textAlign: left
---

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
    title: 「咖啡還是茶？對、錯還是中性？我都會細心考慮。」
    subtitle: >-
      Hi，我是個有點奇怪的營銷人。

      白天，我幫品牌寫文案、分析數據、設計策略；晚上，我會靜心冥想，用靈性直覺感受品牌背後的真實能量。週末？你會在羽球場找到我，大汗淋漓地追著小白球跑。

      朋友說我很細心（有時候細心到有點煩），但我最自豪的是能從「對、錯、中性」三個角度看問題。這讓我在營銷這個充滿灰色地帶的世界裡，總能找到平衡點。

      我相信最好的營銷策略，就像打羽毛球一樣：需要技巧，更需要直覺。
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
    actions: []
  - type: RandomFactSection
    elementId: random-fact
    colors: colors-f
    styles:
      self:
        height: auto
        width: wide
        padding:
          - pt-12
          - pb-12
          - pl-4
          - pr-4
        textAlign: center
  - type: ServicesSection
    elementId: services
    colors: colors-f
    title: "我提供的服務"
    subtitle: "選擇最共鳴的道路"
    services:
      - title: "市場營銷 & 網站建設"
        icon: "💼"
        description: "透過策略性的市場營銷方案和專業網站開發，全面提升你的網上形象，達成業務目標。"
        features:
          - "網站設計與開發"
          - "數字營銷策略"
          - "搜索引擎優化 (SEO)"
          - "社交媒體管理"
          - "品牌發展"
        phone: "85296783395"
      - title: "阿卡莎靈性對話 & 能量療愈"
        icon: "✨"
        description: "透過阿卡莎記錄靈性對話和能量療愈，獲得深層靈性洞察和整體身心靈復原。"
        features:
          - "阿卡莎記錄靈性對話"
          - "能量療愈課程"
          - "靈性指引"
          - "脈輪平衡"
          - "個人蛻變"
        phone: "85296783395"
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
  - colors: colors-f
    type: FeaturedProjectsSection
    elementId: ''
    actions:
      - type: Link
        label: See all projects
        url: /projects
    showDate: false
    showDescription: true
    showFeaturedImage: true
    showReadMoreLink: true
    variant: variant-b
    projects:
      - content/pages/projects/project-two.md
      - content/pages/projects/project-three.md
      - content/pages/projects/project-one.md
    styles:
      self:
        height: auto
        width: wide
        padding:
          - pt-24
          - pb-24
          - pl-4
          - pr-4
        textAlign: left
    subtitle: Projects
  - type: FeaturedPostsSection
    elementId: ''
    colors: colors-f
    variant: variant-d
    subtitle: Featured Posts
    showFeaturedImage: false
    actions:
      - type: Link
        label: See all posts
        url: /blog
    posts:
      - content/pages/blog/post-five.md
      - content/pages/blog/post-six.md
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
  - type: ContactSection
    colors: colors-f
    backgroundSize: full
    title: "靈性感知 + 專業細心~ 助你營銷睇得透，做得自在，揾我傾吓啦...\U0001F4AC"
    form:
      type: FormBlock
      elementId: sign-up-form
      fields:
        - name: firstName
          label: 你的名字
          hideLabel: true
          placeholder: First Name
          isRequired: true
          width: 1/2
          type: TextFormControl
        - name: Whatsapp 電話
          label: Whatsapp 電話
          hideLabel: true
          placeholder: Whatsapp 電話
          isRequired: true
          width: 1/2
          type: EmailFormControl
        - name: updatesConsent
          label: 我想收到每月最新分享文章
          isRequired: false
          width: full
          type: CheckboxFormControl
      submitLabel: "提交\U0001F680"
      styles:
        self:
          textAlign: center
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

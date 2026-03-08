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
    title: "Coffee or tea? Right, wrong, or neutral? I carefully consider it all."
    subtitle: >-
      Hi, I'm a slightly unconventional marketer.


      By day, I craft copy, analyze data, and design strategies for brands. By night, I meditate in stillness, using intuition to sense the authentic energy behind each brand. Weekends? You'll find me on the badminton court, chasing that little white shuttlecock with sweat dripping down.


      Friends say I'm detail-oriented (sometimes annoyingly so), but what I'm most proud of is my ability to view problems from three perspectives: right, wrong, and neutral. This helps me find balance in the gray-area world of marketing.


      I believe the best marketing strategy is like playing badminton: it requires technique, but even more so, intuition.
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
    title: "Marketing Services"
    subtitle: "Strategic solutions for business growth"
    services:
      - title: "Marketing & Website Building"
        icon: "💼"
        description: "Transform your online presence with strategic marketing solutions and professional website development tailored to your business goals."
        features:
          - "Website Design & Development"
          - "Digital Marketing Strategy"
          - "SEO Optimization"
          - "Social Media Management"
          - "Brand Development"
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
    subtitle: Featured Case Studies
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
    title: "Let's transform your marketing strategy together 💬"
    form:
      type: FormBlock
      elementId: sign-up-form
      fields:
        - name: firstName
          label: Your Name
          hideLabel: true
          placeholder: Your Name
          isRequired: true
          width: 1/2
          type: TextFormControl
        - name: company
          label: Company Name
          hideLabel: true
          placeholder: Company Name
          isRequired: false
          width: 1/2
          type: TextFormControl
        - name: email
          label: Email Address
          hideLabel: true
          placeholder: Email Address
          isRequired: true
          width: full
          type: EmailFormControl
        - name: message
          label: Project Details
          hideLabel: true
          placeholder: Tell me about your marketing goals and challenges
          isRequired: false
          width: full
          type: TextareaFormControl
        - name: updatesConsent
          label: I'd like to receive marketing insights and case studies
          isRequired: false
          width: full
          type: CheckboxFormControl
      submitLabel: "Get in Touch 🚀"
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

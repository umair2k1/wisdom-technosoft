/* All page copy lives here. Edit text without touching components. */

export const hero = {
  eyebrow: 'Wisdom Technosoft · Nagpur, India',
  lede: 'We build the software, make the customer calls and keep the records straight, then take on the back-office work that follows. One team in Nagpur, one standard across all of it.',
};

/* Order matters: chapter i+1 maps to station i+1 in the 3D world (see scripts/stage.js).
   copy: which side the text sits on. The 3D object takes the opposite side. */
export const chapters = [
  {
    key: 'software',
    hud: 'Software',
    word: 'Build',
    copy: 'left',
    accent: '#2b7bff',
    label: 'Software development',
    title: 'Software built around the way you work.',
    body: 'Web platforms, mobile apps, internal tools and the automation that ties them together. Made to be easy to use, dependable and ready to grow with the business.',
    tags: ['Web', 'Mobile', 'Custom software', 'Automation'],
  },
  {
    key: 'telecalling',
    hud: 'Telecalling',
    word: 'Speak',
    copy: 'right',
    accent: '#e8b27a',
    label: 'Telecalling services',
    title: 'Conversations that turn interest into leads.',
    body: 'Courteous, results-focused calls that strengthen relationships and produce qualified leads, in the languages your customers speak.',
    tags: ['B2B campaigns', 'Lead generation', 'Multilingual', 'CRM'],
  },
  {
    key: 'data',
    hud: 'Data',
    word: 'Order',
    copy: 'left',
    accent: '#5fd0ff',
    label: 'Data entry & management',
    title: 'Records you can rely on.',
    body: 'Precise, on-time data work that keeps your records reliable and your decisions sharp. Every step has a documented check.',
    tags: ['Data entry', 'Quality assurance', 'Process design', 'Analytics'],
  },
  {
    key: 'operations',
    hud: 'Operations',
    word: 'Run',
    copy: 'right',
    accent: '#9fb2d6',
    label: 'Business process & industrial solutions',
    title: 'Operations that run cleaner.',
    body: 'End-to-end BPO and operational support: supply-chain workflows on SAP, e-commerce and web builds, and environmental and industrial systems — STP, ETP, chemical machinery and monitoring instrumentation. Cleaner processes, a healthier operation.',
    tags: ['BPO', 'SAP / SCM', 'E-commerce', 'Web design', 'STP / ETP', 'Instrumentation'],
  },
  {
    key: 'healthcare',
    hud: 'Healthcare',
    word: 'Care',
    copy: 'left',
    accent: '#3ecf8e',
    label: 'Healthcare support services',
    title: 'Back-office support for healthcare providers.',
    body: 'Accurate, compliant work, including US medical billing, claims preparation and revenue-cycle workflows. A trained team handles it, with documented quality checks at every step.',
    tags: ['US medical billing', 'Claims support', 'Revenue cycle', 'Compliance-aware QA'],
  },
];

export const principlesIntro = 'Four rules we hold ourselves to, from the first call to the handover.';

export const principles = [
  { title: 'Quality', text: 'We sweat the details so the result feels effortless.' },
  { title: 'Timelines', text: 'We give you a date, then we keep it.' },
  { title: 'Innovation', text: 'Current tools, chosen with care, for better outcomes.' },
  { title: 'Client satisfaction', text: 'A project is only a success if it is one for you.' },
];

export const vision =
  'To be among the top business process outsourcing providers, known for clarity, care and consistency.';

export const mission =
  'Simplifying data is what this industry runs on. We aim to be resourceful, inventive and quick to respond to what clients need, and to deliver the same quality every time. When their business does well, so does ours.';

export const team = {
  lede: 'A small senior team across software, telecalling and data, working as one.',
  roles: [
    { role: 'Managing Director', focus: 'Executive leadership' },
    { role: 'Managing Director', focus: 'Operations & delivery' },
    { role: 'Consultant', focus: 'Process & quality' },
    { role: 'Consultant', focus: 'Client partnerships' },
  ],
};

export const contact = {
  title: 'Tell us what you need built, fixed or run.',
  lede: 'A few lines are enough. We reply within 1 business day.',
};

export const services = [
  'Software Development',
  'Telecalling Services',
  'Data Entry & Management',
  'Business Process & Industrial Solutions',
  'Healthcare Support / US Medical Billing',
  'General Inquiry',
];

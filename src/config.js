export const CONFIG = {
  commandPathDelimiter: '/',
  commandSearchDelimiter: ' ',
  commandCaseSensitive: false,
  defaultSearchTemplate: 'https://www.google.com/search?q={}',
  openLinksInNewTab: false,
  suggestionLimit: 4,
  defaultWorkspace: 'personal',
  workspaceStorageKey: 'm1n-active-workspace',
};

export const COMMANDS = new Map([
  // Personal (alphabetical by key)
  ['1', { name: 'M1n', url: 'https://m1n.land/', workspace: 'personal' }],
  ['A', { name: 'Mastodon', url: 'https://social.lol', workspace: 'personal' }],
  ['B', { name: 'Pastebin', url: 'https://paste.m1n.land/', workspace: 'personal' }],
  ['C', { name: 'Kimi', url: 'https://www.kimi.com/bot', workspace: 'personal' }],
  ['G', { name: 'Proton Mail', url: 'https://mail.proton.me', workspace: 'personal' }],
  ['M', { name: 'Mymemo', url: 'https://app.mymemo.ai/home', workspace: 'personal' }],
  ['R', { name: 'RSS feed', url: 'https://owl.report/', workspace: 'personal' }],
  ['T', { name: 'Twitch', url: 'https://www.twitch.tv', workspace: 'personal' }],
  ['W', { name: 'Weather', url: 'https://merrysky.net/', workspace: 'personal' }],
  ['Y', { name: 'YouTube', url: 'https://youtube.com', searchTemplate: '/results?search_query={}', workspace: 'personal' }],
  // Dev (alphabetical by key)
  ['E', { name: 'TRAE', url: 'https://www.trae.ai/account-setting#usage', workspace: 'dev' }],
  ['F', { name: 'Cloudflare', url: 'https://dash.cloudflare.com', workspace: 'dev' }],
  ['H', { name: 'GitHub', url: 'https://github.com/', workspace: 'dev' }],
  ['I', { name: 'Pico', url: 'https://pico.sh', workspace: 'dev' }],
  ['N', { name: 'Neon', url: 'https://neon.tech', workspace: 'dev' }],
  ['S', { name: 'Server', url: 'http://192.168.1.139', workspace: 'dev' }],
  ['U', { name: 'Sourcehut', url: 'https://sr.ht', workspace: 'dev' }],
  ['V', { name: 'Vercel', url: 'https://vercel.com/dashboard', workspace: 'dev' }],
  // Work (alphabetical by key)
  ['J', { name: 'Mymemo', url: 'https://app.mymemo.ai/home', workspace: 'work' }],
  ['O', { name: 'Outlook', url: 'https://outlook.office.com', workspace: 'work' }],
]);

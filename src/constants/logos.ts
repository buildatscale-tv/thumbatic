import type { LogoLibraryItem } from '../types';

export const LOGO_LIBRARY: LogoLibraryItem[] = [
  // Cloud & Infrastructure
  { value: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/amazonwebservices/amazonwebservices-plain-wordmark.svg", label: "AWS", category: "Cloud" },
  { value: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/azure/azure-original.svg", label: "Azure", category: "Cloud" },
  { value: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/googlecloud/googlecloud-original.svg", label: "Google Cloud", category: "Cloud" },
  { value: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/digitalocean/digitalocean-original.svg", label: "DigitalOcean", category: "Cloud" },
  { value: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/heroku/heroku-original.svg", label: "Heroku", category: "Cloud" },
  { value: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/netlify/netlify-original.svg", label: "Netlify", category: "Cloud" },
  { value: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vercel/vercel-original.svg", label: "Vercel", category: "Cloud" },
  { value: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vercel/vercel-original.svg#inverted", label: "Vercel (Inverted)", category: "Cloud", invert: true },
  { value: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cloudflare/cloudflare-original.svg", label: "Cloudflare", category: "Cloud" },

  // Frontend Frameworks & Libraries
  { value: "/astro-icon-light-gradient.svg", label: "Astro", category: "Frontend" },
  { value: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg", label: "React", category: "Frontend" },
  { value: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/angular/angular-original.svg", label: "Angular", category: "Frontend" },
  { value: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vuejs/vuejs-original.svg", label: "Vue.js", category: "Frontend" },
  { value: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/svelte/svelte-original.svg", label: "Svelte", category: "Frontend" },
  { value: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg", label: "Next.js", category: "Frontend" },
  { value: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nuxtjs/nuxtjs-original.svg", label: "Nuxt.js", category: "Frontend" },
  { value: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/bootstrap/bootstrap-original.svg", label: "Bootstrap", category: "Frontend" },
  { value: "https://tailwindcss.com/_next/static/media/tailwindcss-mark.d52e9897.svg", label: "Tailwind CSS", category: "Frontend" },
  { value: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/materialui/materialui-original.svg", label: "Material UI", category: "Frontend" },

  // Programming Languages
  { value: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg", label: "JavaScript", category: "Languages" },
  { value: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg", label: "TypeScript", category: "Languages" },
  { value: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg", label: "Python", category: "Languages" },

  // Backend & APIs
  { value: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg", label: "Node.js", category: "Backend" },
  { value: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/express/express-original.svg", label: "Express", category: "Backend" },
  { value: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/django/django-plain.svg", label: "Django", category: "Backend" },
  { value: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/flask/flask-original.svg", label: "Flask", category: "Backend" },
  { value: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/fastapi/fastapi-original.svg", label: "FastAPI", category: "Backend" },
  { value: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/rails/rails-plain-wordmark.svg", label: "Rails", category: "Backend" },
  { value: "https://raw.githubusercontent.com/laravel/art/refs/heads/master/laravel-logo.svg", label: "Laravel", category: "Backend" },
  { value: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/spring/spring-original.svg", label: "Spring", category: "Backend" },
  { value: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/graphql/graphql-plain.svg", label: "GraphQL", category: "Backend" },

  // Databases
  { value: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg", label: "MongoDB", category: "Database" },
  { value: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg", label: "PostgreSQL", category: "Database" },
  { value: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg", label: "MySQL", category: "Database" },
  { value: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/redis/redis-original.svg", label: "Redis", category: "Database" },
  { value: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/firebase/firebase-plain.svg", label: "Firebase", category: "Database" },
  { value: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/supabase/supabase-original.svg", label: "Supabase", category: "Database" },
  { value: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/elasticsearch/elasticsearch-original.svg", label: "Elasticsearch", category: "Database" },

  // DevOps & Tools
  { value: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg", label: "Docker", category: "DevOps" },
  { value: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/kubernetes/kubernetes-plain.svg", label: "Kubernetes", category: "DevOps" },
  { value: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/terraform/terraform-original.svg", label: "Terraform", category: "DevOps" },
  { value: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/ansible/ansible-original.svg", label: "Ansible", category: "DevOps" },
  { value: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/ansible/ansible-original.svg#inverted", label: "Ansible (Inverted)", category: "DevOps", invert: true },
  { value: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/jenkins/jenkins-original.svg", label: "Jenkins", category: "DevOps" },

  // Development Tools
  { value: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg", label: "Git", category: "Tools" },
  { value: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg", label: "GitHub", category: "Tools" },
  { value: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg#inverted", label: "GitHub (Inverted)", category: "Tools", invert: true },
  { value: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/gitlab/gitlab-original.svg", label: "GitLab", category: "Tools" },
  { value: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/bitbucket/bitbucket-original.svg", label: "Bitbucket", category: "Tools" },
  { value: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vscode/vscode-original.svg", label: "VS Code", category: "Tools" },
  { value: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/webstorm/webstorm-original.svg", label: "WebStorm", category: "Tools" },
  { value: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vim/vim-original.svg", label: "Vim", category: "Tools" },
  { value: "https://cursor.com/favicon.svg", label: "Cursor", category: "Tools" },
  { value: "https://www.vectorlogo.zone/logos/trello/trello-tile.svg", label: "Trello", category: "Tools" },
  { value: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vitejs/vitejs-original.svg", label: "Vite", category: "Tools" },
  { value: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/webpack/webpack-original.svg", label: "Webpack", category: "Tools" },
  { value: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/babel/babel-original.svg", label: "Babel", category: "Tools" },
  { value: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/eslint/eslint-original.svg", label: "ESLint", category: "Tools" },
  { value: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/sass/sass-original.svg", label: "Sass", category: "Tools" },
  { value: "https://docs.astral.sh/uv/assets/logo-letter.svg", label: "UV", category: "Tools" },
  { value: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/pypi/pypi-original.svg", label: "PyPI", category: "Tools" },

  // Testing
  { value: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/jest/jest-plain.svg", label: "Jest", category: "Testing" },
  { value: "https://assets.streamlinehq.com/image/private/w_300,h_300,ar_1/f_auto/v1/icons/3/cypress-icon-moigrz5nimpd7rsob0bisu.png/cypress-icon-pg9bdlubveoefqouilbg.png?_a=DATAg1AAZAA0", label: "Cypress", category: "Testing" },
  { value: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/playwright/playwright-original.svg", label: "Playwright", category: "Testing" },

  // Design & Creative
  { value: "https://upload.wikimedia.org/wikipedia/commons/3/33/Figma-logo.svg", label: "Figma", category: "Design" },
  { value: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/sketch/sketch-original.svg", label: "Sketch", category: "Design" },
  { value: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/photoshop/photoshop-plain.svg", label: "Photoshop", category: "Design" },

  // AI & ML
  { value: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/OpenAI_logo_2025_%28symbol%29.svg/1024px-OpenAI_logo_2025_%28symbol%29.svg.png", label: "OpenAI", category: "AI" },
  { value: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/OpenAI_logo_2025_%28symbol%29.svg/1024px-OpenAI_logo_2025_%28symbol%29.svg.png#inverted", label: "OpenAI (Inverted)", category: "AI", invert: true },
  { value: "/src/assets/logos/claude-ai-icon.svg", label: "Claude AI", category: "AI" },
  { value: "/src/assets/logos/claude-code.svg", label: "Claude Code", category: "AI" },
  { value: "https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/google-gemini.svg", label: "Gemini", category: "AI" },
  { value: "/remotion-logo.svg", label: "Remotion", category: "AI" },
  { value: "/elevenlabs-logo-white.svg", label: "ElevenLabs", category: "AI" },
  { value: "/pencil-icon.svg", label: "Pencil", category: "Design" },
];

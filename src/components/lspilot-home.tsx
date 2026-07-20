import {
  Bot,
  Brain,
  Code2,
  ExternalLink,
  FileSearch,
  GitBranch,
  Layers,
  Puzzle,
  Rocket,
  Terminal,
  Wrench,
  Zap,
} from 'lucide-react';
import { getDocPath, site } from '@/lib/site';

function Search(props: any) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

const features = [
  {
    title: 'AI 驱动的逆向分析',
    details: '通过自然语言描述需求，AI 自动定位目标类和方法，生成可直接运行的 Hook 脚本。',
    icon: Bot,
    color: 'text-purple-500',
  },
  {
    title: 'jadx 反编译',
    details: '在手机上直接反编译 APK/DEX 文件，查看 Java 源码，无需电脑辅助。',
    icon: FileSearch,
    color: 'text-cyan-500',
  },
  {
    title: 'DexKit 搜索',
    details: '高性能 DEX 字节码搜索，支持类/方法/字段链式查询，快速定位混淆代码。',
    icon: Search,
    color: 'text-yellow-500',
  },
  {
    title: '多语言插件引擎',
    details: '支持 BeanShell (Java)、Lua、JavaScript 三种脚本语言，灵活选择。',
    icon: Code2,
    color: 'text-emerald-500',
  },
  {
    title: '动态注入',
    details: '通过 LSPosed 框架一键动态注入脚本，实时验证结果，无需反复编译。',
    icon: Zap,
    color: 'text-blue-500',
  },
  {
    title: '资源读取器',
    details: '解析和查看 Android 资源文件 (ARSC)，方便分析应用资源结构。',
    icon: Layers,
    color: 'text-red-500',
  },
  {
    title: '字符串分析器',
    details: '分析和定位 DEX 中的字符串引用，辅助理解代码逻辑。',
    icon: Brain,
    color: 'text-amber-500',
  },
  {
    title: '类型签名解析',
    details: '解析 Java 类型签名，辅助方法查找和 Hook 定位。',
    icon: Wrench,
    color: 'text-green-500',
  },
  {
    title: '一键自动化',
    details: '从查找、分析、写脚本到注入全链路自动化，让逆向变成"一句话的事"。',
    icon: Rocket,
    color: 'text-indigo-500',
  },
  {
    title: '实时终端',
    details: '运行时动态下发和执行修复逻辑，实时查看执行结果。',
    icon: Terminal,
    color: 'text-teal-500',
  },
  {
    title: 'LSPosed 框架',
    details: '专为 LSPosed 框架打造，深度集成，稳定可靠。',
    icon: Puzzle,
    color: 'text-orange-500',
  },
  {
    title: '持续更新',
    details: '活跃的开发社区，持续优化体验，新增功能。',
    icon: GitBranch,
    color: 'text-purple-400',
  },
];

export function LSPilotHome() {
  return (
    <div className="not-prose mx-auto flex w-full max-w-6xl flex-col gap-14 px-2 py-8 sm:px-4 lg:py-14">
      <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
        <div className="space-y-7">
          <div className="space-y-4">
            <p className="text-5xl font-bold tracking-normal text-fd-foreground sm:text-7xl">LSPilot</p>
            <h1 className="text-3xl font-semibold tracking-normal text-fd-foreground sm:text-5xl">AI 逆向分析与插件调试工具</h1>
            <p className="max-w-3xl text-lg leading-8 text-fd-muted-foreground sm:text-xl">
              手机端的 AI 逆向分析与动态插件调试工具。通过编写基于规则的 Xposed 脚本，轻松在目标应用内实现动态分析与自动化执行，专为 LSPosed 框架打造的智能逆向领航员。
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <a
              href={getDocPath('/get-started/introduction')}
              className="inline-flex h-11 items-center rounded-md bg-[#6b16ed] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#5f12d8]"
            >
              开始使用
            </a>
            <a
              href="https://github.com/Xposed-Modules-Repo/me.yun.lspilot"
              className="inline-flex h-11 items-center gap-2 rounded-md border border-fd-border bg-fd-muted/60 px-5 text-sm font-semibold text-fd-foreground transition hover:bg-fd-muted"
            >
              GitHub
              <ExternalLink className="size-4" />
            </a>
          </div>
        </div>

        <a
          href="https://t.me/LSPilot"
          className="group overflow-hidden rounded-lg border border-fd-border bg-fd-card text-fd-card-foreground shadow-sm transition hover:border-fd-primary/50"
        >
          <div className="flex items-center gap-2 border-b border-fd-border bg-fd-muted/60 px-4 py-2 text-sm font-medium">
            <span className="size-3 rounded-full bg-red-400" />
            <span className="size-3 rounded-full bg-yellow-400" />
            <span className="size-3 rounded-full bg-green-400" />
            <span className="ml-2 text-fd-muted-foreground">Telegram</span>
          </div>
          <div className="space-y-3 p-5">
            <p className="text-lg font-semibold">加入频道获取最新动态</p>
            <p className="text-sm leading-6 text-fd-muted-foreground">
              关注 Telegram 频道，获取版本更新通知和使用教程。
            </p>
            <div className="flex items-center gap-2 text-sm font-medium text-fd-primary">
              https://t.me/LSPilot
              <ExternalLink className="size-4 transition group-hover:translate-x-0.5" />
            </div>
          </div>
        </a>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {features.map((feature) => {
          const Icon = feature.icon;

          return (
            <article key={feature.title} className="rounded-lg border border-fd-border bg-fd-card p-5">
              <Icon className={`mb-4 size-6 ${feature.color}`} />
              <h2 className="mb-2 text-base font-semibold tracking-normal text-fd-foreground">{feature.title}</h2>
              <p className="text-sm leading-6 text-fd-muted-foreground">{feature.details}</p>
            </article>
          );
        })}
      </section>
    </div>
  );
}

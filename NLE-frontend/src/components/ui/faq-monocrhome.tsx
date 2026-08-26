import React, { useEffect, useMemo, useState } from "react";

const INTRO_STYLE_ID = "faq1-animations";

export interface FAQItem {
  question: string;
  answer: string;
  meta?: string;
}

export interface FAQMonochromeProps {
  id?: string;
  items?: FAQItem[];
  title?: string;
  subtitle?: string;
  badgeText?: string;
  categoryLabel?: string;
  showThemeToggle?: boolean;
  className?: string;
  defaultTheme?: "dark" | "light";
  extraFooter?: React.ReactNode;
}

const defaultFaqs: FAQItem[] = [
  {
    question: "How early should I book my surprise or event decoration?",
    answer:
      "We recommend booking 24 to 48 hours in advance for custom neon signage and tailored themes. For last-minute surprises, same-day 3-hour express setups are available across Bengaluru.",
    meta: "Booking",
  },
  {
    question: "Are listed package prices all-inclusive with no hidden fees?",
    answer:
      "Yes, 100% all-inclusive. All prices cover premium balloons, props, certified stylist labor, transportation across Bengaluru, and complete on-site setup.",
    meta: "Pricing",
  },
  {
    question: "Can I customize colors, neon signs, and milestone numbers?",
    answer:
      "Absolutely. Every package is fully customizable with your choice of premium pastel or metallic palettes, custom LED neon words, milestone numbers, and bespoke props.",
    meta: "Customization",
  },
  {
    question: "What balloon quality and materials do you use?",
    answer:
      "We use 100% biodegradable premium latex and chrome balloons engineered to retain their shine, buoyancy, and structural integrity for 48+ hours.",
    meta: "Quality",
  },
  {
    question: "Do your decorators handle cleanup and teardown?",
    answer:
      "Our stylists complete the full installation. For setups with rented structural props like 4-foot marquee letters or metal arches, we schedule a seamless teardown post-event.",
    meta: "Logistics",
  },
];

// Brand Theme Palettes (Khaki Shell, Radiant Lilac, Banished Brown, Shadow Purple, Japanese Violet)
const palettes = {
  dark: {
    surface: "bg-[#1B101F] text-[#F9F6F2]",
    panel: "bg-[#2D1C34]/80",
    border: "border-[#483250]/70",
    heading: "text-[#F9F6F2]",
    muted: "text-[#A78A9F]",
    iconRing: "border-[#725D75]/40",
    iconSurface: "bg-[#725D75]/90 text-[#A78A9F]",
    icon: "text-[#A78A9F]",
    toggle: "border-[#483250] text-[#F9F6F2]",
    toggleSurface: "bg-[#2D1C34]",
    glow: "rgba(201, 190, 171, 0.14)",
    aurora: "radial-gradient(ellipse 60% 100% at 10% 0%, rgba(167, 138, 159, 0.22), transparent 65%), radial-gradient(circle at 90% 20%, rgba(72, 50, 80, 0.35), transparent 50%), #1B101F",
    shadow: "shadow-[0_36px_140px_-60px_rgba(27,16,31,0.95)]",
    overlay: "linear-gradient(130deg, rgba(201,190,171,0.05) 0%, transparent 65%)",
    badgeBorder: "border-[#C9BEAB]/25",
    badgeBg: "bg-[#725D75]/70",
    badgeText: "text-[#F9F6F2]",
    metaBorder: "border-[#725D75]/30",
    metaText: "text-[#A78A9F]",
  },
  light: {
    surface: "bg-[#F9F6F2] text-[#2F2930]",
    panel: "bg-white/85",
    border: "border-[#E4DCD2]",
    heading: "text-[#2F2930]",
    muted: "text-[#746B72]",
    iconRing: "border-[#E4DCD2]",
    iconSurface: "bg-[#F9F6F2] text-[#2F2930]",
    icon: "text-[#2F2930]",
    toggle: "border-[#E4DCD2] text-[#2F2930]",
    toggleSurface: "bg-white",
    glow: "rgba(114, 93, 117, 0.08)",
    aurora: "radial-gradient(ellipse 60% 100% at 10% 0%, rgba(167, 138, 159, 0.14), rgba(250, 248, 245, 0.95) 70%), radial-gradient(circle at 90% 80%, rgba(201, 190, 171, 0.22), transparent 60%)",
    shadow: "shadow-[0_36px_120px_-70px_rgba(52,32,60,0.1)]",
    overlay: "linear-gradient(130deg, rgba(114,93,117,0.04) 0%, transparent 70%)",
    badgeBorder: "border-[#A78A9F]/20",
    badgeBg: "bg-[#F9F6F2]/90",
    badgeText: "text-[#2F2930]",
    metaBorder: "border-[#E4DCD2]",
    metaText: "text-[#746B72]",
  },
};

function FAQ1({
  id,
  items = defaultFaqs,
  title = "Frequently Asked Questions",
  subtitle = "Everything you need to know about booking, package inclusions, bespoke customizations, and party setups.",
  badgeText = "Signal FAQ",
  categoryLabel = "Questions",
  showThemeToggle = true,
  className = "",
  defaultTheme,
  extraFooter,
}: FAQMonochromeProps) {
  const getRootTheme = (): "dark" | "light" => {
    if (defaultTheme) return defaultTheme;
    if (typeof document === "undefined") return "light";
    if (document.documentElement.classList.contains("dark")) return "dark";
    if (document.documentElement.classList.contains("light")) return "light";
    if (typeof window !== "undefined" && window.matchMedia) {
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    return "light";
  };

  const [theme, setTheme] = useState<"dark" | "light">(getRootTheme);
  const [introReady, setIntroReady] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(0);
  const [hasEntered, setHasEntered] = useState(false);

  useEffect(() => {
    if (typeof document === "undefined") return;
    if (document.getElementById(INTRO_STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = INTRO_STYLE_ID;
    style.innerHTML = `
      @keyframes faq1-fade-up {
        0% { transform: translate3d(0, 20px, 0); opacity: 0; filter: blur(6px); }
        60% { filter: blur(0); }
        100% { transform: translate3d(0, 0, 0); opacity: 1; filter: blur(0); }
      }
      @keyframes faq1-beam-spin {
        0% { transform: rotate(0deg) scale(1); }
        100% { transform: rotate(360deg) scale(1); }
      }
      @keyframes faq1-pulse {
        0% { transform: scale(0.7); opacity: 0.55; }
        60% { opacity: 0.1; }
        100% { transform: scale(1.25); opacity: 0; }
      }
      @keyframes faq1-meter {
        0%, 20% { transform: scaleX(0); transform-origin: left; }
        45%, 60% { transform: scaleX(1); transform-origin: left; }
        80%, 100% { transform: scaleX(0); transform-origin: right; }
      }
      @keyframes faq1-tick {
        0%, 30% { transform: translateX(-6px); opacity: 0.4; }
        50% { transform: translateX(2px); opacity: 1; }
        100% { transform: translateX(20px); opacity: 0; }
      }
      .faq1-intro {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.85rem;
        padding: 0.85rem 1.4rem;
        border-radius: 9999px;
        overflow: hidden;
        border: 1px solid rgba(201, 190, 171, 0.25);
        background: rgba(52, 32, 60, 0.42);
        color: rgba(250, 248, 245, 0.95);
        text-transform: uppercase;
        letter-spacing: 0.35em;
        font-size: 0.65rem;
        width: 100%;
        max-width: 24rem;
        margin: 0 auto;
        mix-blend-mode: screen;
        opacity: 0;
        transform: translate3d(0, 12px, 0);
        filter: blur(8px);
        transition: opacity 720ms ease, transform 720ms ease, filter 720ms ease;
        isolation: isolate;
      }
      .faq1-intro--light {
        border-color: rgba(114, 93, 117, 0.2);
        background: rgba(250, 248, 245, 0.92);
        color: rgba(52, 32, 60, 0.85);
        mix-blend-mode: multiply;
      }
      .faq1-intro--active {
        opacity: 1;
        transform: translate3d(0, 0, 0);
        filter: blur(0);
      }
      .faq1-intro__beam,
      .faq1-intro__pulse {
        position: absolute;
        inset: -110%;
        pointer-events: none;
        border-radius: 50%;
      }
      .faq1-intro__beam {
        background: conic-gradient(from 160deg, rgba(201, 190, 171, 0.3), transparent 32%, rgba(167, 138, 159, 0.28) 58%, transparent 78%, rgba(201, 190, 171, 0.2));
        animation: faq1-beam-spin 18s linear infinite;
        opacity: 0.65;
      }
      .faq1-intro--light .faq1-intro__beam {
        background: conic-gradient(from 180deg, rgba(167, 138, 159, 0.25), transparent 30%, rgba(114, 93, 117, 0.2) 58%, transparent 80%, rgba(167, 138, 159, 0.18));
      }
      .faq1-intro__pulse {
        border: 1px solid currentColor;
        opacity: 0.25;
        animation: faq1-pulse 3.4s ease-out infinite;
      }
      .faq1-intro__label {
        position: relative;
        z-index: 1;
        font-weight: 600;
        letter-spacing: 0.4em;
      }
      .faq1-intro__meter {
        position: relative;
        z-index: 1;
        flex: 1 1 auto;
        height: 1px;
        background: linear-gradient(90deg, transparent, currentColor 35%, transparent 85%);
        transform: scaleX(0);
        transform-origin: left;
        animation: faq1-meter 5.8s ease-in-out infinite;
        opacity: 0.7;
      }
      .faq1-intro__tick {
        position: relative;
        z-index: 1;
        width: 0.55rem;
        height: 0.55rem;
        border-radius: 9999px;
        background: currentColor;
        box-shadow: 0 0 0 4px rgba(201, 190, 171, 0.2);
        animation: faq1-tick 3.2s ease-in-out infinite;
      }
      .faq1-intro--light .faq1-intro__tick {
        box-shadow: 0 0 0 4px rgba(114, 93, 117, 0.12);
      }
      .faq1-fade {
        opacity: 0;
        transform: translate3d(0, 24px, 0);
        filter: blur(12px);
        transition: opacity 700ms ease, transform 700ms ease, filter 700ms ease;
      }
      .faq1-fade--ready {
        animation: faq1-fade-up 860ms cubic-bezier(0.22, 0.68, 0, 1) forwards;
      }
    `;

    document.head.appendChild(style);

    return () => {
      if (style.parentNode) style.remove();
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      setIntroReady(true);
      return;
    }
    const frame = window.requestAnimationFrame(() => setIntroReady(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;

    const applyThemeFromRoot = () => setTheme(getRootTheme());

    applyThemeFromRoot();

    const observer = new MutationObserver(applyThemeFromRoot);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme"],
    });

    const handleStorage = (event: StorageEvent) => {
      if (event.key === "bento-theme" || event.key === "theme") applyThemeFromRoot();
    };

    window.addEventListener("storage", handleStorage);

    return () => {
      observer.disconnect();
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const palette = useMemo(() => palettes[theme], [theme]);

  const toggleTheme = () => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    const next = root.classList.contains("dark") ? "light" : "dark";
    root.classList.toggle("dark", next === "dark");
    setTheme(next);
    try {
      window.localStorage?.setItem("bento-theme", next);
      window.localStorage?.setItem("theme", next);
    } catch {
      /* ignore */
    }
  };

  const toggleQuestion = (index: number) => {
    setActiveIndex((prev) => (prev === index ? null : index));
  };

  useEffect(() => {
    if (typeof window === "undefined") {
      setHasEntered(true);
      return;
    }

    let timeout: number;
    const onLoad = () => {
      timeout = window.setTimeout(() => setHasEntered(true), 120);
    };

    if (document.readyState === "complete") {
      onLoad();
    } else {
      window.addEventListener("load", onLoad, { once: true });
    }

    return () => {
      window.removeEventListener("load", onLoad);
      window.clearTimeout(timeout);
    };
  }, []);

  const setCardGlow = (event: React.MouseEvent<HTMLLIElement>) => {
    const target = event.currentTarget;
    const rect = target.getBoundingClientRect();
    target.style.setProperty("--faq-x", `${event.clientX - rect.left}px`);
    target.style.setProperty("--faq-y", `${event.clientY - rect.top}px`);
  };

  const clearCardGlow = (event: React.MouseEvent<HTMLLIElement>) => {
    const target = event.currentTarget;
    target.style.removeProperty("--faq-x");
    target.style.removeProperty("--faq-y");
  };

  return (
    <div
      className={`relative min-h-[600px] w-full overflow-hidden transition-colors duration-700 ${palette.surface} ${className}`}
    >
      {/* Dynamic Aurora Ambient Background */}
      <div className="absolute inset-0 z-0" style={{ background: palette.aurora }} />
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-80"
        style={{
          background: palette.overlay,
          mixBlendMode: theme === "dark" ? "screen" : "multiply",
        }}
      />

      <section
        id={id}
        className={`relative z-10 mx-auto flex max-w-6xl flex-col gap-10 px-6 py-20 lg:max-w-7xl lg:px-12 ${
          hasEntered ? "faq1-fade--ready" : "faq1-fade"
        }`}
      >
        {/* Animated Radar/Signal Pill */}
        {badgeText && (
          <div
            className={`faq1-intro ${introReady ? "faq1-intro--active" : ""} ${
              theme === "light" ? "faq1-intro--light" : ""
            }`}
          >
            <span className="faq1-intro__beam" aria-hidden="true" />
            <span className="faq1-intro__pulse" aria-hidden="true" />
            <span className="faq1-intro__label">{badgeText}</span>
            <span className="faq1-intro__meter" aria-hidden="true" />
            <span className="faq1-intro__tick" aria-hidden="true" />
          </div>
        )}

        <header className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="space-y-3">
            {categoryLabel && (
              <p className={`text-xs font-semibold uppercase tracking-[0.35em] ${palette.muted}`}>
                {categoryLabel}
              </p>
            )}
            <h2 className={`font-serif text-3xl font-normal uppercase tracking-tight md:text-4xl lg:text-5xl ${palette.heading}`}>
              {title}
            </h2>
            {subtitle && (
              <p className={`max-w-xl text-sm sm:text-base font-light leading-relaxed ${palette.muted}`}>
                {subtitle}
              </p>
            )}
          </div>

          {showThemeToggle && (
            <button
              type="button"
              onClick={toggleTheme}
              className={`relative inline-flex h-11 shrink-0 items-center gap-3 rounded-full border px-5 text-sm font-medium transition-colors duration-500 cursor-pointer ${palette.toggleSurface} ${palette.toggle}`}
              aria-pressed={theme === "dark"}
            >
              <span className="relative flex h-6 w-6 items-center justify-center">
                <span
                  className={`pointer-events-none absolute inset-0 rounded-full border opacity-40 ${
                    theme === "dark" ? "border-[#C9BEAB]/40 animate-pulse" : "border-[#A78A9F]/40"
                  }`}
                />
                <span
                  className={`h-3 w-3 rounded-full transition-all duration-500 ${
                    theme === "dark" ? "bg-[#C9BEAB]" : "bg-[#725D75]"
                  }`}
                />
              </span>
              {theme === "dark" ? "Night" : "Day"} mode
            </button>
          )}
        </header>

        {/* Interactive Accordion Cards */}
        <ul className="space-y-4">
          {items.map((item, index) => {
            const open = activeIndex === index;
            const panelId = `faq-panel-${index}`;
            const buttonId = `faq-trigger-${index}`;

            return (
              <li
                key={item.question}
                className={`group relative overflow-hidden rounded-3xl border backdrop-blur-xl transition-all duration-500 hover:-translate-y-0.5 focus-within:-translate-y-0.5 ${palette.border} ${palette.panel} ${palette.shadow}`}
                onMouseMove={setCardGlow}
                onMouseLeave={clearCardGlow}
              >
                <div
                  className={`pointer-events-none absolute inset-0 transition-opacity duration-500 ${
                    open ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                  }`}
                  style={{
                    background: `radial-gradient(260px circle at var(--faq-x, 50%) var(--faq-y, 50%), ${palette.glow}, transparent 70%)`,
                  }}
                />

                <button
                  type="button"
                  id={buttonId}
                  aria-controls={panelId}
                  aria-expanded={open}
                  onClick={() => toggleQuestion(index)}
                  style={{
                    ["--faq-outline" as string]:
                      theme === "dark" ? "rgba(201,190,171,0.35)" : "rgba(52,32,60,0.25)",
                  }}
                  className="relative flex w-full items-start gap-5 px-6 py-6 sm:gap-6 sm:px-8 sm:py-7 text-left transition-colors duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--faq-outline)] cursor-pointer"
                >
                  <span
                    className={`relative flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-full border transition-all duration-500 group-hover:scale-105 ${palette.iconRing} ${palette.iconSurface}`}
                  >
                    <span
                      className={`pointer-events-none absolute inset-0 rounded-full border opacity-30 ${
                        palette.iconRing
                      } ${open ? "animate-ping" : ""}`}
                    />
                    <svg
                      className={`relative h-5 w-5 transition-transform duration-500 ${palette.icon} ${
                        open ? "rotate-45" : ""
                      }`}
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M12 5v14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      <path d="M5 12h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </span>

                  <div className="flex flex-1 flex-col gap-3 sm:gap-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                      <h3 className={`text-base font-semibold leading-snug sm:text-lg lg:text-xl ${palette.heading}`}>
                        {item.question}
                      </h3>
                      {item.meta && (
                        <span
                          className={`inline-flex w-fit items-center rounded-full border px-3 py-0.5 text-[10px] uppercase tracking-[0.3em] font-medium transition-opacity duration-300 sm:ml-auto ${palette.metaBorder} ${palette.metaText}`}
                        >
                          {item.meta}
                        </span>
                      )}
                    </div>

                    <div
                      id={panelId}
                      role="region"
                      aria-labelledby={buttonId}
                      className={`overflow-hidden text-sm sm:text-[15px] leading-relaxed transition-[max-height,opacity] duration-500 ease-out ${
                        open ? "max-h-80 opacity-100 pt-1" : "max-h-0 opacity-0"
                      } ${palette.muted}`}
                    >
                      <p className="pr-2 font-light">{item.answer}</p>
                    </div>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>

        {extraFooter && (
          <div className={`text-center text-xs sm:text-sm font-normal ${palette.muted}`}>
            {extraFooter}
          </div>
        )}
      </section>
    </div>
  );
}

export default FAQ1;
export { FAQ1, FAQ1 as FeaturesSectionMinimal, FAQ1 as FAQMonochrome };

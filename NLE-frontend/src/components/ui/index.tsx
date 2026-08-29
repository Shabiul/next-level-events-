import { cn } from '@/lib/utils';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/base-ui/navigation-menu';
import { Button } from '@/components/base-ui/button';
import { Badge } from '@/components/base-ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/base-ui/sheet';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/base-ui/accordion';
import {
  Cpu,
  Layers,
  GitBranch,
  Terminal,
  Command,
  User,
  Menu,
  ArrowUpRight,
} from 'lucide-react';

export function Navigation5() {
  return (
    <div className="relative w-full py-10">
      <div className="mx-auto flex max-w-7xl items-center justify-center px-6">
        {/* Floating Navbar Pill */}
        <div className="flex h-16 w-4xl items-center justify-between gap-2 rounded-full border border-[#381932] bg-[#FFF3E6] pr-3 shadow-sm md:w-5xl dark:border-[#381932] dark:bg-[#381932]">
          {/* Logo Section */}
          <div className="flex items-center gap-2 pr-6 pl-4">
            <div className="text-primary dark:text-primary flex h-8 w-8 items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-6 fill-current"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="text-lg font-bold tracking-tight text-[#381932] dark:text-[#FFF3E6]">
              Watermelon
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:block">
            <NavigationMenu
              className={cn(
                'static',
                // Position the viewport wrapper to be full-width relative to the navbar container
                '[&>div:last-child]:inset-x-0 [&>div:last-child]:top-full [&>div:last-child]:w-full',
                // Custom viewport styling for the "island" look
                '[&_[data-slot=navigation-menu-viewport]]:mx-auto [&_[data-slot=navigation-menu-viewport]]:-mt-6 [&_[data-slot=navigation-menu-viewport]]:max-w-7xl [&_[data-slot=navigation-menu-viewport]]:ring-0',
                '[&_[data-slot=navigation-menu-viewport]]:rounded-[2.5rem] [&_[data-slot=navigation-menu-viewport]]:border [&_[data-slot=navigation-menu-viewport]]:border-[#381932] dark:[&_[data-slot=navigation-menu-viewport]]:border-[#381932]',
                '[&_[data-slot=navigation-menu-viewport]]:bg-[#FFF3E6] [&_[data-slot=navigation-menu-viewport]]:shadow-2xl dark:[&_[data-slot=navigation-menu-viewport]]:bg-[#381932]',
                // Viewport smooth animations
                '[&_[data-slot=navigation-menu-viewport]]:transition-all [&_[data-slot=navigation-menu-viewport]]:duration-300 [&_[data-slot=navigation-menu-viewport]]:ease-in-out',
                '[&_[data-slot=navigation-menu-viewport]]:data-open:fade-in-0 [&_[data-slot=navigation-menu-viewport]]:data-closed:fade-out-0',
                '[&_[data-slot=navigation-menu-viewport]]:data-open:zoom-in-100 [&_[data-slot=navigation-menu-viewport]]:data-closed:zoom-out-100',
              )}
            >
              <NavigationMenuList className="gap-1">
                <NavigationMenuItem>
                  <NavigationMenuLink
                    className="rounded-full bg-transparent px-4 py-2 text-sm font-medium text-[#381932] transition-colors hover:text-[#381932] dark:text-[#381932] dark:hover:text-[#381932]"
                    href="#"
                  >
                    Features
                  </NavigationMenuLink>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuLink
                    className="flex items-center gap-2 rounded-full bg-transparent px-4 py-2 text-sm font-medium text-[#381932] transition-colors hover:text-[#381932] dark:text-[#381932] dark:hover:text-[#381932]"
                    href="#"
                  >
                    Developers
                    <Badge
                      variant="secondary"
                      className="bg-primary text-primary-foreground hover:bg-primary dark:bg-primary/20 dark:text-primary dark:hover:bg-primary/20 h-4 rounded-full px-1.5 text-[10px]"
                    >
                      API
                    </Badge>
                  </NavigationMenuLink>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuTrigger className="h-auto rounded-full bg-transparent px-4 py-2 text-sm font-medium text-[#381932] transition-all hover:bg-[#FFF3E6]/50 hover:text-[#381932] focus:bg-transparent data-[state=open]:bg-[#FFF3E6]/80 dark:text-[#381932] dark:hover:bg-[#381932]/50 dark:hover:text-[#381932] dark:data-[state=open]:bg-[#381932]/80">
                    Solutions
                  </NavigationMenuTrigger>
                  <NavigationMenuContent className="p-0">
                    <div className="grid w-5xl grid-cols-4 gap-6 divide-x divide-[#381932] px-10 py-10 dark:divide-[#381932]">
                      {/* Column 1 */}
                      <div className="flex flex-col px-2">
                        <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFF3E6] dark:bg-[#381932]">
                          <Cpu className="h-5 w-5 text-[#381932] dark:text-[#381932]" />
                        </div>
                        <h4 className="mb-1 text-sm font-medium text-[#381932] dark:text-[#381932]">
                          Compute Engine
                        </h4>
                        <p className="mb-3 text-sm tracking-tight text-[#381932] dark:text-[#381932]">
                          Train and deploy models with infinite scale
                          infrastructure.
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant="outline"
                            className="h-7 gap-1.5 rounded-full px-3 text-xs text-[#381932] dark:text-[#381932]"
                          >
                            <Layers className="h-3.5 w-3.5" />
                            Pipelines
                          </Button>
                          <Button
                            variant="outline"
                            className="h-7 gap-1.5 rounded-full px-3 text-xs text-[#381932] dark:text-[#381932]"
                          >
                            <GitBranch className="h-3.5 w-3.5" />
                            Webhooks
                          </Button>
                          <Button
                            variant="outline"
                            className="h-7 gap-1.5 rounded-full px-3 text-xs text-[#381932] dark:text-[#381932]"
                          >
                            <Terminal className="h-3.5 w-3.5" />
                            CLI Tool
                          </Button>
                        </div>
                      </div>

                      {/* Column 2 */}
                      <div className="flex flex-col gap-3 pl-6">
                        <h4 className="mb-1 text-xs text-[#381932] uppercase dark:text-[#381932]">
                          Use Cases
                        </h4>
                        <a
                          href="#"
                          className="text-sm font-medium tracking-tight text-[#381932] transition-colors hover:text-[#381932] dark:text-[#381932] dark:hover:text-[#381932]"
                        >
                          Fraud Detection
                        </a>
                        <a
                          href="#"
                          className="text-sm font-medium tracking-tight text-[#381932] transition-colors hover:text-[#381932] dark:text-[#381932] dark:hover:text-[#381932]"
                        >
                          Personalised Search
                        </a>
                        <a
                          href="#"
                          className="text-sm font-medium tracking-tight text-[#381932] transition-colors hover:text-[#381932] dark:text-[#381932] dark:hover:text-[#381932]"
                        >
                          Predictive Analytics
                        </a>
                        <a
                          href="#"
                          className="text-sm font-medium tracking-tight text-[#381932] transition-colors hover:text-[#381932] dark:text-[#381932] dark:hover:text-[#381932]"
                        >
                          LLM Gateways
                        </a>
                      </div>

                      {/* Column 3 */}
                      <div className="flex flex-col gap-3 pl-6">
                        <h4 className="mb-1 text-xs text-[#381932] uppercase dark:text-[#381932]">
                          Resources
                        </h4>
                        <a
                          href="#"
                          className="text-sm font-medium tracking-tight text-[#381932] transition-colors hover:text-[#381932] dark:text-[#381932] dark:hover:text-[#381932]"
                        >
                          Documentation
                        </a>
                        <a
                          href="#"
                          className="text-sm font-medium tracking-tight text-[#381932] transition-colors hover:text-[#381932] dark:text-[#381932] dark:hover:text-[#381932]"
                        >
                          API Reference
                        </a>
                        <a
                          href="#"
                          className="text-sm font-medium tracking-tight text-[#381932] transition-colors hover:text-[#381932] dark:text-[#381932] dark:hover:text-[#381932]"
                        >
                          System Status
                        </a>
                      </div>

                      {/* Column 4 */}
                      <div className="flex flex-col pl-6">
                        <h4 className="mb-4 text-xs text-[#381932] uppercase dark:text-[#381932]">
                          Featured
                        </h4>
                        <a
                          href="#"
                          className="group ring-primary/50 relative flex h-full flex-col justify-between overflow-hidden rounded-2xl p-6 ring transition-all"
                        >
                          <div className="from-primary/5 dark:from-primary/10 absolute inset-0 bg-gradient-to-br via-transparent to-transparent group-hover:opacity-100" />
                          <div className="absolute inset-0 -z-10 bg-[#FFF3E6] dark:bg-[#381932]" />

                          <div>
                            <Badge
                              variant="outline"
                              className="border-primary text-primary dark:border-primary dark:text-primary mb-3 bg-[#FFF3E6] dark:bg-[#381932]"
                            >
                              Upcoming Webinar
                            </Badge>
                            <h4 className="mb-2 text-sm font-semibold text-[#381932] dark:text-[#381932]">
                              Building scalable AI pipelines
                            </h4>
                            <p className="text-sm tracking-tight text-[#381932] dark:text-[#381932]">
                              Join our engineers for a live teardown of the new
                              Compute Engine architecture.
                            </p>
                          </div>

                          <div className="text-primary dark:text-primary mt-4 flex items-center text-sm font-medium">
                            Register now{' '}
                            <ArrowUpRight className="ml-1 size-4 transition-transform group-hover:translate-x-1" />
                          </div>
                        </a>
                      </div>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuLink
                    className="rounded-full bg-transparent px-4 py-2 text-sm font-medium text-[#381932] transition-colors hover:text-[#381932] dark:text-[#381932] dark:hover:text-[#381932]"
                    href="#"
                  >
                    Customers
                  </NavigationMenuLink>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuLink
                    className="rounded-full bg-transparent px-4 py-2 text-sm font-medium text-[#381932] transition-colors hover:text-[#381932] dark:text-[#381932] dark:hover:text-[#381932]"
                    href="#"
                  >
                    Enterprise
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* Action Icons Section */}
          <div className="flex items-center gap-2">
            <div className="flex hidden items-center gap-1 md:flex">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full text-[#381932] hover:bg-[#FFF3E6] dark:text-[#381932] dark:hover:bg-[#381932]"
              >
                <Command className="size-4.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full text-[#381932] hover:bg-[#FFF3E6] dark:text-[#381932] dark:hover:bg-[#381932]"
              >
                <User className="size-4.5" />
              </Button>
            </div>
            <Button className="bg-primary hover:bg-primary dark:bg-primary dark:hover:bg-primary hidden rounded-full px-6 font-semibold text-[#FFF3E6] md:block">
              Get started
            </Button>

            {/* Mobile Menu Trigger */}
            <div className="lg:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-lg"
                    className="rounded-full text-[#381932] dark:text-[#381932]"
                  >
                    <Menu className="size-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="right"
                  className="flex w-[300px] flex-col gap-6 p-6 dark:bg-[#381932]"
                >
                  <div className="flex items-center gap-2">
                    <div className="text-primary dark:text-primary flex h-8 w-8 items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="size-6 fill-current"
                      >
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                      </svg>
                    </div>
                    <span className="text-lg font-bold text-[#381932] dark:text-[#FFF3E6]">
                      Watermelon
                    </span>
                  </div>

                  <div className="flex flex-col gap-4">
                    <a
                      href="#"
                      className="text-base font-medium text-[#381932] dark:text-[#381932]"
                    >
                      Features
                    </a>
                    <div className="flex items-center justify-between">
                      <a
                        href="#"
                        className="text-base font-medium text-[#381932] dark:text-[#381932]"
                      >
                        Developers
                      </a>
                      <Badge
                        variant="secondary"
                        className="bg-primary text-primary dark:bg-primary/20 dark:text-primary"
                      >
                        API
                      </Badge>
                    </div>

                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="solutions" className="border-none">
                        <AccordionTrigger className="justify-between py-0 text-base font-medium text-[#381932] hover:no-underline dark:text-[#381932]">
                          Solutions
                        </AccordionTrigger>
                        <AccordionContent className="mt-1 ml-2 flex !h-auto flex-col gap-3 border-l border-[#381932] pb-0 pl-4 text-base font-medium dark:border-[#381932] [&_a]:no-underline">
                          <div className="flex flex-col gap-2 pt-4">
                            <span className="text-xs text-[#381932] uppercase">
                              Infrastructure
                            </span>
                            <a
                              href="#"
                              className="hover:text-primary dark:hover:text-primary text-sm font-medium tracking-tight text-[#381932] dark:text-[#381932]"
                            >
                              Compute Engine
                            </a>
                            <a
                              href="#"
                              className="hover:text-primary dark:hover:text-primary text-sm font-medium tracking-tight text-[#381932] dark:text-[#381932]"
                            >
                              System Status
                            </a>
                          </div>
                          <div className="mt-2 flex flex-col gap-2">
                            <span className="text-xs text-[#381932] uppercase">
                              Use Cases
                            </span>
                            <a
                              href="#"
                              className="hover:text-primary dark:hover:text-primary text-sm font-medium tracking-tight text-[#381932] dark:text-[#381932]"
                            >
                              Fraud Detection
                            </a>
                            <a
                              href="#"
                              className="hover:text-primary dark:hover:text-primary text-sm font-medium tracking-tight text-[#381932] dark:text-[#381932]"
                            >
                              Predictive Analytics
                            </a>
                            <a
                              href="#"
                              className="hover:text-primary dark:hover:text-primary text-sm font-medium tracking-tight text-[#381932] dark:text-[#381932]"
                            >
                              LLM Gateways
                            </a>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>

                    <a
                      href="#"
                      className="text-base font-medium text-[#381932] dark:text-[#381932]"
                    >
                      Customers
                    </a>
                    <a
                      href="#"
                      className="text-base font-medium text-[#381932] dark:text-[#381932]"
                    >
                      Enterprise
                    </a>
                  </div>

                  <div className="mt-auto flex flex-col gap-3">
                    <Button className="bg-primary hover:bg-primary w-full rounded-full text-[#FFF3E6]">
                      Get started
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

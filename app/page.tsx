import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Page() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-2xl text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground tracking-tight">
            Welcome to MS Fabric Starter Kit
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            This is the home page of the MS Fabric Starter Kit. You can use this
            starter kit to quickly set up a new project with Microsoft Fabric.
          </p>
        </div>
        <Button
          size="lg"
          render={<Link href="/drizzle" />}
          nativeButton={false}
        >
          Get Started
        </Button>
      </div>
    </main>
  );
}

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import XLogo from "./icons/XLogo";
import { Button } from "@/components/ui/button";
import { Github, X, Coffee } from "lucide-react";
import Image from "next/image";

export const BuyCoffee = ({ setShowBuyCoffee }: { setShowBuyCoffee: (show: boolean) => void }) => (
  <Card className="relative bg-neutral-800 border border-neutral-700 shadow-md max-w-xs mx-auto rounded-xl overflow-hidden">
    {/* Close Button */}
    <button
      onClick={() => setShowBuyCoffee(false)}
      className="absolute top-2 right-2 p-1 rounded-full hover:bg-neutral-700 transition"
      aria-label="Close"
    >
      <X className="w-5 h-5 text-neutral-400 hover:text-white" />
    </button>
    
    {/* Header with Ghost and Title */}
    <CardHeader className="pt-5 pb-1 flex flex-col items-center">
      <div className="relative">
        <Image
          src="/yurei-ghost.svg"
          alt="Yurei Ghost"
          width={48}
          height={48}
          className="mb-2 drop-shadow-md"
        />
      
      <div
  className="
    absolute -top-2 left-12
    bg-neutral-600 text-xs font-medium text-white
    px-4 py-1 rounded-full
    before:content-[''] before:absolute before:top-full before:left-2 before:border-4 before:border-transparent before:border-t-neutral-600 before:border-l-neutral-600
  "
>
  BETA
</div>
      </div>
      <CardTitle className="text-base font-semibold text-neutral-100 tracking-tight">
        monthly limit reached!
      </CardTitle>
    </CardHeader>
    
    {/* Card Content */}
    <CardContent className="flex flex-col items-center gap-4 pb-4">
      <p className="text-sm text-neutral-400 max-w-xs text-center">
          please donate money for api credits to keep this running. 
      </p>
      
      {/* Actions Section */}
      <div className="space-y-4 w-full">
        {/* Buy Me a Coffee Button */}
        <div className="flex justify-center">
          <Link href="https://buymeacoffee.com/kasper0990">
            <Button className="px-6 h-9 text-sm bg-white hover:bg-neutral-100 text-neutral-900 rounded-full font-normal transition-colors">
              <Coffee className="w-4 h-4 mr-2" />
              Buy me a coffee
            </Button>
          </Link>
        </div>
        
        {/* Social Links */}
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs text-neutral-400">stay in the loop</span>
          <div className="flex gap-3">
            <Link href="https://x.com/kasper0990">
              <XLogo className="w-4 h-4 text-neutral-400 hover:text-white transition-colors" />
            </Link>
            <Link href="https://github.com/kasper0990/yurei-app">
              <Github className="w-4 h-4 text-neutral-400 hover:text-white transition-colors" />
            </Link>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);
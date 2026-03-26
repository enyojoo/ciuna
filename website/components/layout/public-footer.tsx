import type { SVGProps } from "react"
import Link from "next/link"

function TelegramIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  )
}

export function PublicFooter() {
  return (
    <footer className="w-full border-t bg-white/80 backdrop-blur-md">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
            <div className="flex flex-col items-center sm:items-start gap-2">
              <div className="text-xs sm:text-sm text-gray-500 text-center sm:text-left">© {new Date().getFullYear()} Ciuna</div>
              <div className="flex items-center gap-3">
                <a
                  href="https://t.me/ciuna_help"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-ciuna-primary transition-colors"
                  aria-label="Telegram support"
                >
                  <TelegramIcon />
                </a>
              </div>
            </div>
            <div className="flex items-center space-x-6 sm:space-x-8">
              <Link href="/terms" className="text-xs sm:text-sm text-gray-500 hover:text-ciuna-primary transition-colors">Terms</Link>
              <Link href="/privacy" className="text-xs sm:text-sm text-gray-500 hover:text-ciuna-primary transition-colors">Privacy Policy</Link>
            </div>
          </div>
          <div className="text-center sm:text-left text-xs sm:text-sm text-gray-500">
            <p>
              Need help? Email us at{" "}
              <a href="mailto:hello@ciuna.com" className="text-ciuna-primary hover:underline">hello@ciuna.com</a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

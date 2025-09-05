import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Home, FileText, Heart, Settings, Clock, Folder } from "lucide-react"

export default function MobileNavigation() {
  return (
    <div className="h-full bg-white/40 backdrop-blur-md flex flex-col">
      <div className="p-6 border-b-4 border-black">
        <h2 className="text-2xl font-black">POSTCRAFT</h2>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <nav className="space-y-2 mb-8">
          <Link href="/" className="flex items-center gap-3 text-lg font-bold p-3 bg-black text-white rounded-xl">
            <Home className="h-5 w-5" />
            Home
          </Link>

          <div className="space-y-2">
            <div className="flex items-center gap-3 px-3 py-2 font-bold text-sm text-gray-600">
              <FileText className="h-5 w-5" />
              My Prompts
            </div>
            <Link
              href="/recent"
              className="flex items-center gap-3 text-lg font-bold p-3 pl-6 hover:bg-black/10 rounded-xl"
            >
              <Clock className="h-4 w-4" />
              Recent Prompts
            </Link>
            <Link
              href="/favorites"
              className="flex items-center gap-3 text-lg font-bold p-3 pl-6 hover:bg-black/10 rounded-xl"
            >
              <Heart className="h-4 w-4" />
              My Favorite Prompt
            </Link>
          </div>

          <Link href="/folders" className="flex items-center gap-3 text-lg font-bold p-3 hover:bg-black/10 rounded-xl">
            <Folder className="h-5 w-5" />
            Prompt Folders
          </Link>

          <Link href="/settings" className="flex items-center gap-3 text-lg font-bold p-3 hover:bg-black/10 rounded-xl">
            <Settings className="h-5 w-5" />
            Settings
          </Link>
        </nav>
      </div>

      <div className="p-4 border-t-4 border-black">
        <div className="grid grid-cols-1 gap-2">
          <Button className="bg-black hover:bg-black/80 text-white rounded-xl border-2 border-black font-bold">
            CREATE PROMPT
          </Button>
        </div>
      </div>
    </div>
  )
}

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { getInitials } from "@/utils/post-comments-helpers"


const AVATAR_GRADIENTS = [
  "from-violet-500 to-purple-600",
  "from-blue-500 to-cyan-500",
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-600",
  "from-pink-500 to-rose-600",
  "from-indigo-500 to-blue-600",
  "from-fuchsia-500 to-pink-600",
  "from-sky-500 to-indigo-600",
]

function avatarGradient(name: string) {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return AVATAR_GRADIENTS[Math.abs(hash) % AVATAR_GRADIENTS.length]
}

interface AuthorAvatarProps {
  name: string
  className?: string
}

export function AuthorAvatar({
  name,
  className = "h-9 w-9",
}: AuthorAvatarProps) {
  return (
    <Avatar className={`${className} shrink-0 ring-2 ring-background`}>
      <AvatarFallback
        className={`bg-gradient-to-br text-[11px] font-semibold text-white ${avatarGradient(
          name,
        )}`}
      >
        {getInitials(name)}
      </AvatarFallback>
    </Avatar>
  )
}
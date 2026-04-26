import { useState, useEffect } from 'react'
import { Heart } from 'lucide-react'
import { User, Project } from '../types/index'

interface LikeButtonProps {
  project: Project
  currentUser: User | null
  onLikeChange?: (liked: boolean, likesCount: number) => void
}

export default function LikeButton({ project, currentUser, onLikeChange }: LikeButtonProps) {
  const [liked, setLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(project.likes?.length || 0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (currentUser && project.likes) {
      setLiked(project.likes.some(like => like.userId === currentUser.id))
    }
    setLikesCount(project.likes?.length || 0)
  }, [project.likes, currentUser])

  const handleLike = async () => {
    if (!currentUser || loading) return

    setLoading(true)
    try {
      const response = await fetch('/api/likes', {
        method: liked ? 'DELETE' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ projectId: project.id }),
      })

      if (response.ok) {
        const newLiked = !liked
        const newLikesCount = liked ? likesCount - 1 : likesCount + 1
        
        setLiked(newLiked)
        setLikesCount(newLikesCount)
        
        onLikeChange?.(newLiked, newLikesCount)
      }
    } catch (error) {
      console.error('Error toggling like:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleLike}
      disabled={!currentUser || loading}
      className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-medium transition duration-200 ${
        liked
          ? 'border-rose-300/30 bg-rose-300/20 text-rose-100 hover:bg-rose-300/25'
          : 'border-white/10 bg-white/[0.05] text-stone-300 hover:border-white/20 hover:bg-white/[0.09] hover:text-white'
      } ${!currentUser ? 'cursor-not-allowed opacity-50' : ''}`}
    >
      <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
      <span>{likesCount}</span>
    </button>
  )
}

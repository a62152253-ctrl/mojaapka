import { useEffect, useState } from 'react'
import { MessageCircle, Send, User } from 'lucide-react'
import { User as UserType, Comment, Project } from '../types/index'
import { ProjectsAPI } from '../api/projects'

interface CommentSectionProps {
  project: Project
  currentUser: UserType | null
  onCommentAdded?: (comment: Comment) => void
}

export default function CommentSection({ project, currentUser, onCommentAdded }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    setComments(project.comments || [])
  }, [project.comments])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!currentUser || !newComment.trim() || submitting) return

    setSubmitting(true)
    try {
      const response = await ProjectsAPI.addComment({
        content: newComment.trim(),
        projectId: project.id,
        userId: currentUser.id,
        user: currentUser,
      })

      if (response.success && response.data) {
        const newCommentData = response.data
        setComments((previous) => [newCommentData, ...previous])
        setNewComment('')
        onCommentAdded?.(newCommentData)
      }
    } catch (error) {
      console.error('Error adding comment:', error)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="surface-panel-strong p-6 sm:p-7">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/[0.06]">
          <MessageCircle className="h-5 w-5 text-teal-200" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">Comments</h3>
          <p className="text-sm text-stone-400">{comments.length} conversation{comments.length === 1 ? '' : 's'} on this project</p>
        </div>
      </div>

      {currentUser && (
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="flex gap-3">
            <div className="shrink-0">
              {currentUser.avatar ? (
                <img src={currentUser.avatar} alt={currentUser.username} className="h-11 w-11 rounded-full border border-white/10 object-cover" />
              ) : (
                <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.04]">
                  <User className="h-5 w-5 text-stone-500" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(event) => setNewComment(event.target.value)}
                placeholder="Share feedback, ask a question, or leave a note for the builder."
                className="input-base min-h-[120px] resize-none"
                rows={4}
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={!newComment.trim() || submitting} className="btn-primary rounded-2xl px-4 py-3 disabled:cursor-not-allowed disabled:opacity-50">
              <Send className="h-4 w-4" />
              {submitting ? 'Posting...' : 'Post comment'}
            </button>
          </div>
        </form>
      )}

      <div className="mt-8 space-y-4">
        {comments.length === 0 ? (
          <div className="rounded-[1.5rem] border border-dashed border-white/10 bg-white/[0.03] px-6 py-10 text-center text-stone-400">
            No comments yet. Start the conversation.
          </div>
        ) : (
          comments.map((comment) => (
            <article key={comment.id} className="rounded-[1.5rem] border border-white/8 bg-white/[0.04] p-4 sm:p-5">
              <div className="flex gap-3">
                <div className="shrink-0">
                  {comment.user.avatar ? (
                    <img src={comment.user.avatar} alt={comment.user.username} className="h-10 w-10 rounded-full border border-white/10 object-cover" />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04]">
                      <User className="h-5 w-5 text-stone-500" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-white">{comment.user.username}</span>
                    <span className="text-xs uppercase tracking-[0.18em] text-stone-500">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-stone-300">{comment.content}</p>
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  )
}

/**
 * Project Card Component
 *
 * Displays a single project card (issue/PR/note) with:
 * - Issue/PR reference and title
 * - Status badges (open/closed, in progress)
 * - Assignee avatars
 * - Labels display
 * - Priority indicator
 */

'use client'

import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card } from '@/components/ui/card'
import { ExternalLink, CheckCircle2, AlertCircle, Clock } from 'lucide-react'
import { ProjectCard as ProjectCardType } from '@/types/api'

interface ProjectCardProps {
  card: ProjectCardType
  onCardClick?: (card: ProjectCardType) => void
}

export function ProjectCard({ card, onCardClick }: ProjectCardProps) {
  const {
    id,
    note,
    content,
    contentType,
    isClosed,
    assigneeAvatars,
    priority,
    archived,
  } = card

  // Determine card color based on type and status
  const getCardVariant = () => {
    if (archived) return 'muted'
    if (isClosed) return 'secondary'
    return 'default'
  }

  // Get priority color
  const getPriorityColor = () => {
    switch (priority) {
      case 'high':
        return 'bg-red-500'
      case 'medium':
        return 'bg-yellow-500'
      case 'low':
        return 'bg-green-500'
      default:
        return 'bg-gray-500'
    }
  }

  // Get status icon
  const getStatusIcon = () => {
    if (contentType === 'note') {
      return <Clock className="h-3 w-3" />
    }
    if (isClosed) {
      return <CheckCircle2 className="h-3 w-3 text-green-500" />
    }
    return <AlertCircle className="h-3 w-3 text-blue-500" />
  }

  return (
    <Card
      className={`p-3 cursor-pointer hover:shadow-md transition-shadow ${
        archived ? 'opacity-60' : ''
      }`}
      onClick={() => onCardClick?.(card)}
    >
      {/* Card Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {getStatusIcon()}

          {/* Content Type Badge */}
          <Badge variant="outline" className="text-xs">
            {contentType === 'note'
              ? 'Note'
              : contentType === 'pull_request'
              ? 'PR'
              : 'Issue'}
          </Badge>

          {/* Priority Indicator */}
          {priority && priority !== 'low' && (
            <div className="flex items-center gap-1">
              <div
                className={`h-2 w-2 rounded-full ${getPriorityColor()}`}
                title={`Priority: ${priority}`}
              />
            </div>
          )}
        </div>

        {/* External Link */}
        {content?.html_url && (
          <a
            href={content.html_url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-muted-foreground hover:text-foreground"
          >
            <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>

      {/* Card Content */}
      <div className="space-y-2">
        {/* Title or Note */}
        {note ? (
          <p className="text-sm text-muted-foreground line-clamp-3">{note}</p>
        ) : content ? (
          <div>
            <p className="text-sm font-medium line-clamp-2 mb-1">
              {content.title}
            </p>
            <p className="text-xs text-muted-foreground">
              {content.repository.full_name} #{content.number}
            </p>
          </div>
        ) : null}

        {/* Labels */}
        {content?.labels && content.labels.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {content.labels.slice(0, 3).map((label) => (
              <Badge
                key={label.id}
                variant="outline"
                className="text-xs"
                style={{
                  borderColor: `#${label.color}`,
                  color: `#${label.color}`,
                }}
              >
                {label.name}
              </Badge>
            ))}
            {content.labels.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{content.labels.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Assignees */}
        {assigneeAvatars && assigneeAvatars.length > 0 && (
          <div className="flex items-center gap-1">
            <div className="flex -space-x-2">
              {assigneeAvatars.slice(0, 3).map((avatar, index) => (
                <Avatar key={index} className="h-6 w-6 border-2 border-background">
                  <AvatarImage src={avatar} />
                  <AvatarFallback className="text-xs">
                    {avatar.split('/').pop()?.[0]?.toUpperCase() || '?'}
                  </AvatarFallback>
                </Avatar>
              ))}
            </div>
            {assigneeAvatars.length > 3 && (
              <span className="text-xs text-muted-foreground ml-1">
                +{assigneeAvatars.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Milestone */}
        {content?.milestone && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <span className="font-medium">Milestone:</span>
            <span>{content.milestone.title}</span>
          </div>
        )}
      </div>
    </Card>
  )
}

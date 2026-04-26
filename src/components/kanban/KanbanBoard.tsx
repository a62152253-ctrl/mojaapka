import React, { useState, useEffect, useCallback } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd'
import {
  Plus,
  MoreHorizontal,
  Users,
  Calendar,
  Clock,
  Tag,
  MessageSquare,
  Paperclip,
  CheckSquare,
  AlertCircle,
  ChevronDown,
  Settings,
  Filter,
  Search,
  Layout,
  BarChart3,
  Timer
} from 'lucide-react'
import {
  KanbanBoard,
  KanbanColumn,
  KanbanCard,
  CardLabel,
  CardType,
  Priority,
  CardStatus,
  KanbanStatistics
} from '../../types/kanban'
import { KanbanService } from '../../services/kanbanService'
import { User } from '../../types'

interface KanbanBoardProps {
  user: User
  boardId: string
}

const priorityColors: Record<Priority, string> = {
  LOW: '#6B7280',
  MEDIUM: '#F59E0B',
  HIGH: '#EF4444',
  URGENT: '#DC2626'
}

const typeIcons: Record<CardType, React.ReactNode> = {
  TASK: <CheckSquare className="w-4 h-4" />,
  BUG: <AlertCircle className="w-4 h-4" />,
  FEATURE: <Tag className="w-4 h-4" />,
  EPIC: <Layout className="w-4 h-4" />,
  STORY: <MessageSquare className="w-4 h-4" />,
  SUBTASK: <ChevronDown className="w-4 h-4" />
}

export default function KanbanBoardComponent({ user, boardId }: KanbanBoardProps) {
  const [board, setBoard] = useState<KanbanBoard | null>(null)
  const [labels, setLabels] = useState<CardLabel[]>([])
  const [statistics, setStatistics] = useState<KanbanStatistics | null>(null)
  const [loading, setLoading] = useState(true)
  const [showSettings, setShowSettings] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'board' | 'list' | 'calendar' | 'statistics'>('board')
  const [selectedCard, setSelectedCard] = useState<KanbanCard | null>(null)
  const [showCardModal, setShowCardModal] = useState(false)

  useEffect(() => {
    loadBoardData()
  }, [boardId])

  const loadBoardData = async () => {
    try {
      const [boardData, boardLabels, boardStats] = await Promise.all([
        KanbanService.getBoardById(boardId),
        KanbanService.getLabelsByBoardId(boardId),
        KanbanService.getBoardStatistics(boardId)
      ])

      setBoard(boardData)
      setLabels(boardLabels)
      setStatistics(boardStats)
    } catch (error) {
      console.error('Failed to load board data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDragEnd = useCallback(async (result: DropResult) => {
    if (!result.destination || !board) return

    const { draggableId, source, destination } = result

    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return
    }

    try {
      await KanbanService.moveCard(
        draggableId,
        source.droppableId,
        destination.droppableId,
        destination.index
      )

      // Update local state
      const updatedColumns = [...board.columns]
      const sourceColumn = updatedColumns.find(col => col.id === source.droppableId)
      const destColumn = updatedColumns.find(col => col.id === destination.droppableId)

      if (sourceColumn && destColumn) {
        const [movedCard] = sourceColumn.cards.splice(source.index, 1)
        destColumn.cards.splice(destination.index, 0, movedCard)

        setBoard({ ...board, columns: updatedColumns })
      }
    } catch (error) {
      console.error('Failed to move card:', error)
    }
  }, [board])

  const handleCreateCard = async (columnId: string) => {
    const title = prompt('Enter card title:')
    if (!title) return

    try {
      const newCard = await KanbanService.createCard({
        title,
        type: 'TASK',
        priority: 'MEDIUM',
        columnId,
        createdBy: user.id
      })

      if (board) {
        const updatedColumns = board.columns.map(col => {
          if (col.id === columnId) {
            return { ...col, cards: [...col.cards, newCard] }
          }
          return col
        })
        setBoard({ ...board, columns: updatedColumns })
      }
    } catch (error) {
      console.error('Failed to create card:', error)
    }
  }

  const handleCreateColumn = async () => {
    const name = prompt('Enter column name:')
    if (!name) return

    const color = '#' + Math.floor(Math.random()*16777215).toString(16)

    try {
      const newColumn = await KanbanService.createColumn({
        boardId,
        name,
        color,
        position: board?.columns.length || 0
      })

      if (board) {
        setBoard({ ...board, columns: [...board.columns, newColumn] })
      }
    } catch (error) {
      console.error('Failed to create column:', error)
    }
  }

  const getCardLabels = (card: KanbanCard) => {
    return labels.filter(label => card.labelIds.includes(label.id))
  }

  const getPriorityColor = (priority: Priority) => {
    return priorityColors[priority]
  }

  const isOverdue = (dueDate?: string) => {
    if (!dueDate) return false
    return new Date(dueDate) < new Date()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!board) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Board not found</h3>
          <p className="text-gray-400">The requested board could not be loaded.</p>
        </div>
      </div>
    )
  }

  if (viewMode === 'statistics') {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">{board.name} - Statistics</h2>
          <button
            onClick={() => setViewMode('board')}
            className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600"
          >
            Back to Board
          </button>
        </div>

        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gray-800 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Overview</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Total Cards:</span>
                  <span className="font-bold">{statistics.totalCards}</span>
                </div>
                <div className="flex justify-between">
                  <span>Completed:</span>
                  <span className="font-bold text-green-500">{statistics.completedCards}</span>
                </div>
                <div className="flex justify-between">
                  <span>Overdue:</span>
                  <span className="font-bold text-red-500">{statistics.overdueCards}</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">By Status</h3>
              <div className="space-y-2">
                {Object.entries(statistics.cardsByStatus).map(([status, count]) => (
                  <div key={status} className="flex justify-between">
                    <span className="capitalize">{status.replace('_', ' ')}:</span>
                    <span className="font-bold">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">By Priority</h3>
              <div className="space-y-2">
                {Object.entries(statistics.cardsByPriority).map(([priority, count]) => (
                  <div key={priority} className="flex justify-between">
                    <span className="capitalize">{priority}:</span>
                    <span className="font-bold" style={{ color: getPriorityColor(priority as Priority) }}>
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Time Tracking</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Estimated:</span>
                  <span className="font-bold">{statistics.totalEstimatedHours}h</span>
                </div>
                <div className="flex justify-between">
                  <span>Actual:</span>
                  <span className="font-bold">{statistics.totalActualHours}h</span>
                </div>
                <div className="flex justify-between">
                  <span>Efficiency:</span>
                  <span className="font-bold">
                    {statistics.totalEstimatedHours > 0 
                      ? Math.round((statistics.totalEstimatedHours / statistics.totalActualHours) * 100)
                      : 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold">{board.name}</h1>
            {board.description && (
              <p className="text-gray-400">{board.description}</p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search cards..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-3 py-2 bg-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600"
            >
              <Filter className="w-4 h-4" />
            </button>

            <div className="flex bg-gray-700 rounded-lg">
              <button
                onClick={() => setViewMode('board')}
                className={`p-2 rounded-l-lg ${viewMode === 'board' ? 'bg-blue-600' : 'hover:bg-gray-600'}`}
              >
                <Layout className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-blue-600' : 'hover:bg-gray-600'}`}
              >
                <MessageSquare className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`p-2 ${viewMode === 'calendar' ? 'bg-blue-600' : 'hover:bg-gray-600'}`}
              >
                <Calendar className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('statistics')}
                className={`p-2 rounded-r-lg ${viewMode === 'statistics' ? 'bg-blue-600' : 'hover:bg-gray-600'}`}
              >
                <BarChart3 className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={handleCreateColumn}
              className="px-3 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Column
            </button>

            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto">
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex h-full p-4 space-x-4" style={{ minWidth: 'max-content' }}>
            {board.columns.map((column) => (
              <div key={column.id} className="flex-shrink-0 w-80">
                <div className="bg-gray-800 rounded-lg">
                  {/* Column Header */}
                  <div className="p-3 border-b border-gray-700">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: column.color }}
                        />
                        <h3 className="font-semibold">{column.name}</h3>
                        <span className="text-sm text-gray-400">
                          {column.cards.length}
                        </span>
                        {column.wipLimit && (
                          <span className={`text-xs px-2 py-1 rounded ${
                            column.cards.length >= column.wipLimit
                              ? 'bg-red-600 text-white'
                              : 'bg-gray-600 text-gray-300'
                          }`}>
                            {column.cards.length}/{column.wipLimit}
                          </span>
                        )}
                      </div>
                      <button className="p-1 hover:bg-gray-700 rounded">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Cards */}
                  <Droppable droppableId={column.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`p-3 min-h-[200px] ${
                          snapshot.isDraggingOver ? 'bg-gray-700' : ''
                        }`}
                      >
                        {column.cards
                          .filter(card => 
                            card.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            card.description?.toLowerCase().includes(searchTerm.toLowerCase())
                          )
                          .map((card, index) => (
                            <Draggable key={card.id} draggableId={card.id} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`bg-gray-700 rounded-lg p-3 mb-2 cursor-pointer hover:bg-gray-600 ${
                                    snapshot.isDragging ? 'shadow-lg' : ''
                                  }`}
                                  onClick={() => {
                                    setSelectedCard(card)
                                    setShowCardModal(true)
                                  }}
                                >
                                  {/* Card Header */}
                                  <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center space-x-2">
                                      {typeIcons[card.type]}
                                      <span
                                        className="w-2 h-2 rounded-full"
                                        style={{ backgroundColor: getPriorityColor(card.priority) }}
                                      />
                                    </div>
                                    <div className="flex items-center space-x-1">
                                      {card.comments.length > 0 && (
                                        <div className="flex items-center text-xs text-gray-400">
                                          <MessageSquare className="w-3 h-3 mr-1" />
                                          {card.comments.length}
                                        </div>
                                      )}
                                      {card.attachments.length > 0 && (
                                        <div className="flex items-center text-xs text-gray-400">
                                          <Paperclip className="w-3 h-3 mr-1" />
                                          {card.attachments.length}
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Card Title */}
                                  <h4 className="font-medium text-white mb-2">{card.title}</h4>

                                  {/* Card Description */}
                                  {card.description && (
                                    <p className="text-sm text-gray-400 mb-2 line-clamp-2">
                                      {card.description}
                                    </p>
                                  )}

                                  {/* Labels */}
                                  {card.labelIds.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mb-2">
                                      {getCardLabels(card).map(label => (
                                        <span
                                          key={label.id}
                                          className="text-xs px-2 py-1 rounded"
                                          style={{ backgroundColor: label.color }}
                                        >
                                          {label.name}
                                        </span>
                                      ))}
                                    </div>
                                  )}

                                  {/* Card Footer */}
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                      {card.assigneeIds.length > 0 && (
                                        <div className="flex -space-x-2">
                                          {card.assigneeIds.slice(0, 3).map((assigneeId, index) => (
                                            <div
                                              key={assigneeId}
                                              className="w-6 h-6 bg-blue-500 rounded-full border-2 border-gray-700 flex items-center justify-center text-xs"
                                            >
                                              {assigneeId.charAt(0).toUpperCase()}
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </div>

                                    <div className="flex items-center space-x-2 text-xs text-gray-400">
                                      {card.dueDate && (
                                        <div className={`flex items-center ${
                                          isOverdue(card.dueDate) ? 'text-red-400' : ''
                                        }`}>
                                          <Calendar className="w-3 h-3 mr-1" />
                                          {new Date(card.dueDate).toLocaleDateString()}
                                        </div>
                                      )}
                                      {card.estimatedHours && (
                                        <div className="flex items-center">
                                          <Clock className="w-3 h-3 mr-1" />
                                          {card.estimatedHours}h
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>

                  {/* Add Card Button */}
                  <div className="p-3 border-t border-gray-700">
                    <button
                      onClick={() => handleCreateCard(column.id)}
                      className="w-full p-2 bg-gray-700 rounded-lg hover:bg-gray-600 flex items-center justify-center text-gray-400 hover:text-white"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Card
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </DragDropContext>
      </div>
    </div>
  )
}

import { ReactNode } from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface UserStatsProps {
  title: string
  value: string | number
  change?: number
  changeType?: 'increase' | 'decrease' | 'neutral'
  icon?: ReactNode
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red'
  description?: string
}

export default function UserStats({ 
  title, 
  value, 
  change, 
  changeType = 'neutral', 
  icon, 
  color = 'blue',
  description 
}: UserStatsProps) {
  const getColorClasses = () => {
    switch (color) {
      case 'blue':
        return 'from-blue-600 to-blue-700 border-blue-500'
      case 'green':
        return 'from-green-600 to-green-700 border-green-500'
      case 'purple':
        return 'from-purple-600 to-purple-700 border-purple-500'
      case 'orange':
        return 'from-orange-600 to-orange-700 border-orange-500'
      case 'red':
        return 'from-red-600 to-red-700 border-red-500'
      default:
        return 'from-gray-600 to-gray-700 border-gray-500'
    }
  }

  const getChangeColor = () => {
    switch (changeType) {
      case 'increase':
        return 'text-green-300'
      case 'decrease':
        return 'text-red-300'
      default:
        return 'text-gray-300'
    }
  }

  return (
    <div className={`bg-gradient-to-br ${getColorClasses()} rounded-xl p-6 border`}>
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 bg-white/10 rounded-lg">
          {icon}
        </div>
        {change !== undefined && (
          <div className={`flex items-center ${getChangeColor()}`}>
            {changeType === 'increase' ? (
              <TrendingUp className="w-4 h-4 mr-1" />
            ) : changeType === 'decrease' ? (
              <TrendingDown className="w-4 h-4 mr-1" />
            ) : (
              <Minus className="w-4 h-4 mr-1" />
            )}
            <span className="text-sm font-medium">
              {Math.abs(change)}%
            </span>
          </div>
        )}
      </div>
      
      <h3 className="text-2xl font-bold text-white mb-1">{value}</h3>
      <p className="text-white/80 text-sm">{title}</p>
      
      {description && (
        <p className="text-white/60 text-xs mt-2">{description}</p>
      )}
    </div>
  )
}

import { Search, Plus, Bell, Settings, CreditCard, Download, Filter, RefreshCw } from 'lucide-react'

interface QuickActionsProps {
  onSearch?: (query: string) => void
  onCreateProject?: () => void
  onRefresh?: () => void
  onSettings?: () => void
  onNotifications?: () => void
  onWallet?: () => void
}

export default function QuickActions({ 
  onSearch, 
  onCreateProject, 
  onRefresh, 
  onSettings, 
  onNotifications, 
  onWallet 
}: QuickActionsProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      {/* Search Bar */}
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search projects..."
          onChange={(e) => onSearch?.(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      
      {/* Action Buttons */}
      <div className="flex items-center space-x-2">
        <button
          onClick={onRefresh}
          className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
          title="Refresh"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
        
        <button
          onClick={onNotifications}
          className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors relative"
          title="Notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        
        <button
          onClick={onWallet}
          className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
          title="Wallet"
        >
          <CreditCard className="w-5 h-5" />
        </button>
        
        <button
          onClick={onSettings}
          className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
          title="Settings"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}

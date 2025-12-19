import { useState, useEffect } from 'react'
import axios from 'axios'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

interface DashboardData {
  activeMembers: number
  inactiveMembers: number
  trialConversionRate: number
  coachingRevenue: number
  bookings: number
  bookingRevenue: number
  slotsUtilization: number
  couponRedemption: number
  repeatBooking: number
  totalRevenue: number
  refundsDisputes: number
}

interface RevenueData {
  date: string
  revenue: number
}

interface Venue {
  venue_id: number
  name: string
  location: string
}

interface Booking {
  booking_id: number
  venue_name: string
  venue_location: string
  sport_name: string
  member_name: string
  booking_date: string
  amount: number
  coupon_code: string | null
  status: string
}

interface Transaction {
  transaction_id: number
  booking_id: number | null
  type: string
  amount: number
  status: string
  transaction_date: string
  venue_name?: string
  member_name?: string
  booking_date?: string
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<'general' | 'booking' | 'coaching'>('general')
  const [data, setData] = useState<DashboardData | null>(null)
  const [revenueData, setRevenueData] = useState<RevenueData[]>([])
  const [venues, setVenues] = useState<Venue[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [coachingTransactions, setCoachingTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedVenue, setSelectedVenue] = useState('all')
  const [selectedSport, setSelectedSport] = useState('all')
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'))

  useEffect(() => {
    fetchDashboardData()
  }, [activeTab, selectedVenue, selectedSport, selectedMonth])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      // Fetch all data
      const [membersRes, bookingsRes, transactionsRes, venuesRes] = await Promise.all([
        axios.get(`${API_URL}/api/members`),
        axios.get(`${API_URL}/api/bookings`),
        axios.get(`${API_URL}/api/transactions`),
        axios.get(`${API_URL}/api/venues`)
      ])

      const members = membersRes.data.data || []
      const allBookings = bookingsRes.data.data || []
      const transactions = transactionsRes.data.data || []
      const allVenues = venuesRes.data.data || []

      setVenues(allVenues)

      // Filter bookings based on selected venue
      let filteredBookings = allBookings
      if (selectedVenue !== 'all') {
        filteredBookings = allBookings.filter((b: any) => b.venue_id === parseInt(selectedVenue))
      }

      setBookings(filteredBookings)

      // Filter coaching transactions
      const coaching = transactions.filter((t: any) => t.type === 'Coaching')
      setCoachingTransactions(coaching)

      // Calculate metrics
      const activeMembers = members.filter((m: any) => m.status === 'Active').length
      const inactiveMembers = members.filter((m: any) => m.status === 'Inactive').length
      
      const trialUsers = members.filter((m: any) => m.is_trial_user).length
      const convertedUsers = members.filter((m: any) => m.converted_from_trial).length
      const trialConversionRate = trialUsers > 0 ? (convertedUsers / trialUsers) * 100 : 0

      const coachingTransactionsFiltered = transactions.filter((t: any) => t.type === 'Coaching')
      const coachingRevenue = coachingTransactionsFiltered
        .filter((t: any) => t.status === 'Success')
        .reduce((sum: number, t: any) => sum + parseFloat(t.amount || 0), 0)

      const bookingTransactions = transactions.filter((t: any) => t.type === 'Booking')
      const bookingRevenue = bookingTransactions
        .filter((t: any) => t.status === 'Success')
        .reduce((sum: number, t: any) => sum + parseFloat(t.amount || 0), 0)

      const totalBookings = filteredBookings.length
      const totalRevenue = coachingRevenue + bookingRevenue

      const refundsDisputes = transactions.filter((t: any) => 
        t.status === 'Refunded' || t.status === 'Dispute'
      ).length

      // Calculate coupon redemption
      const couponBookings = filteredBookings.filter((b: any) => b.coupon_code).length
      
      // Calculate repeat booking rate
      const memberBookings: { [key: number]: number } = {}
      filteredBookings.forEach((b: any) => {
        memberBookings[b.member_id] = (memberBookings[b.member_id] || 0) + 1
      })
      const repeatBookings = Object.values(memberBookings).filter(count => count > 1).length
      const repeatBookingRate = filteredBookings.length > 0 ? (repeatBookings / filteredBookings.length) * 100 : 0

      // Calculate slots utilization (simplified - assuming 8 slots per day)
      const totalSlots = filteredBookings.length * 8 // Simplified calculation
      const slotsUtilization = totalSlots > 0 ? (filteredBookings.length / totalSlots) * 100 : 0

      setData({
        activeMembers,
        inactiveMembers,
        trialConversionRate,
        coachingRevenue,
        bookings: totalBookings,
        bookingRevenue,
        slotsUtilization,
        couponRedemption: couponBookings,
        repeatBooking: repeatBookingRate,
        totalRevenue,
        refundsDisputes
      })

      // Generate revenue chart data
      generateRevenueData(transactions, selectedMonth, selectedVenue)

    } catch (error: any) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateRevenueData = (transactions: any[], month: string, venueFilter: string) => {
    const [year, monthNum] = month.split('-').map(Number)
    const startDate = startOfMonth(new Date(year, monthNum - 1))
    const endDate = endOfMonth(new Date(year, monthNum - 1))
    const days = eachDayOfInterval({ start: startDate, end: endDate })

    const revenueByDate: { [key: string]: number } = {}
    
    transactions.forEach((t: any) => {
      if (t.status === 'Success') {
        const date = format(parseISO(t.transaction_date), 'yyyy-MM-dd')
        if (date.startsWith(month)) {
          // Filter by venue if selected
          if (venueFilter === 'all' || !t.venue_name || t.venue_name) {
            revenueByDate[date] = (revenueByDate[date] || 0) + parseFloat(t.amount || 0)
          }
        }
      }
    })

    const chartData = days.map(day => ({
      date: format(day, 'EEE dd MMM'),
      revenue: revenueByDate[format(day, 'yyyy-MM-dd')] || 0
    }))

    setRevenueData(chartData)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return format(parseISO(dateString), 'dd MMM yyyy, hh:mm a')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'general', label: 'General' },
              { id: 'booking', label: 'Booking' },
              { id: 'coaching', label: 'Coaching' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`${
                  activeTab === tab.id
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Filters */}
        <div className="mb-6 flex justify-end space-x-4">
          <select
            value={selectedVenue}
            onChange={(e) => setSelectedVenue(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
          >
            <option value="all">All Venues</option>
            {venues.map((venue) => (
              <option key={venue.venue_id} value={venue.venue_id}>
                {venue.name}
              </option>
            ))}
          </select>
          <select
            value={selectedSport}
            onChange={(e) => setSelectedSport(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
          >
            <option value="all">All Sports</option>
          </select>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* General Tab */}
        {activeTab === 'general' && data && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
              <MetricCard label="Active Members" value={data.activeMembers} />
              <MetricCard label="Inactive Members" value={data.inactiveMembers} />
              <MetricCard label="Trial Conversion Rate" value={`${data.trialConversionRate.toFixed(2)}%`} />
              <MetricCard label="Coaching Revenue" value={formatCurrency(data.coachingRevenue)} />
              <MetricCard label="Bookings" value={data.bookings} />
              <MetricCard label="Booking Revenue" value={formatCurrency(data.bookingRevenue)} />
              <MetricCard label="Slots Utilization" value={`${data.slotsUtilization.toFixed(2)}%`} />
              <MetricCard label="Coupon Redemption" value={data.couponRedemption} />
              <MetricCard label="Repeat Booking" value={`${data.repeatBooking.toFixed(2)}%`} />
              <MetricCard label="Total Revenue" value={formatCurrency(data.totalRevenue)} />
              <MetricCard label="Refunds & Disputes" value={data.refundsDisputes} />
            </div>

            {/* Revenue Chart */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Revenue - Venues</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: any) => formatCurrency(value)}
                    labelStyle={{ color: '#374151' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    dot={{ fill: '#10b981', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </>
        )}

        {/* Booking Tab */}
        {activeTab === 'booking' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Booking Details</h2>
              <p className="text-sm text-gray-500 mt-1">All booking records</p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Venue</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sport</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booking Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Coupon</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {bookings.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-6 py-4 text-center text-gray-500">
                        No bookings found
                      </td>
                    </tr>
                  ) : (
                    bookings.map((booking) => (
                      <tr key={booking.booking_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{booking.booking_id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{booking.venue_name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking.venue_location}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking.sport_name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking.member_name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(booking.booking_date)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{formatCurrency(booking.amount)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking.coupon_code || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            booking.status === 'Confirmed' ? 'bg-green-100 text-green-800' :
                            booking.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                            booking.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {booking.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Coaching Tab */}
        {activeTab === 'coaching' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Coaching Transactions</h2>
              <p className="text-sm text-gray-500 mt-1">All coaching-related transactions</p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booking ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Venue</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {coachingTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                        No coaching transactions found
                      </td>
                    </tr>
                  ) : (
                    coachingTransactions.map((transaction) => (
                      <tr key={transaction.transaction_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.transaction_id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{transaction.booking_id || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{transaction.venue_name || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{transaction.member_name || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{formatCurrency(transaction.amount)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            transaction.status === 'Success' ? 'bg-green-100 text-green-800' :
                            transaction.status === 'Refunded' ? 'bg-yellow-100 text-yellow-800' :
                            transaction.status === 'Dispute' ? 'bg-red-100 text-red-800' :
                            transaction.status === 'Failed' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {transaction.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {format(parseISO(transaction.transaction_date), 'dd MMM yyyy')}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

function MetricCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
      <p className="text-sm text-gray-600 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  )
}

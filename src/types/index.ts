interface Visit {
  client_name: any,
  _id: string
  check_in_time: string
  comments: string
  createdAt: string
  updatedAt: string
  __v: number
}

interface Client {
  address: any
  phone_number(phone_number: any): unknown
  _id: string
  company_name: string
  contact_person: string
  category: string
  status: string
  visits: Visit[] | string[]
  follow_up_dates: {
    date: string
    user: string
    _id: string
  }[]
  latestVisitDate?: string
}

interface DashboardData {
  user: {
    name: string
    email: string
    role: string
    total_visits: number
    visits: Visit[]
    my_clients: Client[]
    avg_rating: number; // Add this line to fix the error

  }
  stats: {
    totalClients: number
    hotClients: {
      count: number
      list: Client[]
    }
    warmClients: {
      count: number
      list: Client[]
    }
    coldClients: {
      count: number
      list: Client[]
    }
  }
  my_top_clients: Client[]
  visitsThisWeek: Record<string, number>
}

export type { Visit, Client, DashboardData }
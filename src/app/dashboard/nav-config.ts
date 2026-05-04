import { 
  Users, 
  Target, 
  Briefcase, 
  Banknote, 
  LayoutDashboard,
  PlusCircle,
  Package,
  Settings,
  UserPlus,
  BarChart3,
  Network
} from "lucide-react"

export const getNavItems = (role: string) => {
  if (role === "ADMIN") {
    return [
      { icon: LayoutDashboard, label: "Home", href: "/dashboard" },
      { icon: BarChart3, label: "Analytics", href: "/dashboard/analytics" },
      { icon: Package, label: "Catalog", href: "/dashboard/catalog" },
      { icon: Users, label: "Agents", href: "/dashboard/agents" },
      { icon: Network, label: "Network", href: "/dashboard/agents/hierarchy" },
      { icon: Target, label: "Leads", href: "/dashboard/leads" },
      { icon: Briefcase, label: "Deals", href: "/dashboard/deals" },
      { icon: Banknote, label: "Cash", href: "/dashboard/commissions" },
      { icon: UserPlus, label: "Hiring", href: "/dashboard/admin/recruitment" },
      { icon: Settings, label: "Admin", href: "/dashboard/admin/products" },
    ]
  }
  
  if (role === "SALESPERSON") {
    return [
      { icon: LayoutDashboard, label: "Home", href: "/dashboard" },
      { icon: BarChart3, label: "Analytics", href: "/dashboard/analytics" },
      { icon: Package, label: "Catalog", href: "/dashboard/catalog" },
      { icon: Users, label: "Agents", href: "/dashboard/agents" },
      { icon: Network, label: "Network", href: "/dashboard/agents/hierarchy" },
      { icon: Target, label: "Leads", href: "/dashboard/leads" },
      { icon: Briefcase, label: "Deals", href: "/dashboard/deals" },
      { icon: Banknote, label: "Cash", href: "/dashboard/commissions" },
    ]
  }

  // AGENT
  return [
    { icon: LayoutDashboard, label: "Home", href: "/dashboard" },
    { icon: PlusCircle, label: "Add", href: "/dashboard/leads/new" },
    { icon: Target, label: "Leads", href: "/dashboard/leads" },
    { icon: Banknote, label: "Cash", href: "/dashboard/commissions" },
  ]
}

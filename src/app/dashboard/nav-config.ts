import { 
  Users, 
  Target, 
  Briefcase, 
  Banknote, 
  LayoutDashboard,
  PlusCircle
} from "lucide-react"

export const getNavItems = (role: string) => {
  if (role === "ADMIN") {
    return [
      { icon: LayoutDashboard, label: "Home", href: "/dashboard" },
      { icon: Users, label: "Agents", href: "/dashboard/agents" },
      { icon: Target, label: "Leads", href: "/dashboard/leads" },
      { icon: Briefcase, label: "Deals", href: "/dashboard/deals" },
      { icon: Banknote, label: "Cash", href: "/dashboard/commissions" },
    ]
  }
  
  if (role === "SALESPERSON") {
    return [
      { icon: LayoutDashboard, label: "Home", href: "/dashboard" },
      { icon: Users, label: "Agents", href: "/dashboard/agents" },
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

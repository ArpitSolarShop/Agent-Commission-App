import { AbilityBuilder } from '@casl/ability';
import { AppAbility } from './ability';
import { getSubtreeAgentIds } from '../authorization';

export type AuthUser = {
  id: string;
  role: string;
  agentId?: string | null;
};

export async function definePermissionsFor(user: AuthUser, builder: AbilityBuilder<AppAbility>) {
  const { can, cannot } = builder;

  // RBAC: ADMIN has full access
  if (user.role === 'ADMIN') {
    can('manage', 'all');
    return;
  }

  // Base permissions for SALESPERSON and AGENT
  if (user.agentId) {
    // ReBAC: Can read and manage their own profile
    can('read', 'Agent', { id: user.agentId });
    can('update', 'Agent', { id: user.agentId });

    // ReBAC: Can read and manage leads they own
    can('manage', 'Lead', { ownerId: user.agentId });
    
    // ReBAC: Can read and manage deals associated with leads they own
    can('manage', 'Deal', { lead: { is: { ownerId: user.agentId } } });

    // ABAC: Cannot delete deals that are closed
    cannot('delete', 'Deal', { status: 'CLOSED_WON' });
    cannot('delete', 'Deal', { status: 'CLOSED_LOST' });

    // ReBAC: Can read their own commissions
    can('read', 'Commission', { agentId: user.agentId });
  }

  // RBAC: Additional permissions for SALESPERSON
  if (user.role === 'SALESPERSON') {
    if (user.agentId) {
      // Fetch full subtree for arbitrary depth ReBAC
      const subtreeIds = await getSubtreeAgentIds(user.agentId);
      
      // Remove self from subtree if you want only subordinates, but getSubtree includes self.
      // ReBAC: Can read agents in their subtree
      can('read', 'Agent', { id: { in: subtreeIds } });
      
      // ReBAC: Can read leads of subtree agents
      can('read', 'Lead', { ownerId: { in: subtreeIds } });

      // ReBAC: Can read deals of subtree agents' leads
      can('read', 'Deal', { lead: { is: { ownerId: { in: subtreeIds } } } });
    }
  }
}

import { AbilityBuilder, PureAbility } from '@casl/ability';
import { createPrismaAbility, PrismaQuery, Subjects } from '@casl/prisma';
import { User, Agent, Lead, Deal, Commission, LeadAssignment } from '@prisma/client';
import { definePermissionsFor, AuthUser } from './permissions';

export type AppSubjects = Subjects<{
  User: User;
  Agent: Agent;
  Lead: Lead;
  Deal: Deal;
  Commission: Commission;
  LeadAssignment: LeadAssignment;
}> | 'all';

export type AppAbility = PureAbility<[string, AppSubjects], PrismaQuery>;

export async function defineAbilityFor(user?: AuthUser | null): Promise<AppAbility> {
  const builder = new AbilityBuilder<AppAbility>(createPrismaAbility);

  if (user) {
    await definePermissionsFor(user, builder);
  }

  return builder.build();
}

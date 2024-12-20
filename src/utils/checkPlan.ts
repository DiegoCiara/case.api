import Workspace from '@entities/Workspace';
import { Request, Response } from 'express';

export async function checkPlan(workspaceId: string, operation: string) {
  try {
    const workspace = await Workspace.findOne(workspaceId, { relations: ['plans', 'credits'] });
  } catch (error) {}
}


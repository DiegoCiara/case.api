
import Log from '@entities/Log';
import User from '@entities/User';
import { Request, Response } from 'express';


export async function log(table: string, req: Request, operation: string, status: string, data: string, target: any){
  try {
    const user = await User.findOne(req.userId)

    await Log.create({
      table, operation, user, status, data, target,
    }).save()
  } catch (error) {
    console.log(error)
  }
}
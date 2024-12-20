import { NextFunction, Request, Response } from 'express';
import Users from '@entities/User';

export async function ensureOwner(req: Request, res: Response, next: NextFunction): Promise<Response | any> {
  try {
    const id = req.params.userId;

    const user = await Users.findOne(id);

    if (!id) return res.status(403).json({ message: 'You are not authorized' });

    // if (user?.role !== 'OWNER') {
    //   return res.status(403).json({ message: 'You are not authorized' });
    // }

    if (next) return next();
  } catch (error) {
    return res.status(500).json({ message: 'Internal error, try again [admin]' });
  }
}


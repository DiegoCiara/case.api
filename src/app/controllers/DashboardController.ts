import axios from 'axios';
import { Request, Response } from 'express';
import { type } from 'os';
import { v4 as uuidv4 } from 'uuid'; // Importa o método para gerar UUID versão 4
import { sendMessage, generateToken, startSession, getConnectionClient } from '@utils/whatsapp/whatsapp';
import { io } from '@src/socket';
import Thread from '@entities/Thread';
import Workspace from '@entities/Workspace';
import {
  allSales,
  allSalesUser,
  commissionCalculate,
  commissionCalculateUser,
  conversionRateCalc,
  conversionRateCalcUser,
  dealQuantity,
  dealQuantityUser,
  dealUserValues,
  dealValues,
  leadsLength,
  mediumTicket,
  mediumTicketUser,
  quantityCustomersByGroups,
  rankingSaleers,
} from '@utils/dashboard';
import { log } from '@utils/createLog';
import User from '@entities/User';
import Access from '@entities/Access';

interface DashboardInterface {
  date: Date;
  id: string;
}

class DashboardController {
  public async getDashboardAdmin(req: Request, res: Response): Promise<any> {
    const { id, userId, date }: any = req.params;
    try {
      const formattedDate = new Date(date); // Formatar a data em ISO 8601

      if (!id) return res.status(400).json({ message: 'Please send a workspace id' });
      if (!date) return res.status(400).json({ message: 'Please send a workspace id' });

      const workspace = await Workspace.findOne(id);

      const user = await User.findOne(userId)

      const access = await Access.findOne({ where: { workspace, user }})

      if (!workspace) return res.status(404).json({ message: 'Cannot find workspace' });

      let response = null
      if (!isNaN(formattedDate.getTime())) {

      if(access?.role !== 'SELLER'){
        const inprogressValues = await dealValues(workspace, 'INPROGRESS', formattedDate);
        const wonValues = await dealValues(workspace, 'WON', formattedDate);
        const pendingValues = await dealValues(workspace, 'PENDING', formattedDate);
        const lostValues = await dealValues(workspace, 'LOST', formattedDate);
        const inprogressQuantity = await dealQuantity(workspace, 'INPROGRESS', formattedDate);
        const wonQuantity = await dealQuantity(workspace, 'WON', formattedDate);
        const pendingQuantity = await dealQuantity(workspace, 'PENDING', formattedDate);
        const lostQuantity = await dealQuantity(workspace, 'LOST', formattedDate);
        const archivedQuantity = await dealQuantity(workspace, 'ARCHIVED', formattedDate);
        const conversionRate = await conversionRateCalc(workspace, formattedDate);
        const mediumValuePerDeal = await mediumTicket(workspace, formattedDate);
        const leads = await leadsLength(workspace, formattedDate);
        const sales = await allSales(workspace, formattedDate);
        const commission = await commissionCalculate(workspace, formattedDate);
        const customersByGroups = await quantityCustomersByGroups(workspace, formattedDate);
        const usersRank = await rankingSaleers(workspace, formattedDate);
        response = {
          deals: {
            value: {
              inprogress: inprogressValues,
              won: wonValues,
              pending: pendingValues,
              lost: lostValues,
            },
            quantity: {
              inprogress: inprogressQuantity,
              won: wonQuantity,
              pending: pendingQuantity,
              lost: lostQuantity,
              archived: archivedQuantity,
            },
            conversionRate: conversionRate,
            mediumTicket: mediumValuePerDeal,
            allSales: sales,
          },
          commission: {
            toReceived: commission,
          },
          leads: {
            leadsGenerated: leads,
            leadsByGroups: customersByGroups,
          },
          ranking: {
            users: usersRank,
          },
        };

        await log('dashboard', req, 'getDashboardAdmin', 'success', JSON.stringify(workspace), id);
      } else {
        const inprogressValues = await dealUserValues(workspace, 'INPROGRESS', formattedDate, user);
        const wonValues = await dealUserValues(workspace, 'WON', formattedDate, user);
        const pendingValues = await dealUserValues(workspace, 'PENDING', formattedDate, user);
        const lostValues = await dealUserValues(workspace, 'LOST', formattedDate, user);
        const inprogressQuantity = await dealQuantityUser(workspace, 'INPROGRESS', formattedDate, user);
        const wonQuantity = await dealQuantityUser(workspace, 'WON', formattedDate, user);
        const pendingQuantity = await dealQuantityUser(workspace, 'PENDING', formattedDate, user);
        const lostQuantity = await dealQuantityUser(workspace, 'LOST', formattedDate, user);
        const archivedQuantity = await dealQuantityUser(workspace, 'ARCHIVED', formattedDate, user);
        const conversionRate = await conversionRateCalcUser(workspace, formattedDate, user);
        const mediumValuePerDeal = await mediumTicketUser(workspace, formattedDate, user);
        const leads = await leadsLength(workspace, formattedDate);
        const sales = await allSalesUser(workspace, formattedDate, user);
        const commission = await commissionCalculateUser(workspace, formattedDate, user);
        const customersByGroups = await quantityCustomersByGroups(workspace, formattedDate);
        const usersRank = await rankingSaleers(workspace, formattedDate);
        response = {
          deals: {
            value: {
              inprogress: inprogressValues,
              won: wonValues,
              pending: pendingValues,
              lost: lostValues,
            },
            quantity: {
              inprogress: inprogressQuantity,
              won: wonQuantity,
              pending: pendingQuantity,
              lost: lostQuantity,
              archived: archivedQuantity,
            },
            conversionRate: conversionRate,
            mediumTicket: mediumValuePerDeal,
            allSales: sales,
          },
          commission: {
            toReceived: commission,
          },
          leads: {
            leadsGenerated: leads,
            leadsByGroups: customersByGroups,
          },
          ranking: {
            users: usersRank,
          },
        };
      }
    }
    return res.status(200).json(response);
    } catch (error) {
      console.error(error);
      await log('dashboard', req, 'getDashboardAdmin', 'failed', JSON.stringify(error), null);
      return res.status(404).json({ message: 'Conection failed, try again' });
    }
  }
}

export default new DashboardController();


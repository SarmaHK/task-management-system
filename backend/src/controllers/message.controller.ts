import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get messages for a project
export const getProjectMessages = async (req: Request, res: Response): Promise<void> => {
  try {
    const { projectId } = req.params;
    const userId = (req as any).user.id; // Provided by authMiddleware

    // Verify user is part of the project (or admin)
    const userRole = (req as any).user.role;
    
    if (userRole !== 'ADMIN') {
      const isMember = await prisma.projectMember.findFirst({
        where: {
          projectId: parseInt(projectId),
          userId: userId
        }
      });
      
      const isOwner = await prisma.project.findFirst({
        where: {
          id: parseInt(projectId),
          ownerId: userId
        }
      });

      if (!isMember && !isOwner) {
        res.status(403).json({ success: false, message: 'Access denied to this project.' });
        return;
      }
    }

    const messages = await prisma.message.findMany({
      where: {
        projectId: parseInt(projectId)
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    res.status(200).json({ success: true, data: messages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch messages' });
  }
};

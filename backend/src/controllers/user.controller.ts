import { Request, Response } from 'express';
import { prisma } from '../config/database'; 
import { io } from '../server'; // 🟢 1. Import your active WebSockets server

// 1. Deactivate User
export const deactivateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = parseInt(req.params.id);

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { isActive: false }
    });

    // 🟢 2. Broadcast that this user was deactivated so the frontend can log them out
    io.emit('userDeactivated', { userId: updatedUser.id });

    res.status(200).json({
      success: true,
      message: 'User deactivated successfully',
      data: { id: updatedUser.id, email: updatedUser.email, isActive: updatedUser.isActive }
    });
  } catch (error) {
    console.error('Error deactivating user:', error);
    res.status(500).json({ success: false, message: 'Failed to deactivate user' });
  }
};

// 2. Update User Role
export const updateUserRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = parseInt(req.params.id);
    const { roleId } = req.body; // The frontend will send the new roleId

    if (!roleId) {
      res.status(400).json({ success: false, message: 'New roleId is required' });
      return;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { roleId: parseInt(roleId) },
      include: { role: true } // Include the new role details in the response
    });

    // 🟢 3. Broadcast that this user's role changed (e.g., Member -> Admin)
    io.emit('userRoleUpdated', { userId: updatedUser.id, role: updatedUser.role.name });

    res.status(200).json({
      success: true,
      message: 'User role updated successfully',
      data: { id: updatedUser.id, role: updatedUser.role.name }
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ success: false, message: 'Failed to update user role' });
  }
};
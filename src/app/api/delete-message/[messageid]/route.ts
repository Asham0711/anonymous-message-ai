/* eslint-disable @typescript-eslint/no-explicit-any */
import UserModel from '@/models/user.model';
import { getServerSession } from 'next-auth/next';
import connectDB from '@/lib/database';
import { User } from 'next-auth';
import { AuthOptions } from '../../auth/[...nextauth]/options';

export async function DELETE(
  request: Request,
  { params }: { params: { messageid: string } }
) {
  const {messageId} = params;
  await connectDB();
  const session = await getServerSession(AuthOptions);
  const user: User = session?.user;
  if (!session || !user) {
    return Response.json(
      { success: false, message: 'Not authenticated' },
      { status: 401 }
    );
  }

  try {
    const updateResult = await UserModel.updateOne(
      { _id: user._id },
      { $pull: { messages: { _id: messageId } } }
    );

    if (updateResult.modifiedCount === 0) {
      return Response.json(
        { message: 'Message not found or already deleted', success: false },
        { status: 404 }
      );
    }

    return Response.json(
      { message: 'Message deleted', success: true },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting message:', error);
    return Response.json(
      { message: 'Error deleting message', success: false },
      { status: 500 }
    );
  }
}
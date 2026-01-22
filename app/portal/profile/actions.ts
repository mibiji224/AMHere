'use server'

import { prisma } from '@/app/lib/prisma';
import { revalidatePath } from 'next/cache';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function updateProfile(formData: FormData) {
  const userId = formData.get('userId') as string;
  const email = formData.get('email') as string;
  const contactNumber = formData.get('contactNumber') as string;
  
  // 1. Get the uploaded file
  const file = formData.get('photo') as File | null;

  if (!userId) return;

  let photoUrl;

  if (file && file.size > 0) {
    // 2. Fetch User to get their Name for renaming
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return;

    // 3. Create a clean filename: "FirstName_LastName_Timestamp.ext"
    // We remove spaces/special chars to prevent broken links
    const cleanName = `${user.firstName}_${user.lastName}`.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    const extension = file.name.split('.').pop() || 'jpg';
    const filename = `${cleanName}_${Date.now()}.${extension}`;

    // 4. Determine the save path (public/uploads)
    // process.cwd() gets the root folder of your project
    const uploadDir = join(process.cwd(), 'public', 'uploads');

    // Create the directory if it doesn't exist
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (error) {
      console.error('Directory creation failed:', error);
    }

    // 5. Convert File to Buffer and Save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filePath = join(uploadDir, filename);

    await writeFile(filePath, buffer);

    // 6. Set the URL to save in DB (Relative path)
    photoUrl = `/uploads/${filename}`;
  }

  // 7. Update Database Record
  await prisma.user.update({
    where: { id: userId },
    data: {
      email,
      contactNumber,
      // Only update photoUrl if we actually processed a new file
      ...(photoUrl && { photoUrl })
    }
  });

  revalidatePath('/portal/profile');
}
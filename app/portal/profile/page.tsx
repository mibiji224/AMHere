import { prisma } from '@/app/lib/prisma';
import { cookies } from 'next/headers';
import EmployeeLayout from '@/app/components/EmployeeLayout';
import { updateProfile } from './actions';
import { Camera, Mail, Phone, User, Upload } from 'lucide-react';

export default async function ProfilePage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('session_userid')?.value;
  if (!userId) return null;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return null;

  return (
    <EmployeeLayout>
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-black tracking-tight">My Profile</h1>
          <p className="text-muted-foreground">Manage your personal information.</p>
        </div>

        <form action={updateProfile} className="bg-card border border-border rounded-xl p-8 shadow-sm space-y-6">
          <input type="hidden" name="userId" value={user.id} />

          {/* PROFILE PICTURE UPLOAD */}
          <div className="flex flex-col items-center gap-4 pb-6 border-b border-border">
            <div className="relative group">
              <div className="w-32 h-32 bg-secondary rounded-full flex items-center justify-center relative overflow-hidden border-4 border-background shadow-sm">
                {user.photoUrl ? (
                  <img src={user.photoUrl} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User size={48} className="text-muted-foreground" />
                )}
                
                {/* Overlay on Hover */}
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <Camera className="text-white" />
                </div>
              </div>

              {/* Invisible File Input Wrapper */}
              <label className="absolute inset-0 cursor-pointer flex items-center justify-center">
                 <input 
                   type="file" 
                   name="photo" 
                   accept="image/*"
                   className="opacity-0 w-full h-full cursor-pointer" 
                 />
              </label>
            </div>

            <div className="text-center">
              <p className="text-xs font-bold text-muted-foreground uppercase">Tap image to change</p>
            </div>
          </div>

          {/* FIELDS */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-muted-foreground">First Name</label>
                <input disabled value={user.firstName} className="w-full p-2.5 bg-secondary rounded-lg font-medium opacity-70 cursor-not-allowed" />
              </div>
              <div className="space-y-2">
                 <label className="text-sm font-bold text-muted-foreground">Last Name</label>
                 <input disabled value={user.lastName} className="w-full p-2.5 bg-secondary rounded-lg font-medium opacity-70 cursor-not-allowed" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-bold text-muted-foreground">
                <Mail size={14} /> Email Address
              </label>
              <input 
                name="email" 
                type="email" 
                defaultValue={user.email} 
                className="w-full p-2.5 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none transition" 
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-bold text-muted-foreground">
                <Phone size={14} /> Contact Number
              </label>
              <input 
                name="contactNumber" 
                type="tel" 
                defaultValue={user.contactNumber || ''} 
                placeholder="09123456789"
                className="w-full p-2.5 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none transition" 
              />
            </div>
          </div>

          <div className="pt-4">
            <button className="w-full bg-foreground text-background font-bold py-3 rounded-xl hover:opacity-90 transition flex items-center justify-center gap-2">
              <Upload size={16} /> Save Changes
            </button>
          </div>
        </form>
      </div>
    </EmployeeLayout>
  );
}
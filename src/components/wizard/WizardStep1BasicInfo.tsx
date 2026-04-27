import { useRef } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Upload, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ContactFormData } from '../CreateContactSheet';

interface Props {
  form: UseFormReturn<ContactFormData>;
}

export function WizardStep1BasicInfo({ form }: Props) {
  const { register, setValue, watch, formState: { errors } } = form;
  const profileImage = watch('profileImage');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setValue('profileImage', reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Label className="text-sm font-medium text-foreground mb-3 block">Profile image</Label>
        <div
          onClick={() => fileInputRef.current?.click()}
          className="w-24 h-24 rounded-full border-2 border-dashed border-indigo-400 flex items-center justify-center cursor-pointer hover:border-indigo-500 transition-colors overflow-hidden relative"
          style={{ background: profileImage ? 'transparent' : 'rgba(99,102,241,0.1)' }}
        >
          {profileImage ? (
            <img src={profileImage} alt="profile" className="w-full h-full object-cover rounded-full" />
          ) : (
            <div className="flex flex-col items-center gap-1 text-indigo-400">
              <User className="w-8 h-8" />
              <Upload className="w-3 h-3" />
            </div>
          )}
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="firstName" className="text-sm font-medium text-foreground">First name</Label>
            <span className="text-xs text-muted-foreground">Required</span>
          </div>
          <Input
            id="firstName"
            placeholder="John"
            {...register('firstName', { required: true })}
            className={errors.firstName ? 'border-destructive' : ''}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="lastName" className="text-sm font-medium text-foreground">Last name</Label>
            <span className="text-xs text-muted-foreground">Required</span>
          </div>
          <Input
            id="lastName"
            placeholder="Doe"
            {...register('lastName', { required: true })}
            className={errors.lastName ? 'border-destructive' : ''}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email" className="text-sm font-medium text-foreground">Email</Label>
        <Input id="email" type="email" placeholder="john.doe@mail.com" {...register('email')} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="phone" className="text-sm font-medium text-foreground">Phone</Label>
        <Input id="phone" type="tel" placeholder="+44 7700 900123" {...register('phone')} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="livesIn" className="text-sm font-medium text-foreground">Lives in</Label>
        <Input id="livesIn" placeholder="e.g. Shoreditch, London" {...register('livesIn')} />
      </div>
    </div>
  );
}

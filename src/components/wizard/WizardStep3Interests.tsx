import { UseFormReturn } from 'react-hook-form';
import { Heart, Briefcase, GraduationCap } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ContactFormData } from '../CreateContactSheet';

interface Props {
  form: UseFormReturn<ContactFormData>;
}

export function WizardStep3Interests({ form }: Props) {
  const { register } = form;

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm text-muted-foreground mb-2">Additional information</p>

      <Accordion type="multiple" defaultValue={['life']}>
        <AccordionItem value="life" className="border rounded-xl px-4 mb-2">
          <AccordionTrigger className="hover:no-underline py-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                <Heart className="w-4 h-4 text-white" />
              </div>
              <span className="font-medium text-sm">Life and interests</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-4 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-muted-foreground">Tell us about them</Label>
              <Input placeholder="Hint text" {...register('interests.about')} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-muted-foreground">What are their hobbies?</Label>
              <Input placeholder="Hint text" {...register('interests.hobbies')} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-muted-foreground">What is their favourite food?</Label>
              <Input placeholder="Hint text" {...register('interests.favouriteFood')} />
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="career" className="border rounded-xl px-4 mb-2">
          <AccordionTrigger className="hover:no-underline py-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                <Briefcase className="w-4 h-4 text-white" />
              </div>
              <span className="font-medium text-sm">Career and work</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-4 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-muted-foreground">Role</Label>
              <Input placeholder="e.g. Product Manager" {...register('careerAndWork.role')} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-muted-foreground">Company</Label>
              <Input placeholder="e.g. Acme Corp" {...register('careerAndWork.company')} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-muted-foreground">Notes</Label>
              <Input placeholder="Anything else?" {...register('careerAndWork.notes')} />
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="education" className="border rounded-xl px-4">
          <AccordionTrigger className="hover:no-underline py-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                <GraduationCap className="w-4 h-4 text-white" />
              </div>
              <span className="font-medium text-sm">Education</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-4 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-muted-foreground">Institution</Label>
              <Input placeholder="e.g. Oxford University" {...register('education.institution')} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-muted-foreground">Degree</Label>
              <Input placeholder="e.g. BSc Computer Science" {...register('education.degree')} />
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

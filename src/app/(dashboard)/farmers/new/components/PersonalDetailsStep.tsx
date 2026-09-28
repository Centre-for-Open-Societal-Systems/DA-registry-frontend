import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { FormField } from "@/components/ui/FormField";
import { ProfilePhotoUpload } from "@/features/farmers/components/ProfilePhotoUpload";

export function PersonalDetailsStep() {
  return (
    <Card className="min-h-[480px] p-0 shadow-[0px_1px_3px_rgba(0,0,0,0.04)]">
      <div className="border-b border-[#E5E7EB] px-5 py-3.5">
        <h2 className="text-[15px] font-semibold text-[#1a2b3c]">Personal details</h2>
      </div>

      <form className="grid grid-cols-1 gap-8 px-5 py-5 lg:grid-cols-[250px_1fr]" onSubmit={(e) => e.preventDefault()}>
        <ProfilePhotoUpload />

        <div className="grid grid-cols-1 content-start gap-x-6 gap-y-5 md:grid-cols-2 xl:grid-cols-3">
          <FormField label="First Name" htmlFor="firstName" required>
            <Input id="firstName" name="firstName" placeholder="Enter first name" />
          </FormField>
          <FormField label="Last Name" htmlFor="lastName" required>
            <Input id="lastName" name="lastName" placeholder="Enter last name" />
          </FormField>
          <FormField label="Mobile Phone" htmlFor="mobile">
            <Input id="mobile" name="mobile" type="tel" placeholder="+251 9XXXXXXXX" />
          </FormField>

          <FormField label="Email ID" htmlFor="email">
            <Input id="email" name="email" type="email" placeholder="name@example.com" />
          </FormField>
          <FormField label="Date of Birth" htmlFor="dob" required>
            <Input id="dob" name="dob" type="date" />
          </FormField>
          <FormField label="Gender" htmlFor="gender" required>
            <Select id="gender" name="gender" defaultValue="">
              <option value="" disabled>Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </Select>
          </FormField>

          <FormField label="ID Type" htmlFor="idType">
            <Select id="idType" name="idType" defaultValue="">
              <option value="" disabled>Select ID type</option>
              <option value="national_id">National ID (Fayda)</option>
              <option value="kebele_id">Kebele ID</option>
              <option value="passport">Passport</option>
              <option value="driving_license">Driving License</option>
            </Select>
          </FormField>
          <FormField label="ID Number" htmlFor="idNumber">
            <Input id="idNumber" name="idNumber" placeholder="Enter ID number" />
          </FormField>
          <FormField label="Language" htmlFor="language">
            <Select id="language" name="language" defaultValue="en">
              <option value="en">English</option>
              <option value="am">Amharic</option>
              <option value="om">Afaan Oromo</option>
              <option value="ti">Tigrinya</option>
            </Select>
          </FormField>
        </div>
      </form>
    </Card>
  );
}

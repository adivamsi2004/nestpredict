import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const ContactForm = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error("Please fill in all fields");
      return;
    }

    const whatsappText = `Hello, I am contacting you from NestPredict:
*Name*: ${form.name}
*Email*: ${form.email}

*Message*: 
${form.message}`;

    window.open(`https://wa.me/9182475253?text=${encodeURIComponent(whatsappText)}`, '_blank');

    toast.success("Redirecting to WhatsApp...");
    setForm({ name: "", email: "", message: "" });
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-lg space-y-5 rounded-2xl border border-border bg-card p-8 shadow-card">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input id="name" placeholder="Your name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" placeholder="you@example.com" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
      </div>
      <div>
        <Label htmlFor="message">Message</Label>
        <Textarea id="message" rows={4} placeholder="How can we help?" value={form.message} onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))} />
      </div>
      <Button type="submit" className="w-full">Send Message</Button>
    </form>
  );
};

export default ContactForm;

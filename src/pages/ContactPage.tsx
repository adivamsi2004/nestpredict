import ContactForm from "@/components/ContactForm";
import { Mail } from "lucide-react";

const ContactPage = () => (
  <div className="py-16">
    <div className="container">
      <div className="mx-auto mb-10 max-w-xl text-center">
        <div className="mx-auto mb-4 inline-flex rounded-full bg-accent p-3 text-primary">
          <Mail className="h-6 w-6" />
        </div>
        <h1 className="mb-3 font-heading text-3xl font-bold sm:text-4xl">Get In Touch</h1>
        <p className="text-muted-foreground">Have questions or feedback? We would love to hear from you.</p>
      </div>
      <ContactForm />
    </div>
  </div>
);

export default ContactPage;

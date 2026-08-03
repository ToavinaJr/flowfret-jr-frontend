const ContactPage = () => {
  return (
    <div className="max-w-lg mx-auto px-4 py-6 pb-20 md:pb-6">
      <h1 className="text-display text-foreground mb-4">Contact</h1>
      <p className="text-body text-muted-foreground mb-6">
        Questions, feedback, or collaboration ideas — we&apos;d love to hear from
        you.
      </p>
      <a
        href="mailto:hello@fretflow.app"
        className="inline-flex min-h-[44px] items-center px-5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
      >
        Email hello@fretflow.app
      </a>
    </div>
  );
};

export default ContactPage;

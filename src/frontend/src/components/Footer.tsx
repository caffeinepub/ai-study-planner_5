export function Footer() {
  const year = new Date().getFullYear();
  const utmLink = `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`;

  return (
    <footer className="mt-auto border-t border-border/30 py-6">
      <div className="container mx-auto max-w-6xl px-4">
        <p className="text-center text-xs text-muted-foreground">
          © {year}. Built with <span className="text-primary">♥</span> using{" "}
          <a
            href={utmLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary/80 hover:text-primary transition-colors underline-offset-2 hover:underline"
          >
            caffeine.ai
          </a>
        </p>
      </div>
    </footer>
  );
}

from pathlib import Path
import re

ROOT = Path(".")

def read(path):
    return path.read_text()

def write(path, text):
    path.write_text(text)

# ---------------------------------------------------------
# 1. Fix Input.tsx empty interface
# ---------------------------------------------------------

path = ROOT / "src/components/ui/Input.tsx"

if path.exists():
    text = read(path)

    text = text.replace(
        "interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}",
        "type InputProps = React.InputHTMLAttributes<HTMLInputElement>;"
    )

    write(path, text)

# ---------------------------------------------------------
# 2. Fix obvious unescaped apostrophes in JSX text.
#
# We intentionally only target common literal phrases rather
# than doing a dangerous global transformation.
# ---------------------------------------------------------

replacements = {
    "src/components/landing/DashboardPreview.tsx": [
        ("You're", "You&apos;re"),
        ("don't", "don&apos;t"),
        ("can't", "can&apos;t"),
        ("won't", "won&apos;t"),
        ("it's", "it&apos;s"),
        ("Let's", "Let&apos;s"),
    ],

    "src/features/auth/components/ForgotPasswordForm.tsx": [
        ("Don't", "Don&apos;t"),
        ("don't", "don&apos;t"),
        ("can't", "can&apos;t"),
        ("it's", "it&apos;s"),
    ],

    "src/features/auth/components/SignupForm.tsx": [
        ("Don't", "Don&apos;t"),
        ("don't", "don&apos;t"),
        ("can't", "can&apos;t"),
        ("it's", "it&apos;s"),
    ],

    "src/features/notifications/components/NotificationsList.tsx": [
        ("You're", "You&apos;re"),
        ("don't", "don&apos;t"),
        ("can't", "can&apos;t"),
        ("it's", "it&apos;s"),
    ],

    "src/features/onboarding/components/StepBusiness.tsx": [
        ("you're", "you&apos;re"),
        ("You're", "You&apos;re"),
        ("don't", "don&apos;t"),
        ("can't", "can&apos;t"),
        ("it's", "it&apos;s"),
    ],

    "app/page.tsx": [
        ("You're", "You&apos;re"),
        ("you're", "you&apos;re"),
        ("don't", "don&apos;t"),
        ("can't", "can&apos;t"),
        ("it's", "it&apos;s"),
        ("Let's", "Let&apos;s"),
    ],
}

for filename, reps in replacements.items():
    path = ROOT / filename

    if not path.exists():
        continue

    text = read(path)

    for old, new in reps:
        text = text.replace(old, new)

    write(path, text)

# ---------------------------------------------------------
# 3. Remove unused refetch if it is destructured exactly
# ---------------------------------------------------------

path = ROOT / "app/products/page.tsx"

if path.exists():
    text = read(path)

    text = re.sub(
        r"const\s*\{\s*([^}]*?)\brefetch\s*,\s*([^}]*)\}\s*=\s*",
        lambda m: (
            "const { "
            + ", ".join(
                x.strip()
                for x in (m.group(1) + "," + m.group(2)).split(",")
                if x.strip()
            )
            + " } = "
        ),
        text,
    )

    write(path, text)

# ---------------------------------------------------------
# 4. Remove unused continueHref from Toast props only if
#    the declaration is present.
# ---------------------------------------------------------

path = ROOT / "src/components/ui/Toast.tsx"

if path.exists():
    text = read(path)

    text = re.sub(
        r"\s*continueHref\??\s*:\s*string;?",
        "",
        text,
    )

    text = re.sub(
        r",\s*continueHref\b",
        "",
        text,
    )

    write(path, text)

print("Basic deterministic lint fixes applied.")
print()
print("IMPORTANT:")
print("The remaining `any` and setState-in-effect errors require")
print("context-aware fixes and were intentionally NOT mass-edited.")
print()
print("Now run:")
print("  npm run lint")
